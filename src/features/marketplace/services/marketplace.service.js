
import { supabaseService } from '../../../shared/services/supabase/index.js';
import { inquiryService } from './inquiry.service.js';
import { listingAnalyticsService } from './listing-analytics.service.js';

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

// Marketplace Service
// Handles all marketplace-related business logic and data management

export class MarketplaceService {
    constructor() {
        this.baseUrl = '/api/marketplace';
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.inquiryService = inquiryService;
        this.analyticsService = listingAnalyticsService;
    }

    // Get all listings with optional filters
    async getListings(filters = {}) {
        const cacheKey = `listings-${JSON.stringify(filters)}`;
        const cached = this.getFromCache(cacheKey);

        if (cached) {
            return cached;
        }

        try {
            // Build Supabase query options
            const queryOptions = {
                select: `
                    *,
                    profiles!seller_id (
                        first_name,
                        last_name,
                        company,
                        phone
                    )
                `,
                eq: {},
                order: { column: 'created_at', ascending: false }
            };

            // Apply filters
            if (filters.status) {
                queryOptions.eq.status = filters.status;
            } else {
                queryOptions.eq.status = 'active'; // Default to active listings
            }

            if (filters.business_type) {
                queryOptions.eq.business_type = filters.business_type;
            }

            if (filters.industry) {
                queryOptions.eq.industry = filters.industry;
            }

            if (filters.city) {
                queryOptions.eq.city = filters.city;
            }

            if (filters.state) {
                queryOptions.eq.state = filters.state;
            }

            // Apply sorting
            if (filters.sort_by) {
                queryOptions.order.column = filters.sort_by;
                queryOptions.order.ascending = filters.sort_order === 'asc';
            }

            // Apply pagination
            if (filters.limit) {
                queryOptions.limit = parseInt(filters.limit);
            }

            if (filters.offset) {
                queryOptions.range = {
                    from: parseInt(filters.offset),
                    to: parseInt(filters.offset) + (parseInt(filters.limit) || 20) - 1
                };
            }

            const response = await supabaseService.select('listings', queryOptions);

            if (response.success) {
                const data = {
                    listings: response.data,
                    total: response.data.length,
                    filters: filters
                };

                this.setCache(cacheKey, data);
                return data;
            } else {
                throw new Error(response.error || 'Failed to fetch listings');
            }
        } catch (error) {
            console.error('Listings fetch error:', error);
            throw error;
        }
    }

    // Get a specific listing by ID
    async getListing(id) {
        const cacheKey = `listing-${id}`;
        const cached = this.getFromCache(cacheKey);

        if (cached) {
            return cached;
        }

        try {
            const response = await supabaseService.select('listings', {
                select: `
                    *,
                    profiles!seller_id (
                        first_name,
                        last_name,
                        company,
                        phone,
                        avatar_url,
                        bio
                    )
                `,
                eq: { id: id }
            });

            if (response.success && response.data.length > 0) {
                const listing = response.data[0];

                // Increment view count
                await this.incrementViewCount(id);

                this.setCache(cacheKey, listing);
                return listing;
            } else {
                throw new Error('Listing not found');
            }
        } catch (error) {
            console.error('Listing fetch error:', error);
            throw error;
        }
    }

    // Search listings
    async searchListings(query, filters = {}) {
        const searchParams = {
            q: query,
            ...filters
        };
        const queryParams = new URLSearchParams(searchParams).toString();

        try {
            const response = await fetch(`${this.baseUrl}/search?${queryParams}`);

            if (!response.ok) {
                throw new Error('Failed to search listings');
            }

            return await response.json();
        } catch (error) {
            console.error('Search error:', error);
            throw error;
        }
    }

