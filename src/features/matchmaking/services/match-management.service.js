/**
 * Match Management Service
 * Manages match lifecycle, user feedback, and match quality optimization
 * Provides match notification and interaction tracking
 */

import { supabaseService } from '../../../shared/services/supabase/supabase.service.js';
import { matchmakingAlgorithmService } from './matchmaking-algorithm.service.js';

class MatchManagementService {
    constructor() {
        this.matchesTable = 'matches';
        this.matchFeedbackTable = 'match_feedback';
        this.matchInteractionsTable = 'match_interactions';
        this.notificationsTable = 'notifications';
        this.preferencesTable = 'user_preferences';
    }

    /**
     * Get matches for a user
     */
    async getUserMatches(userId, role = 'buyer', filters = {}) {
        try {
            const userProfile = await supabaseService.select('profiles', {
                eq: { user_id: userId },
                single: true
            });

            if (!userProfile.success) {
                throw new Error('User profile not found');
            }

            let query = {
                order: { column: 'compatibility_score', ascending: false }
            };

            if (role === 'buyer') {
                query.eq = { buyer_id: userProfile.data.id };
                query.select = `
                    *,
                    listing:listings (
                        *,
                        seller:profiles!seller_id (
                            id, first_name, last_name, company, avatar_url
                        )
                    ),
                    feedback:match_feedback (*)
                `;
            } else {
                query.eq = { seller_id: userProfile.data.id };
                query.select = `
                    *,
                    buyer:profiles!buyer_id (
                        id, first_name, last_name, company, avatar_url
                    ),
                    listing:listings (
                        id, title, asking_price, business_type
                    ),
                    feedback:match_feedback (*)
                `;
            }

            // Apply filters
            if (filters.status) {
                query.eq.status = filters.status;
            }

            if (filters.min_score) {
                query.gte = { compatibility_score: filters.min_score };
            }

            if (filters.date_range) {
                query.gte = { ...query.gte, created_at: filters.date_range.start };
                query.lte = { created_at: filters.date_range.end };
            }

            const result = await supabaseService.select(this.matchesTable, query);

            if (result.success) {
                // Enhance matches with interaction data
                for (const match of result.data) {
                    match.interactions = await this.getMatchInteractions(match.id);
                    match.quality_score = await this.calculateMatchQuality(match.id);
                }
            }

            return result;
        } catch (error) {
            console.error('Get user matches error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get specific match details
     */
    async getMatchDetails(matchId) {
        try {
            const result = await supabaseService.select(this.matchesTable, {
                select: `
                    *,
                    buyer:profiles!buyer_id (
                        id, first_name, last_name, company, avatar_url, phone, email
                    ),
                    seller:profiles!seller_id (
                        id, first_name, last_name, company, avatar_url, phone, email
                    ),
                    listing:listings (
                        *,
                        seller:profiles!seller_id (
                            id, first_name, last_name, company
                        )
                    ),
                    feedback:match_feedback (*),
                    interactions:match_interactions (*)
                `,
                eq: { id: matchId },
                single: true
            });

            if (result.success) {
                // Calculate additional metrics
                result.data.quality_score = await this.calculateMatchQuality(matchId);
                result.data.interaction_summary = this.summarizeInteractions(result.data.interactions);
            }

            return result;
        } catch (error) {
            console.error('Get match details error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update match status
     */
    async updateMatchStatus(matchId, newStatus, userId, notes = null) {
        try {
            const updateData = {
                status: newStatus,
                updated_at: new Date().toISOString()
            };

            if (notes) {
                updateData.notes = notes;
            }

            const result = await supabaseService.update(this.matchesTable, updateData, { id: matchId });

            if (result.success) {
                // Log interaction
                await this.logMatchInteraction(matchId, userId, 'status_change', {
                    new_status: newStatus,
                    notes: notes
                });

                // Send notifications if appropriate
                if (['interested', 'contacted', 'meeting_scheduled'].includes(newStatus)) {
                    await this.sendMatchNotification(matchId, newStatus);
                }
            }

            return result;
        } catch (error) {
            console.error('Update match status error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Provide feedback on a match
     */
    async provideFeedback(matchId, userId, feedbackData) {
        try {
            const feedbackRecord = {
                match_id: matchId,
                user_id: userId,
                rating: feedbackData.rating, // 1-5 stars
                feedback_type: feedbackData.type, // 'quality', 'relevance', 'accuracy'
                comments: feedbackData.comments || null,
                helpful: feedbackData.helpful || null, // Boolean
                reasons: feedbackData.reasons || [], // Array of reason codes
                metadata: {
                    timestamp: new Date().toISOString(),
                    ...feedbackData.metadata
                }
            };

            const result = await supabaseService.insert(this.matchFeedbackTable, feedbackRecord);

            if (result.success) {
                // Update match quality score
                await this.updateMatchQualityScore(matchId);

                // Log interaction
                await this.logMatchInteraction(matchId, userId, 'feedback_provided', {
                    rating: feedbackData.rating,
                    feedback_type: feedbackData.type
                });

                // Update algorithm learning data
                await this.updateAlgorithmLearning(matchId, feedbackData);
            }

            return result;
        } catch (error) {
            console.error('Provide feedback error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Generate new matches for a user
     */
    async generateMatches(userId, role = 'buyer', force = false) {
        try {
            const userProfile = await supabaseService.select('profiles', {
                eq: { user_id: userId },
                single: true
            });

            if (!userProfile.success) {
                throw new Error('User profile not found');
            }

            // Check if we should generate new matches
            if (!force) {
                const recentMatches = await supabaseService.select(this.matchesTable, {
                    eq: role === 'buyer' ? { buyer_id: userProfile.data.id } : { seller_id: userProfile.data.id },
                    gte: { created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() }, // Last 24 hours
                    count: 'exact'
                });

                if (recentMatches.success && recentMatches.count > 0) {
                    return { success: false, error: 'Matches already generated recently. Use force=true to regenerate.' };
                }
            }

            let result;
            if (role === 'buyer') {
                result = await matchmakingAlgorithmService.generateBuyerMatches(userProfile.data.id);
            } else {
                // For sellers, we need a specific listing ID
                const activeListings = await supabaseService.select('listings', {
                    eq: { seller_id: userProfile.data.id, status: 'active' },
                    limit: 1
                });

                if (activeListings.success && activeListings.data.length > 0) {
                    result = await matchmakingAlgorithmService.generateSellerMatches(
                        userProfile.data.id, 
                        activeListings.data[0].id
                    );
                } else {
                    return { success: false, error: 'No active listings found for seller' };
                }
            }

            if (result.success) {
                // Send notification about new matches
                await this.sendNewMatchesNotification(userId, result.data.matches.length);
            }

            return result;
        } catch (error) {
            console.error('Generate matches error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get match statistics for a user
     */
    async getMatchStatistics(userId, role = 'buyer') {
        try {
            const userProfile = await supabaseService.select('profiles', {
                eq: { user_id: userId },
                single: true
            });

            if (!userProfile.success) {
                throw new Error('User profile not found');
            }

            const userIdField = role === 'buyer' ? 'buyer_id' : 'seller_id';
            
            // Get all matches for user
            const allMatches = await supabaseService.select(this.matchesTable, {
                eq: { [userIdField]: userProfile.data.id }
            });

            if (!allMatches.success) {
                return allMatches;
            }

            const matches = allMatches.data;
            
            // Calculate statistics
            const stats = {
                total_matches: matches.length,
                average_score: matches.length > 0 ? 
                    Math.round(matches.reduce((sum, m) => sum + m.compatibility_score, 0) / matches.length) : 0,
                status_breakdown: this.groupByStatus(matches),
                score_distribution: this.getScoreDistribution(matches),
                recent_matches: matches.filter(m => 
                    new Date(m.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length,
                high_quality_matches: matches.filter(m => m.compatibility_score >= 80).length,
                contacted_matches: matches.filter(m => 
                    ['contacted', 'meeting_scheduled', 'in_negotiation'].includes(m.status)
                ).length
            };

            // Get feedback statistics
            const feedbackStats = await this.getFeedbackStatistics(userProfile.data.id);
            stats.feedback = feedbackStats;

            return { success: true, data: stats };
        } catch (error) {
            console.error('Get match statistics error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update user preferences based on match feedback
     */
    async updatePreferencesFromFeedback(userId) {
        try {
            // Get user's match feedback
            const userProfile = await supabaseService.select('profiles', {
                eq: { user_id: userId },
                single: true
            });

            if (!userProfile.success) {
                throw new Error('User profile not found');
            }

            const feedback = await supabaseService.select(this.matchFeedbackTable, {
                eq: { user_id: userProfile.data.id },
                order: { column: 'created_at', ascending: false },
                limit: 50 // Recent feedback
            });

            if (!feedback.success || feedback.data.length === 0) {
                return { success: false, error: 'No feedback data available' };
            }

            // Analyze feedback patterns
            const preferences = this.analyzePreferencesFromFeedback(feedback.data);

            // Update user preferences
            const updateResult = await supabaseService.upsert(this.preferencesTable, {
                user_id: userProfile.data.id,
                ...preferences,
                updated_at: new Date().toISOString()
            });

            return updateResult;
        } catch (error) {
            console.error('Update preferences from feedback error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Helper methods
     */
    async getMatchInteractions(matchId) {
        try {
            const result = await supabaseService.select(this.matchInteractionsTable, {
                eq: { match_id: matchId },
                order: { column: 'created_at', ascending: false }
            });
            return result.success ? result.data : [];
        } catch (error) {
            return [];
        }
    }

    async calculateMatchQuality(matchId) {
        try {
            // Get match feedback
            const feedback = await supabaseService.select(this.matchFeedbackTable, {
                eq: { match_id: matchId }
            });

            if (!feedback.success || feedback.data.length === 0) {
                return null; // No feedback yet
            }

            // Calculate average rating
            const avgRating = feedback.data.reduce((sum, f) => sum + f.rating, 0) / feedback.data.length;
            return Math.round(avgRating * 20); // Convert 1-5 scale to 0-100
        } catch (error) {
            return null;
        }
    }

    summarizeInteractions(interactions) {
        if (!interactions || interactions.length === 0) {
            return { total: 0, last_interaction: null, types: {} };
        }

        const summary = {
            total: interactions.length,
            last_interaction: interactions[0]?.created_at,
            types: {}
        };

        interactions.forEach(interaction => {
            summary.types[interaction.interaction_type] = 
                (summary.types[interaction.interaction_type] || 0) + 1;
        });

        return summary;
    }

    async logMatchInteraction(matchId, userId, interactionType, metadata = {}) {
        try {
            await supabaseService.insert(this.matchInteractionsTable, {
                match_id: matchId,
                user_id: userId,
                interaction_type: interactionType,
                metadata: metadata,
                created_at: new Date().toISOString()
            });
        } catch (error) {
            console.error('Log match interaction error:', error);
        }
    }

    async sendMatchNotification(matchId, status) {
        try {
            const match = await this.getMatchDetails(matchId);
            if (!match.success) return;

            const matchData = match.data;
            const notifications = [];

            // Notify buyer
            notifications.push({
                user_id: matchData.buyer.user_id,
                type: 'match_update',
                title: 'Match Update',
                message: `Your match with ${matchData.listing.title} has been updated to ${status}`,
                data: { match_id: matchId, status: status }
            });

            // Notify seller
            notifications.push({
                user_id: matchData.seller.user_id,
                type: 'match_update',
                title: 'Match Update',
                message: `Your match with ${matchData.buyer.first_name} ${matchData.buyer.last_name} has been updated to ${status}`,
                data: { match_id: matchId, status: status }
            });

            await supabaseService.insert(this.notificationsTable, notifications);
        } catch (error) {
            console.error('Send match notification error:', error);
        }
    }

    async sendNewMatchesNotification(userId, matchCount) {
        try {
            await supabaseService.insert(this.notificationsTable, {
                user_id: userId,
                type: 'new_matches',
                title: 'New Matches Available',
                message: `You have ${matchCount} new potential matches to review`,
                data: { match_count: matchCount }
            });
        } catch (error) {
            console.error('Send new matches notification error:', error);
        }
    }

    groupByStatus(matches) {
        const statusGroups = {};
        matches.forEach(match => {
            statusGroups[match.status] = (statusGroups[match.status] || 0) + 1;
        });
        return statusGroups;
    }

    getScoreDistribution(matches) {
        const distribution = {
            '90-100': 0,
            '80-89': 0,
            '70-79': 0,
            '60-69': 0,
            'below-60': 0
        };

        matches.forEach(match => {
            const score = match.compatibility_score;
            if (score >= 90) distribution['90-100']++;
            else if (score >= 80) distribution['80-89']++;
            else if (score >= 70) distribution['70-79']++;
            else if (score >= 60) distribution['60-69']++;
            else distribution['below-60']++;
        });

        return distribution;
    }

    async getFeedbackStatistics(userId) {
        try {
            const feedback = await supabaseService.select(this.matchFeedbackTable, {
                eq: { user_id: userId }
            });

            if (!feedback.success || feedback.data.length === 0) {
                return { total: 0, average_rating: 0, helpful_percentage: 0 };
            }

            const feedbackData = feedback.data;
            const avgRating = feedbackData.reduce((sum, f) => sum + f.rating, 0) / feedbackData.length;
            const helpfulCount = feedbackData.filter(f => f.helpful === true).length;
            const helpfulPercentage = (helpfulCount / feedbackData.length) * 100;

            return {
                total: feedbackData.length,
                average_rating: Math.round(avgRating * 10) / 10,
                helpful_percentage: Math.round(helpfulPercentage)
            };
        } catch (error) {
            return { total: 0, average_rating: 0, helpful_percentage: 0 };
        }
    }

    analyzePreferencesFromFeedback(feedbackData) {
        // Analyze feedback to extract preference patterns
        // This would implement machine learning logic to improve matching
        // For now, return basic analysis
        
        const preferences = {};
        
        // Analyze highly rated matches to extract preferences
        const highRatedFeedback = feedbackData.filter(f => f.rating >= 4);
        
        if (highRatedFeedback.length > 0) {
            // Extract common patterns from high-rated matches
            // This would be more sophisticated in a real implementation
            preferences.learning_updated = true;
            preferences.last_analysis = new Date().toISOString();
        }
        
        return preferences;
    }

    async updateMatchQualityScore(matchId) {
        try {
            const qualityScore = await this.calculateMatchQuality(matchId);
            if (qualityScore !== null) {
                await supabaseService.update(this.matchesTable, {
                    quality_score: qualityScore,
                    updated_at: new Date().toISOString()
                }, { id: matchId });
            }
        } catch (error) {
            console.error('Update match quality score error:', error);
        }
    }

    async updateAlgorithmLearning(matchId, feedbackData) {
        // This would update machine learning models based on feedback
        // For now, just log the learning data
        try {
            await supabaseService.insert('algorithm_learning_data', {
                match_id: matchId,
                feedback_rating: feedbackData.rating,
                feedback_type: feedbackData.type,
                feedback_reasons: feedbackData.reasons,
                created_at: new Date().toISOString()
            });
        } catch (error) {
            console.error('Update algorithm learning error:', error);
        }
    }
}

// Export singleton instance
export const matchManagementService = new MatchManagementService();
