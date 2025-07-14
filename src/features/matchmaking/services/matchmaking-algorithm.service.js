/**
 * Matchmaking Algorithm Service
 * Intelligent buyer-seller matching based on compatibility scoring
 * Provides automated match generation with quality scoring and preferences
 */

import { supabaseService } from '../../../shared/services/supabase/supabase.service.js';

class MatchmakingAlgorithmService {
    constructor() {
        this.matchesTable = 'matches';
        this.preferencesTable = 'user_preferences';
        this.matchScoresTable = 'match_scores';
        this.notificationsTable = 'notifications';
        
        // Scoring weights for different criteria
        this.scoringWeights = {
            business_type: 0.25,
            price_range: 0.20,
            location: 0.15,
            experience: 0.15,
            timeline: 0.10,
            financing: 0.10,
            revenue_range: 0.05
        };
    }

    /**
     * Generate matches for a buyer
     */
    async generateBuyerMatches(buyerId, limit = 10) {
        try {
            // Get buyer profile and preferences
            const buyerData = await this.getBuyerProfile(buyerId);
            if (!buyerData.success) {
                return buyerData;
            }

            const buyer = buyerData.data;

            // Get active listings that match basic criteria
            const candidateListings = await this.getCandidateListings(buyer);
            if (!candidateListings.success) {
                return candidateListings;
            }

            // Score each listing for compatibility
            const scoredMatches = [];
            for (const listing of candidateListings.data) {
                const score = await this.calculateCompatibilityScore(buyer, listing);
                if (score >= 60) { // Minimum compatibility threshold
                    scoredMatches.push({
                        listing: listing,
                        score: score,
                        reasons: this.getMatchReasons(buyer, listing, score)
                    });
                }
            }

            // Sort by score and take top matches
            scoredMatches.sort((a, b) => b.score - a.score);
            const topMatches = scoredMatches.slice(0, limit);

            // Create match records in database
            const matchRecords = [];
            for (const match of topMatches) {
                const matchRecord = await this.createMatchRecord({
                    buyer_id: buyerId,
                    seller_id: match.listing.seller_id,
                    listing_id: match.listing.id,
                    compatibility_score: match.score,
                    match_reasons: match.reasons,
                    algorithm_version: '1.0',
                    generated_at: new Date().toISOString()
                });

                if (matchRecord.success) {
                    matchRecords.push({
                        ...matchRecord.data,
                        listing: match.listing,
                        score: match.score,
                        reasons: match.reasons
                    });
                }
            }

            return {
                success: true,
                data: {
                    buyer_id: buyerId,
                    matches: matchRecords,
                    total_candidates: candidateListings.data.length,
                    qualified_matches: scoredMatches.length,
                    generated_at: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('Generate buyer matches error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Generate matches for a seller
     */
    async generateSellerMatches(sellerId, listingId, limit = 10) {
        try {
            // Get seller listing details
            const listingData = await this.getListingDetails(listingId);
            if (!listingData.success) {
                return listingData;
            }

            const listing = listingData.data;

            // Get potential buyers based on preferences and activity
            const candidateBuyers = await this.getCandidateBuyers(listing);
            if (!candidateBuyers.success) {
                return candidateBuyers;
            }

            // Score each buyer for compatibility
            const scoredMatches = [];
            for (const buyer of candidateBuyers.data) {
                const score = await this.calculateCompatibilityScore(buyer, listing);
                if (score >= 60) { // Minimum compatibility threshold
                    scoredMatches.push({
                        buyer: buyer,
                        score: score,
                        reasons: this.getMatchReasons(buyer, listing, score)
                    });
                }
            }

            // Sort by score and take top matches
            scoredMatches.sort((a, b) => b.score - a.score);
            const topMatches = scoredMatches.slice(0, limit);

            // Create match records in database
            const matchRecords = [];
            for (const match of topMatches) {
                const matchRecord = await this.createMatchRecord({
                    buyer_id: match.buyer.id,
                    seller_id: sellerId,
                    listing_id: listingId,
                    compatibility_score: match.score,
                    match_reasons: match.reasons,
                    algorithm_version: '1.0',
                    generated_at: new Date().toISOString()
                });

                if (matchRecord.success) {
                    matchRecords.push({
                        ...matchRecord.data,
                        buyer: match.buyer,
                        score: match.score,
                        reasons: match.reasons
                    });
                }
            }

            return {
                success: true,
                data: {
                    seller_id: sellerId,
                    listing_id: listingId,
                    matches: matchRecords,
                    total_candidates: candidateBuyers.data.length,
                    qualified_matches: scoredMatches.length,
                    generated_at: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('Generate seller matches error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Calculate compatibility score between buyer and listing
     */
    async calculateCompatibilityScore(buyer, listing) {
        try {
            let totalScore = 0;
            const scores = {};

            // Business type compatibility
            scores.business_type = this.scoreBusinessTypeMatch(buyer, listing);
            
            // Price range compatibility
            scores.price_range = this.scorePriceRangeMatch(buyer, listing);
            
            // Location compatibility
            scores.location = this.scoreLocationMatch(buyer, listing);
            
            // Experience compatibility
            scores.experience = this.scoreExperienceMatch(buyer, listing);
            
            // Timeline compatibility
            scores.timeline = this.scoreTimelineMatch(buyer, listing);
            
            // Financing compatibility
            scores.financing = this.scoreFinancingMatch(buyer, listing);
            
            // Revenue range compatibility
            scores.revenue_range = this.scoreRevenueRangeMatch(buyer, listing);

            // Calculate weighted total score
            for (const [criterion, score] of Object.entries(scores)) {
                totalScore += score * this.scoringWeights[criterion];
            }

            return Math.round(totalScore);
        } catch (error) {
            console.error('Calculate compatibility score error:', error);
            return 0;
        }
    }

    /**
     * Scoring methods for different criteria
     */
    scoreBusinessTypeMatch(buyer, listing) {
        const buyerTypes = buyer.preferences?.business_types || [];
        const listingType = listing.business_type;
        
        if (buyerTypes.includes(listingType)) return 100;
        if (buyerTypes.includes('any') || buyerTypes.length === 0) return 70;
        
        // Check for related business types
        const relatedTypes = this.getRelatedBusinessTypes(listingType);
        if (buyerTypes.some(type => relatedTypes.includes(type))) return 80;
        
        return 30;
    }

    scorePriceRangeMatch(buyer, listing) {
        const buyerMin = buyer.preferences?.price_min || 0;
        const buyerMax = buyer.preferences?.price_max || Infinity;
        const listingPrice = listing.asking_price;

        if (listingPrice >= buyerMin && listingPrice <= buyerMax) return 100;
        
        // Calculate how far outside the range
        const overagePercentage = listingPrice > buyerMax ? 
            ((listingPrice - buyerMax) / buyerMax) * 100 : 0;
        const underagePercentage = listingPrice < buyerMin ? 
            ((buyerMin - listingPrice) / buyerMin) * 100 : 0;
        
        const deviation = Math.max(overagePercentage, underagePercentage);
        
        if (deviation <= 10) return 90;
        if (deviation <= 20) return 70;
        if (deviation <= 30) return 50;
        return 20;
    }

    scoreLocationMatch(buyer, listing) {
        const buyerLocations = buyer.preferences?.locations || [];
        const listingLocation = listing.location;
        const listingCity = listing.city;
        const listingState = listing.state;

        // Exact location match
        if (buyerLocations.includes(listingLocation)) return 100;
        if (buyerLocations.includes(listingCity)) return 95;
        if (buyerLocations.includes(listingState)) return 80;
        
        // Check for nearby locations or "any" preference
        if (buyerLocations.includes('any') || buyerLocations.length === 0) return 70;
        
        // Check for regional matches (e.g., DFW area)
        const buyerRegions = this.extractRegions(buyerLocations);
        const listingRegion = this.getLocationRegion(listingLocation);
        if (buyerRegions.includes(listingRegion)) return 85;
        
        return 40;
    }

    scoreExperienceMatch(buyer, listing) {
        const buyerExperience = buyer.experience_years || 0;
        const listingComplexity = this.assessBusinessComplexity(listing);
        
        // Match experience level to business complexity
        if (listingComplexity === 'low' && buyerExperience >= 0) return 100;
        if (listingComplexity === 'medium' && buyerExperience >= 2) return 100;
        if (listingComplexity === 'high' && buyerExperience >= 5) return 100;
        
        // Partial matches
        if (listingComplexity === 'medium' && buyerExperience >= 1) return 80;
        if (listingComplexity === 'high' && buyerExperience >= 3) return 70;
        
        return 50;
    }

    scoreTimelineMatch(buyer, listing) {
        const buyerTimeline = buyer.preferences?.timeline || 'flexible';
        const sellerTimeline = listing.timeline || 'flexible';
        
        if (buyerTimeline === sellerTimeline) return 100;
        if (buyerTimeline === 'flexible' || sellerTimeline === 'flexible') return 90;
        
        // Timeline compatibility matrix
        const timelineCompatibility = {
            'immediate': { '30_days': 80, '60_days': 60, '90_days': 40 },
            '30_days': { 'immediate': 70, '60_days': 90, '90_days': 80 },
            '60_days': { 'immediate': 50, '30_days': 80, '90_days': 90 },
            '90_days': { 'immediate': 30, '30_days': 70, '60_days': 80 }
        };
        
        return timelineCompatibility[buyerTimeline]?.[sellerTimeline] || 60;
    }

    scoreFinancingMatch(buyer, listing) {
        const buyerFinancing = buyer.financing_details || {};
        const listingPrice = listing.asking_price;
        
        // Check if buyer has adequate financing
        const totalFinancing = (buyerFinancing.cash_available || 0) + 
                              (buyerFinancing.loan_approved || 0);
        
        if (totalFinancing >= listingPrice) return 100;
        if (totalFinancing >= listingPrice * 0.9) return 90;
        if (totalFinancing >= listingPrice * 0.8) return 70;
        if (totalFinancing >= listingPrice * 0.7) return 50;
        
        return 20;
    }

    scoreRevenueRangeMatch(buyer, listing) {
        const buyerRevenueMin = buyer.preferences?.revenue_min || 0;
        const buyerRevenueMax = buyer.preferences?.revenue_max || Infinity;
        const listingRevenue = listing.annual_revenue || 0;
        
        if (listingRevenue >= buyerRevenueMin && listingRevenue <= buyerRevenueMax) return 100;
        
        // Partial matches
        const deviation = listingRevenue > buyerRevenueMax ? 
            ((listingRevenue - buyerRevenueMax) / buyerRevenueMax) * 100 :
            ((buyerRevenueMin - listingRevenue) / buyerRevenueMin) * 100;
        
        if (deviation <= 20) return 80;
        if (deviation <= 40) return 60;
        return 40;
    }

    /**
     * Get match reasons for explanation
     */
    getMatchReasons(buyer, listing, score) {
        const reasons = [];
        
        if (this.scoreBusinessTypeMatch(buyer, listing) >= 80) {
            reasons.push('Business type alignment');
        }
        
        if (this.scorePriceRangeMatch(buyer, listing) >= 80) {
            reasons.push('Price range compatibility');
        }
        
        if (this.scoreLocationMatch(buyer, listing) >= 80) {
            reasons.push('Location preference match');
        }
        
        if (this.scoreFinancingMatch(buyer, listing) >= 80) {
            reasons.push('Adequate financing available');
        }
        
        if (this.scoreExperienceMatch(buyer, listing) >= 80) {
            reasons.push('Experience level appropriate');
        }
        
        if (score >= 90) {
            reasons.push('Exceptional overall compatibility');
        } else if (score >= 80) {
            reasons.push('Strong overall compatibility');
        } else if (score >= 70) {
            reasons.push('Good overall compatibility');
        }
        
        return reasons;
    }

    /**
     * Helper methods for data retrieval and processing
     */
    async getBuyerProfile(buyerId) {
        try {
            return await supabaseService.select('profiles', {
                select: `
                    *,
                    preferences:user_preferences (*)
                `,
                eq: { id: buyerId },
                single: true
            });
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getListingDetails(listingId) {
        try {
            return await supabaseService.select('listings', {
                select: `
                    *,
                    seller:profiles!seller_id (
                        id, first_name, last_name, company
                    )
                `,
                eq: { id: listingId },
                single: true
            });
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getCandidateListings(buyer) {
        try {
            // Get active listings that match basic criteria
            let query = {
                eq: { status: 'active' },
                order: { column: 'created_at', ascending: false },
                limit: 100 // Limit candidates for performance
            };

            // Apply basic filters based on buyer preferences
            if (buyer.preferences?.price_max) {
                query.lte = { asking_price: buyer.preferences.price_max * 1.2 }; // 20% buffer
            }

            return await supabaseService.select('listings', {
                select: `
                    *,
                    seller:profiles!seller_id (
                        id, first_name, last_name, company
                    )
                `,
                ...query
            });
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getCandidateBuyers(listing) {
        try {
            // Get active buyers who might be interested
            return await supabaseService.select('profiles', {
                select: `
                    *,
                    preferences:user_preferences (*)
                `,
                eq: { role: 'buyer', is_active: true },
                order: { column: 'last_active_at', ascending: false },
                limit: 50 // Limit candidates for performance
            });
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async createMatchRecord(matchData) {
        try {
            return await supabaseService.insert(this.matchesTable, matchData);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Utility methods
     */
    getRelatedBusinessTypes(businessType) {
        const relatedTypes = {
            'restaurant': ['food_service', 'hospitality', 'retail'],
            'retail': ['e_commerce', 'restaurant', 'service'],
            'manufacturing': ['distribution', 'wholesale', 'industrial'],
            'service': ['consulting', 'professional', 'retail'],
            'technology': ['software', 'consulting', 'service'],
            'healthcare': ['medical', 'wellness', 'service']
        };
        
        return relatedTypes[businessType] || [];
    }

    assessBusinessComplexity(listing) {
        const revenue = listing.annual_revenue || 0;
        const employees = listing.employees || 0;
        const businessType = listing.business_type;
        
        // Complex business types
        const complexTypes = ['manufacturing', 'technology', 'healthcare', 'financial'];
        
        if (complexTypes.includes(businessType) || revenue > 5000000 || employees > 50) {
            return 'high';
        } else if (revenue > 1000000 || employees > 10) {
            return 'medium';
        }
        
        return 'low';
    }

    extractRegions(locations) {
        const regions = [];
        locations.forEach(location => {
            if (location.includes('DFW') || location.includes('Dallas') || location.includes('Fort Worth')) {
                regions.push('DFW');
            }
            // Add more regional mappings as needed
        });
        return regions;
    }

    getLocationRegion(location) {
        if (location.includes('Dallas') || location.includes('Fort Worth') || location.includes('DFW')) {
            return 'DFW';
        }
        // Add more regional mappings as needed
        return 'other';
    }
}

// Export singleton instance
export const matchmakingAlgorithmService = new MatchmakingAlgorithmService();