    // Save a listing (for authenticated users)
    async saveListing(listingId) {
        try {
            const response = await fetch(`${this.baseUrl}/listings/${listingId}/save`, {
                method: 'POST',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to save listing');
            }

            return await response.json();
        } catch (error) {
            console.error('Save listing error:', error);
            throw error;
        }
    }

    // Remove a saved listing
    async unsaveListing(listingId) {
        try {
            const response = await fetch(`${this.baseUrl}/listings/${listingId}/save`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to unsave listing');
            }

            return await response.json();
        } catch (error) {
            console.error('Unsave listing error:', error);
            throw error;
        }
    }

    // Get saved listings for user
    async getSavedListings() {
        try {
            const response = await fetch(`${this.baseUrl}/saved`, {
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch saved listings');
            }

            return await response.json();
        } catch (error) {
            console.error('Saved listings error:', error);
            throw error;
        }
    }

    // Contact seller about a listing
    async contactSeller(listingId, message) {
        try {
            const response = await fetch(`${this.baseUrl}/listings/${listingId}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                },
                body: JSON.stringify({ message })
            });

            if (!response.ok) {
                throw new Error('Failed to contact seller');
            }

            return await response.json();
        } catch (error) {
            console.error('Contact seller error:', error);
            throw error;
        }
    }

    // Get listing categories
    async getCategories() {
        const cacheKey = 'categories';
        const cached = this.getFromCache(cacheKey);
        
        if (cached) {
            return cached;
        }

        try {
            const response = await fetch(`${this.baseUrl}/categories`);

            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }

            const data = await response.json();
            this.setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Categories fetch error:', error);
            throw error;
        }
    }

    // Get price ranges for filtering
    async getPriceRanges() {
        const cacheKey = 'price-ranges';
        const cached = this.getFromCache(cacheKey);
        
        if (cached) {
            return cached;
        }

        try {
            const response = await fetch(`${this.baseUrl}/price-ranges`);

            if (!response.ok) {
                throw new Error('Failed to fetch price ranges');
            }

            const data = await response.json();
            this.setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Price ranges fetch error:', error);
            throw error;
        }
    }

    // Cache management
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    clearCache() {
        this.cache.clear();
    }

    // Helper method to increment view count
    async incrementViewCount(listingId) {
        try {
            // Get current view count
            const response = await supabaseService.select('listings', {
                select: 'views_count',
                eq: { id: listingId }
            });

            if (response.success && response.data.length > 0) {
                const currentViews = response.data[0].views_count || 0;

                // Update view count
                await supabaseService.update('listings',
                    { views_count: currentViews + 1 },
                    { id: listingId }
                );
            }
        } catch (error) {
            console.error('Failed to increment view count:', error);
            // Don't throw error as this is not critical
        }
    }

    // Create a new listing
    async createListing(listingData) {
        try {
            // Get current user to set as seller
            const userResponse = await supabaseService.getCurrentUser();
            if (!userResponse.success || !userResponse.user) {
                throw new Error('User must be authenticated to create listings');
            }

            // Get user profile to get the profile ID
            const profileResponse = await supabaseService.select('profiles', {
                eq: { user_id: userResponse.user.id }
            });

            if (!profileResponse.success || profileResponse.data.length === 0) {
                throw new Error('User profile not found');
            }

            const sellerId = profileResponse.data[0].id;

            // Prepare listing data
            const listingToInsert = {
                seller_id: sellerId,
                title: listingData.title,
                description: listingData.description,
                asking_price: parseFloat(listingData.asking_price),
                business_type: listingData.business_type,
                industry: listingData.industry,
                location: listingData.location,
                city: listingData.city,
                state: listingData.state,
                zip_code: listingData.zip_code,
                annual_revenue: listingData.annual_revenue ? parseFloat(listingData.annual_revenue) : null,
                annual_profit: listingData.annual_profit ? parseFloat(listingData.annual_profit) : null,
                ebitda: listingData.ebitda ? parseFloat(listingData.ebitda) : null,
                employees: listingData.employees ? parseInt(listingData.employees) : 0,
                established_year: listingData.established_year ? parseInt(listingData.established_year) : null,
                reason_for_selling: listingData.reason_for_selling,
                assets_included: listingData.assets_included || [],
                liabilities: listingData.liabilities,
                lease_terms: listingData.lease_terms,
                growth_opportunities: listingData.growth_opportunities,
                images: listingData.images || [],
                documents: listingData.documents || [],
                status: listingData.status || 'draft',
                featured: listingData.featured || false
            };

            const response = await supabaseService.insert('listings', listingToInsert);

            if (response.success) {
                this.clearCache(); // Invalidate cache
                return { success: true, data: response.data[0] };
            } else {
                throw new Error(response.error || 'Failed to create listing');
            }
        } catch (error) {
            console.error('Create listing error:', error);
            return { success: false, error: error.message };
        }
    }

    // Update an existing listing
    async updateListing(id, updates) {
        try {
            // Get current user to verify ownership
            const userResponse = await supabaseService.getCurrentUser();
            if (!userResponse.success || !userResponse.user) {
                throw new Error('User must be authenticated to update listings');
            }

            // Get user profile
            const profileResponse = await supabaseService.select('profiles', {
                eq: { user_id: userResponse.user.id }
            });

            if (!profileResponse.success || profileResponse.data.length === 0) {
                throw new Error('User profile not found');
            }

            const sellerId = profileResponse.data[0].id;

            // Prepare update data
            const updateData = {
                ...updates,
                updated_at: new Date().toISOString()
            };

            // Remove any fields that shouldn't be updated directly
            delete updateData.id;
            delete updateData.seller_id;
            delete updateData.created_at;

            const response = await supabaseService.update('listings', updateData, {
                id: id,
                seller_id: sellerId // Ensure user can only update their own listings
            });

            if (response.success) {
                this.clearCache(); // Invalidate cache
                return { success: true, data: response.data[0] };
            } else {
                throw new Error(response.error || 'Failed to update listing');
            }
        } catch (error) {
            console.error('Update listing error:', error);
            return { success: false, error: error.message };
        }
    }

    // Delete a listing
    async deleteListing(id) {
        try {
            const response = await fetch(`${this.baseUrl}/listings/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to delete listing');
            }

            this.clearCache(); // Invalidate cache
            return { success: true };
        } catch (error) {
            console.error('Delete listing error:', error);
            return { success: false, error: error.message };
        }
    }

    // Get listings by category
    async getListingsByCategory(category) {
        try {
            const response = await fetch(`${this.baseUrl}/categories/${category}/listings`);

            if (!response.ok) {
                throw new Error('Failed to fetch category listings');
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('Category listings error:', error);
            return { success: false, error: error.message };
        }
    }

    // Check if a listing is saved
    async isListingSaved(listingId) {
        try {
            const response = await fetch(`${this.baseUrl}/listings/${listingId}/saved`, {
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to check saved status');
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('Check saved status error:', error);
            return { success: false, error: error.message };
        }
    }

    // Build filter query string
    buildFilterQuery(filters) {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params.append(key, value);
            }
        });

        return params.toString();
    }

    // Validate filter values
    validateFilters(filters) {
        if (!filters || typeof filters !== 'object') {
            return false;
        }

        // Check price range validity
        if (filters.priceMin && filters.priceMax) {
            if (parseFloat(filters.priceMin) > parseFloat(filters.priceMax)) {
                return false;
            }
        }

        return true;
    }

    // Sort listings
    sortListings(listings, sortBy, sortOrder = 'asc') {
        if (!Array.isArray(listings)) {
            return listings;
        }

        return [...listings].sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            // Handle different data types
            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (sortOrder === 'desc') {
                return bValue > aValue ? 1 : -1;
            } else {
                return aValue > bValue ? 1 : -1;
            }
        });
    }

