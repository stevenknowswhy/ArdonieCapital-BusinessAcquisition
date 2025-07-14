
import { supabaseService } from '../../../shared/services/supabase/index.js';

// GDPR Compliance utilities
const GDPRCompliance = {
    requestConsent: (purpose) => {
        return new Promise((resolve) => {
            // Implementation for consent request
            const consent = confirm(`Do you consent to data processing for ${purpose}?`);
            resolve(consent);
        });
    },
    
    deleteUserData: (userId) => {
        // Implementation for right to erasure
        console.log(`Deleting data for user ${userId}`);
    },
    
    exportUserData: (userId) => {
        // Implementation for data portability
        console.log(`Exporting data for user ${userId}`);
    }
};

/**
 * Matchmaking Service
 * Handles buyer-seller matching, compatibility scoring, and recommendations
 */

export class MatchmakingService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.baseUrl = '/api/matchmaking';
        this.isInitialized = false;
        this.scoreWeights = {
            location: 0.3,
            budget: 0.25,
            experience: 0.2,
            timeline: 0.15,
            preferences: 0.1
        };
    }

    /**
     * Initialize the matchmaking service
     */
    async init() {
        if (this.isInitialized) return;
        
        try {
            console.log('Initializing Matchmaking Service...');
            this.isInitialized = true;
            console.log('✅ Matchmaking Service initialized successfully');
        } catch (error) {
            console.error('❌ Matchmaking Service initialization failed:', error);
            throw error;
        }
    }

    /**
     * Get matches for a user (buyer or seller)
     */
    async getMatches(userId, userType, options = {}) {
        const {
            page = 1,
            limit = 12,
            minCompatibility = 0.7,
            sortBy = 'compatibility',
            filters = {}
        } = options;

        const cacheKey = `matches_${userId}_${JSON.stringify(options)}`;
        
        // Check cache first
        const cached = this.getCachedData(cacheKey);
        if (cached) {
            return { success: true, data: cached.data, total: cached.total, fromCache: true };
        }

        try {
            // Get current user profile
            const userResponse = await supabaseService.getCurrentUser();
            if (!userResponse.success || !userResponse.user) {
                throw new Error('User must be authenticated to view matches');
            }

            // Get user profile
            const profileResponse = await supabaseService.select('profiles', {
                eq: { user_id: userResponse.user.id }
            });

            if (!profileResponse.success || profileResponse.data.length === 0) {
                throw new Error('User profile not found');
            }

            const userProfile = profileResponse.data[0];

            // Build query options for matches
            const queryOptions = {
                select: `
                    *,
                    buyer_profile:profiles!buyer_id (
                        first_name,
                        last_name,
                        company,
                        role,
                        budget_min,
                        budget_max,
                        preferred_industries,
                        preferred_locations
                    ),
                    seller_profile:profiles!seller_id (
                        first_name,
                        last_name,
                        company,
                        role
                    ),
                    listing:listings!listing_id (
                        title,
                        asking_price,
                        business_type,
                        industry,
                        location,
                        city,
                        state
                    )
                `,
                eq: {},
                order: { column: 'compatibility_score', ascending: false }
            };

            // Filter by user type
            if (userType === 'buyer') {
                queryOptions.eq.buyer_id = userProfile.id;
            } else if (userType === 'seller') {
                queryOptions.eq.seller_id = userProfile.id;
            }

            // Apply compatibility filter
            if (minCompatibility > 0) {
                // Note: Supabase doesn't have a direct gte filter in our simple service
                // We'll filter this in JavaScript for now
            }

            // Apply pagination
            if (page && limit) {
                const offset = (page - 1) * limit;
                queryOptions.range = {
                    from: offset,
                    to: offset + limit - 1
                };
            }

            const response = await supabaseService.select('matches', queryOptions);

            if (response.success) {
                let matches = response.data;

                // Filter by compatibility score if needed
                if (minCompatibility > 0) {
                    matches = matches.filter(match =>
                        (match.compatibility_score || 0) >= minCompatibility
                    );
                }

                // Calculate enhanced compatibility scores and reasons
                const enhancedMatches = matches.map(match => ({
                    ...match,
                    compatibilityScore: match.compatibility_score || this.calculateCompatibilityScore(
                        userProfile,
                        userType === 'buyer' ? match.seller_profile : match.buyer_profile,
                        match.listing
                    ),
                    matchReasons: this.generateMatchReasons(
                        userProfile,
                        userType === 'buyer' ? match.seller_profile : match.buyer_profile,
                        match.listing
                    )
                }));

                const finalResult = {
                    data: enhancedMatches,
                    total: enhancedMatches.length,
                    userProfile: userProfile
                };

                // Cache the result
                this.setCachedData(cacheKey, finalResult);

                return {
                    success: true,
                    ...finalResult,
                    page,
                    limit,
                    totalPages: Math.ceil(enhancedMatches.length / limit)
                };
            } else {
                throw new Error(response.error || 'Failed to fetch matches');
            }

        } catch (error) {
            console.error('Error fetching matches:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    /**
     * Calculate compatibility score between two profiles
     */
    calculateCompatibilityScore(buyerProfile, sellerProfile, listing = null) {
        let totalScore = 0;
        let totalWeight = 0;

        // Location compatibility
        const buyerLocation = buyerProfile.location || '';
        const listingLocation = (listing && listing.location) || sellerProfile.location || '';
        const locationScore = this.calculateLocationCompatibility(buyerLocation, listingLocation);
        totalScore += locationScore * this.scoreWeights.location;
        totalWeight += this.scoreWeights.location;

        // Budget compatibility
        const buyerBudgetMax = buyerProfile.budget_max || 0;
        const askingPrice = (listing && listing.asking_price) || 0;
        const budgetScore = this.calculateBudgetCompatibility(buyerBudgetMax, askingPrice);
        totalScore += budgetScore * this.scoreWeights.budget;
        totalWeight += this.scoreWeights.budget;

        // Experience compatibility
        const buyerExperience = buyerProfile.experience_years || 0;
        const businessComplexity = this.estimateBusinessComplexity(listing);
        const experienceScore = this.calculateExperienceCompatibility(buyerExperience, businessComplexity);
        totalScore += experienceScore * this.scoreWeights.experience;
        totalWeight += this.scoreWeights.experience;

        // Industry compatibility
        const buyerIndustries = buyerProfile.preferred_industries || [];
        const listingIndustry = (listing && listing.industry) || '';
        const industryScore = this.calculateIndustryCompatibility(buyerIndustries, listingIndustry);
        totalScore += industryScore * this.scoreWeights.preferences;
        totalWeight += this.scoreWeights.preferences;

        // Preferences compatibility
        const preferencesScore = this.calculatePreferencesCompatibility(
            profile1.preferences,
            profile2.businessType || profile2.preferences
        );
        totalScore += preferencesScore * this.scoreWeights.preferences;
        totalWeight += this.scoreWeights.preferences;

        return Math.round((totalScore / totalWeight) * 100) / 100;
    }

    /**
     * Calculate location compatibility
     */
    calculateLocationCompatibility(location1, location2) {
        if (!location1 || !location2) return 0.5;

        // Exact match
        if (location1.city === location2.city && location1.state === location2.state) {
            return 1.0;
        }

        // Same state
        if (location1.state === location2.state) {
            return 0.8;
        }

        // Same region
        if (this.isSameRegion(location1.state, location2.state)) {
            return 0.6;
        }

        // Different regions
        return 0.3;
    }

    /**
     * Calculate budget compatibility
     */
    calculateBudgetCompatibility(buyerBudget, sellerPrice) {
        if (!buyerBudget || !sellerPrice) return 0.5;

        const ratio = buyerBudget / sellerPrice;

        if (ratio >= 1.0) return 1.0; // Buyer can afford it
        if (ratio >= 0.9) return 0.9; // Close match
        if (ratio >= 0.8) return 0.7; // Reasonable gap
        if (ratio >= 0.7) return 0.5; // Significant gap
        return 0.2; // Large gap
    }

    /**
     * Calculate experience compatibility
     */
    calculateExperienceCompatibility(buyerExperience, businessComplexity) {
        const experienceLevel = {
            'first-time': 1,
            'some-experience': 2,
            'experienced': 3,
            'expert': 4
        };

        const complexityLevel = {
            'simple': 1,
            'moderate': 2,
            'complex': 3,
            'very-complex': 4
        };

        const buyerLevel = experienceLevel[buyerExperience] || 2;
        const businessLevel = complexityLevel[businessComplexity] || 2;

        const difference = Math.abs(buyerLevel - businessLevel);

        if (difference === 0) return 1.0;
        if (difference === 1) return 0.8;
        if (difference === 2) return 0.5;
        return 0.2;
    }

    /**
     * Calculate timeline compatibility
     */
    calculateTimelineCompatibility(buyerTimeline, sellerTimeline) {
        const timelineValues = {
            'immediate': 1,
            '1-3-months': 2,
            '3-6-months': 3,
            '6-12-months': 4,
            'flexible': 5
        };

        const buyerValue = timelineValues[buyerTimeline] || 3;
        const sellerValue = timelineValues[sellerTimeline] || 3;

        // Flexible timeline is compatible with everything
        if (buyerTimeline === 'flexible' || sellerTimeline === 'flexible') {
            return 1.0;
        }

        const difference = Math.abs(buyerValue - sellerValue);

        if (difference === 0) return 1.0;
        if (difference === 1) return 0.8;
        if (difference === 2) return 0.6;
        return 0.3;
    }

    /**
     * Calculate preferences compatibility
     */
    calculatePreferencesCompatibility(buyerPreferences, businessType) {
        if (!buyerPreferences || !businessType) return 0.5;

        // Convert to arrays if they're strings
        const preferences = Array.isArray(buyerPreferences) 
            ? buyerPreferences 
            : [buyerPreferences];
        
        const businessTypes = Array.isArray(businessType) 
            ? businessType 
            : [businessType];

        // Check for direct matches
        const matches = preferences.filter(pref => 
            businessTypes.some(type => 
                type.toLowerCase().includes(pref.toLowerCase()) ||
                pref.toLowerCase().includes(type.toLowerCase())
            )
        );

        if (matches.length === 0) return 0.2;
        
        return Math.min(1.0, matches.length / preferences.length);
    }

    /**
     * Generate match reasons
     */
    generateMatchReasons(profile1, profile2) {
        const reasons = [];

        // Location reasons
        if (profile1.location && profile2.location) {
            if (profile1.location.city === profile2.location.city) {
                reasons.push('Same city location');
            } else if (profile1.location.state === profile2.location.state) {
                reasons.push('Same state location');
            }
        }

        // Budget reasons
        const budgetRatio = profile1.budget / (profile2.askingPrice || profile2.budget || 1);
        if (budgetRatio >= 1.0) {
            reasons.push('Budget aligns with asking price');
        } else if (budgetRatio >= 0.9) {
            reasons.push('Budget close to asking price');
        }

        // Experience reasons
        if (this.calculateExperienceCompatibility(
            profile1.experience, 
            profile2.businessComplexity
        ) >= 0.8) {
            reasons.push('Experience level matches business complexity');
        }

        // Timeline reasons
        if (profile1.timeline === profile2.timeline) {
            reasons.push('Matching timeline preferences');
        }

        // Preferences reasons
        if (profile1.preferences && profile2.businessType) {
            const hasMatch = profile1.preferences.some(pref => 
                profile2.businessType.toLowerCase().includes(pref.toLowerCase())
            );
            if (hasMatch) {
                reasons.push('Business type matches preferences');
            }
        }

        return reasons;
    }

    /**
     * Calculate industry compatibility
     */
    calculateIndustryCompatibility(preferredIndustries, listingIndustry) {
        if (!preferredIndustries || preferredIndustries.length === 0) {
            return 0.5; // Neutral score if no preferences
        }

        const hasMatch = preferredIndustries.some(industry =>
            listingIndustry.toLowerCase().includes(industry.toLowerCase())
        );

        return hasMatch ? 1.0 : 0.2;
    }

    /**
     * Estimate business complexity based on listing data
     */
    estimateBusinessComplexity(listing) {
        if (!listing) return 5; // Default complexity

        let complexity = 1;

        // Factor in employee count
        if (listing.employees > 20) complexity += 3;
        else if (listing.employees > 10) complexity += 2;
        else if (listing.employees > 5) complexity += 1;

        // Factor in revenue
        if (listing.annual_revenue > 1000000) complexity += 2;
        else if (listing.annual_revenue > 500000) complexity += 1;

        // Factor in business age
        const currentYear = new Date().getFullYear();
        const businessAge = currentYear - (listing.established_year || currentYear);
        if (businessAge > 10) complexity += 1;

        return Math.min(complexity, 10); // Cap at 10
    }

    /**
     * Create a new match between buyer and listing
     */
    async createMatch(buyerId, listingId, compatibilityScore, matchReasons) {
        try {
            // Get listing details to find seller
            const listingResponse = await supabaseService.select('listings', {
                eq: { id: listingId }
            });

            if (!listingResponse.success || listingResponse.data.length === 0) {
                throw new Error('Listing not found');
            }

            const listing = listingResponse.data[0];

            const matchData = {
                buyer_id: buyerId,
                seller_id: listing.seller_id,
                listing_id: listingId,
                compatibility_score: compatibilityScore,
                match_reasons: matchReasons,
                status: 'pending'
            };

            const response = await supabaseService.insert('matches', matchData);

            if (response.success) {
                return { success: true, data: response.data[0] };
            } else {
                throw new Error(response.error || 'Failed to create match');
            }
        } catch (error) {
            console.error('Create match error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update match status (accept/reject)
     */
    async updateMatchStatus(matchId, status, notes = '') {
        try {
            // Get current user to verify they're part of this match
            const userResponse = await supabaseService.getCurrentUser();
            if (!userResponse.success || !userResponse.user) {
                throw new Error('User must be authenticated');
            }

            const profileResponse = await supabaseService.select('profiles', {
                eq: { user_id: userResponse.user.id }
            });

            if (!profileResponse.success || profileResponse.data.length === 0) {
                throw new Error('User profile not found');
            }

            const userId = profileResponse.data[0].id;

            const updateData = {
                status: status,
                updated_at: new Date().toISOString()
            };

            // Add notes based on user role
            const matchResponse = await supabaseService.select('matches', {
                eq: { id: matchId }
            });

            if (matchResponse.success && matchResponse.data.length > 0) {
                const match = matchResponse.data[0];

                if (match.buyer_id === userId) {
                    updateData.buyer_notes = notes;
                } else if (match.seller_id === userId) {
                    updateData.seller_notes = notes;
                } else {
                    throw new Error('User not authorized to update this match');
                }
            }

            const response = await supabaseService.update('matches', updateData, { id: matchId });

            if (response.success) {
                return { success: true, data: response.data[0] };
            } else {
                throw new Error(response.error || 'Failed to update match');
            }
        } catch (error) {
            console.error('Update match status error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get saved matches
     */
    async getSavedMatches(userId) {
        try {
            const response = await fetch(`${this.baseUrl}/users/${userId}/saved-matches`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            return { success: true, data: result.data };

        } catch (error) {
            console.error('Error fetching saved matches:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    /**
     * Update user preferences
     */
    async updatePreferences(userId, preferences) {
        try {
            const response = await fetch(`${this.baseUrl}/users/${userId}/preferences`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                },
                body: JSON.stringify(preferences)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            // Clear cache to refresh matches with new preferences
            this.clearUserCache(userId);

            return { success: true, data: result };

        } catch (error) {
            console.error('Error updating preferences:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get match analytics
     */
    async getMatchAnalytics(userId) {
        try {
            const response = await fetch(`${this.baseUrl}/users/${userId}/analytics`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            return { success: true, data: result.data };

        } catch (error) {
            console.error('Error fetching match analytics:', error);
            return {
                success: false,
                error: error.message,
                data: {}
            };
        }
    }

    /**
     * Utility methods
     */
    isSameRegion(state1, state2) {
        const regions = {
            northeast: ['ME', 'NH', 'VT', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA'],
            southeast: ['DE', 'MD', 'VA', 'WV', 'KY', 'TN', 'NC', 'SC', 'GA', 'FL', 'AL', 'MS', 'AR', 'LA'],
            midwest: ['OH', 'MI', 'IN', 'IL', 'WI', 'MN', 'IA', 'MO', 'ND', 'SD', 'NE', 'KS'],
            southwest: ['TX', 'OK', 'NM', 'AZ'],
            west: ['CO', 'WY', 'MT', 'ID', 'WA', 'OR', 'UT', 'NV', 'CA', 'AK', 'HI']
        };

        for (const region of Object.values(regions)) {
            if (region.includes(state1) && region.includes(state2)) {
                return true;
            }
        }

        return false;
    }

    setCachedData(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    getCachedData(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        const isExpired = Date.now() - cached.timestamp > this.cacheTimeout;
        if (isExpired) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    clearUserCache(userId) {
        const keysToDelete = [];
        for (const key of this.cache.keys()) {
            if (key.includes(`matches_${userId}`)) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => this.cache.delete(key));
    }

    clearCache() {
        this.cache.clear();
    }

    getAuthHeaders() {
        const token = localStorage.getItem('auth_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
}