    // Track listing view
    async trackListingView(listingId) {
        try {
            const response = await fetch(`${this.baseUrl}/analytics/views`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                },
                body: JSON.stringify({ listingId, timestamp: Date.now() })
            });

            if (!response.ok) {
                throw new Error('Failed to track view');
            }

            return { success: true };
        } catch (error) {
            console.error('Track view error:', error);
            return { success: false, error: error.message };
        }
    }

    // Track search query
    async trackSearch(query) {
        try {
            const response = await fetch(`${this.baseUrl}/analytics/searches`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                },
                body: JSON.stringify({ query, timestamp: Date.now() })
            });

            if (!response.ok) {
                throw new Error('Failed to track search');
            }

            return { success: true };
        } catch (error) {
            console.error('Track search error:', error);
            return { success: false, error: error.message };
        }
    }

    // Get marketplace analytics
    async getAnalytics() {
        try {
            const response = await fetch(`${this.baseUrl}/analytics`, {
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch analytics');
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('Analytics error:', error);
            return { success: false, error: error.message };
        }
    }

    // Get authorization headers
    getAuthHeaders() {
        const token = localStorage.getItem('auth_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    // ============================================================================
    // ENHANCED MARKETPLACE FUNCTIONALITY
    // ============================================================================

    /**
     * Submit inquiry for a listing
     */
    async submitInquiry(listingId, inquiryData) {
        try {
            // Track analytics
            await this.analyticsService.trackEngagement(listingId, 'inquiry_submitted', {
                inquiry_type: inquiryData.inquiry_type
            });

            return await this.inquiryService.submitInquiry(listingId, inquiryData);
        } catch (error) {
            console.error('Submit inquiry error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get inquiries for current user
     */
    async getUserInquiries(role = 'buyer', filters = {}) {
        try {
            const user = await supabaseService.getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            const userProfile = await supabaseService.select('profiles', {
                eq: { user_id: user.id },
                single: true
            });

            if (!userProfile.success) {
                throw new Error('User profile not found');
            }

            if (role === 'seller') {
                return await this.inquiryService.getSellerInquiries(userProfile.data.id, filters);
            } else {
                return await this.inquiryService.getBuyerInquiries(userProfile.data.id, filters);
            }
        } catch (error) {
            console.error('Get user inquiries error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Respond to an inquiry
     */
    async respondToInquiry(inquiryId, responseData) {
        try {
            return await this.inquiryService.respondToInquiry(inquiryId, responseData);
        } catch (error) {
            console.error('Respond to inquiry error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get inquiry conversation
     */
    async getInquiryConversation(inquiryId) {
        try {
            return await this.inquiryService.getInquiryConversation(inquiryId);
        } catch (error) {
            console.error('Get inquiry conversation error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Track listing view with enhanced analytics
     */
    async trackListingView(listingId, viewData = {}) {
        try {
            // Track view in analytics service
            await this.analyticsService.trackView(listingId, viewData);

            // Also track in the original method for backward compatibility
            return await this.trackListingView(listingId);
        } catch (error) {
            console.error('Track listing view error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Track listing engagement
     */
    async trackEngagement(listingId, engagementType, engagementData = {}) {
        try {
            return await this.analyticsService.trackEngagement(listingId, engagementType, engagementData);
        } catch (error) {
            console.error('Track engagement error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get comprehensive listing analytics
     */
    async getListingAnalytics(listingId, dateRange = null) {
        try {
            return await this.analyticsService.getListingAnalytics(listingId, dateRange);
        } catch (error) {
            console.error('Get listing analytics error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Save listing to favorites
     */
    async saveListing(listingId) {
        try {
            const user = await supabaseService.getCurrentUser();
            if (!user) {
                throw new Error('User must be logged in to save listings');
            }

            const userProfile = await supabaseService.select('profiles', {
                eq: { user_id: user.id },
                single: true
            });

            if (!userProfile.success) {
                throw new Error('User profile not found');
            }

            // Check if already saved
            const existingSave = await supabaseService.select('saved_listings', {
                eq: {
                    user_id: userProfile.data.id,
                    listing_id: listingId
                },
                single: true
            });

            if (existingSave.success && existingSave.data) {
                return { success: false, error: 'Listing already saved' };
            }

            // Save the listing
            const result = await supabaseService.insert('saved_listings', {
                user_id: userProfile.data.id,
                listing_id: listingId,
                saved_at: new Date().toISOString()
            });

            if (result.success) {
                // Track engagement
                await this.trackEngagement(listingId, 'save', {
                    user_id: userProfile.data.id
                });
            }

            return result;
        } catch (error) {
            console.error('Save listing error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Remove listing from favorites
     */
    async unsaveListing(listingId) {
        try {
            const user = await supabaseService.getCurrentUser();
            if (!user) {
                throw new Error('User must be logged in');
            }

            const userProfile = await supabaseService.select('profiles', {
                eq: { user_id: user.id },
                single: true
            });

            if (!userProfile.success) {
                throw new Error('User profile not found');
            }

            const result = await supabaseService.delete('saved_listings', {
                user_id: userProfile.data.id,
                listing_id: listingId
            });

            if (result.success) {
                // Track engagement
                await this.trackEngagement(listingId, 'unsave', {
                    user_id: userProfile.data.id
                });
            }

            return result;
        } catch (error) {
            console.error('Unsave listing error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get user's saved listings
     */
    async getSavedListings() {
        try {
            const user = await supabaseService.getCurrentUser();
            if (!user) {
                throw new Error('User must be logged in');
            }

            const userProfile = await supabaseService.select('profiles', {
                eq: { user_id: user.id },
                single: true
            });

            if (!userProfile.success) {
                throw new Error('User profile not found');
            }

            return await supabaseService.select('saved_listings', {
                select: `
                    *,
                    listing:listings (
                        *,
                        seller:profiles!seller_id (
                            first_name,
                            last_name,
                            company
                        )
                    )
                `,
                eq: { user_id: userProfile.data.id },
                order: { column: 'saved_at', ascending: false }
            });
        } catch (error) {
            console.error('Get saved listings error:', error);
            return { success: false, error: error.message };
        }
    }
}

// Export singleton instance
export const marketplaceService = new MarketplaceService();
