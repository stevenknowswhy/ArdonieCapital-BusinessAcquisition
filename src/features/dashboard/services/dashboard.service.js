
/**
 * Dashboard Service
 * Handles dashboard data fetching and management with Supabase integration
 * @author Ardonie Capital Development Team
 */

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

// Import Supabase service for database operations
import { supabaseService } from '../../../shared/services/supabase/index.js';

/**
 * Dashboard service class
 * Provides methods for fetching and managing dashboard data from Supabase
 */
export class DashboardService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.isInitialized = false;
        this.currentUser = null;

        // Initialize Supabase connection
        this.initializeService();
    }

    /**
     * Initialize the dashboard service
     */
    async initializeService() {
        try {
            if (!supabaseService.isInitialized) {
                await supabaseService.init();
            }
            this.isInitialized = true;
            console.log('Dashboard service initialized with Supabase');
        } catch (error) {
            console.error('Failed to initialize dashboard service:', error);
            throw error;
        }
    }

    /**
     * Get current user profile
     */
    async getCurrentUserProfile() {
        if (this.currentUser) {
            return this.currentUser;
        }

        try {
            const userResponse = await supabaseService.getCurrentUser();
            if (!userResponse.success || !userResponse.user) {
                throw new Error('User not authenticated');
            }

            const user = userResponse.user;

            // Get user profile from profiles table
            const profileResponse = await supabaseService.select('profiles', {
                eq: { user_id: user.id }
            });

            if (profileResponse.success && profileResponse.data.length > 0) {
                this.currentUser = {
                    ...user,
                    profile: profileResponse.data[0]
                };
                return this.currentUser;
            } else {
                throw new Error('User profile not found');
            }
        } catch (error) {
            console.error('Failed to get current user profile:', error);
            throw error;
        }
    }

    /**
     * Get buyer dashboard data from Supabase
     */
    async getBuyerDashboard() {
        const cacheKey = 'buyer-dashboard';
        const cached = this.getFromCache(cacheKey);

        if (cached) {
            return { success: true, data: cached, fromCache: true };
        }

        try {
            const user = await this.getCurrentUserProfile();
            const buyerId = user.profile.id;

            // Get buyer-specific data in parallel
            const [
                savedListingsResult,
                matchesResult,
                messagesResult,
                notificationsResult,
                searchHistoryResult
            ] = await Promise.all([
                this.getSavedListings(),
                this.getBuyerMatches(buyerId),
                this.getRecentMessages(buyerId),
                this.getNotifications(buyerId),
                this.getSearchHistory(buyerId)
            ]);

            const dashboardData = {
                overview: {
                    savedListings: savedListingsResult.success ? savedListingsResult.data.length : 0,
                    activeMatches: matchesResult.success ? matchesResult.data.length : 0,
                    unreadMessages: messagesResult.success ? messagesResult.data.filter(m => !m.read).length : 0,
                    recentSearches: searchHistoryResult.success ? searchHistoryResult.data.length : 0
                },
                savedListings: savedListingsResult.success ? savedListingsResult.data : [],
                matches: matchesResult.success ? matchesResult.data : [],
                messages: messagesResult.success ? messagesResult.data : [],
                notifications: notificationsResult.success ? notificationsResult.data : [],
                searchHistory: searchHistoryResult.success ? searchHistoryResult.data : []
            };

            this.setCache(cacheKey, dashboardData);
            return { success: true, data: dashboardData };
        } catch (error) {
            console.error('Buyer dashboard error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get seller dashboard data from Supabase
     */
    async getSellerDashboard() {
        const cacheKey = 'seller-dashboard';
        const cached = this.getFromCache(cacheKey);

        if (cached) {
            return { success: true, data: cached, fromCache: true };
        }

        try {
            const user = await this.getCurrentUserProfile();
            const sellerId = user.profile.id;

            // Get seller-specific data in parallel
            const [
                listingsResult,
                dealsResult,
                messagesResult,
                notificationsResult,
                analyticsResult
            ] = await Promise.all([
                this.getSellerListings(sellerId),
                this.getSellerDeals(sellerId),
                this.getRecentMessages(sellerId),
                this.getNotifications(sellerId),
                this.getListingAnalytics(sellerId)
            ]);

            const dashboardData = {
                overview: {
                    activeListings: listingsResult.success ? listingsResult.data.filter(l => l.status === 'active').length : 0,
                    totalListings: listingsResult.success ? listingsResult.data.length : 0,
                    activeDeals: dealsResult.success ? dealsResult.data.filter(d => d.status !== 'completed' && d.status !== 'cancelled').length : 0,
                    unreadMessages: messagesResult.success ? messagesResult.data.filter(m => !m.read).length : 0
                },
                listings: listingsResult.success ? listingsResult.data : [],
                deals: dealsResult.success ? dealsResult.data : [],
                messages: messagesResult.success ? messagesResult.data : [],
                notifications: notificationsResult.success ? notificationsResult.data : [],
                analytics: analyticsResult.success ? analyticsResult.data : {}
            };

            this.setCache(cacheKey, dashboardData);
            return { success: true, data: dashboardData };
        } catch (error) {
            console.error('Seller dashboard error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get saved listings for buyer
     */
    async getSavedListings() {
        try {
            const user = await this.getCurrentUserProfile();
            const buyerId = user.profile.id;

            const result = await supabaseService.select('saved_listings', {
                select: `
                    *,
                    listings (
                        id, title, asking_price, business_type, industry,
                        location, city, state, images, status, created_at
                    )
                `,
                eq: { buyer_id: buyerId },
                order: { column: 'created_at', ascending: false }
            });

            return result;
        } catch (error) {
            console.error('Saved listings error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get buyer matches
     */
    async getBuyerMatches(buyerId) {
        try {
            const result = await supabaseService.select('matches', {
                select: `
                    *,
                    listings (
                        id, title, asking_price, business_type, industry, location
                    ),
                    seller:profiles!seller_id (
                        id, first_name, last_name, company
                    )
                `,
                eq: { buyer_id: buyerId },
                order: { column: 'created_at', ascending: false },
                limit: 10
            });

            return result;
        } catch (error) {
            console.error('Buyer matches error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get seller listings
     */
    async getSellerListings(sellerId) {
        try {
            const result = await supabaseService.select('listings', {
                eq: { seller_id: sellerId },
                order: { column: 'created_at', ascending: false }
            });

            return result;
        } catch (error) {
            console.error('Seller listings error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get seller deals
     */
    async getSellerDeals(sellerId) {
        try {
            const result = await supabaseService.select('deals', {
                select: `
                    *,
                    listings (
                        id, title, asking_price, business_type
                    ),
                    buyer:profiles!buyer_id (
                        id, first_name, last_name, company
                    )
                `,
                eq: { seller_id: sellerId },
                order: { column: 'created_at', ascending: false }
            });

            return result;
        } catch (error) {
            console.error('Seller deals error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get recent messages for user
     */
    async getRecentMessages(userId, limit = 10) {
        try {
            const result = await supabaseService.select('messages', {
                select: `
                    *,
                    sender:profiles!sender_id (
                        id, first_name, last_name, avatar_url
                    ),
                    receiver:profiles!receiver_id (
                        id, first_name, last_name, avatar_url
                    )
                `,
                eq: {
                    or: `sender_id.eq.${userId},receiver_id.eq.${userId}`
                },
                order: { column: 'created_at', ascending: false },
                limit: limit
            });

            return result;
        } catch (error) {
            console.error('Recent messages error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get notifications for user
     */
    async getNotifications(userId, limit = 20) {
        try {
            const result = await supabaseService.select('notifications', {
                eq: { user_id: userId },
                order: { column: 'created_at', ascending: false },
                limit: limit
            });

            return result;
        } catch (error) {
            console.error('Notifications error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get search history for user
     */
    async getSearchHistory(userId, limit = 10) {
        try {
            const result = await supabaseService.select('search_history', {
                eq: { user_id: userId },
                order: { column: 'created_at', ascending: false },
                limit: limit
            });

            return result;
        } catch (error) {
            console.error('Search history error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get listing analytics for seller
     */
    async getListingAnalytics(sellerId) {
        try {
            // Get analytics events for seller's listings
            const result = await supabaseService.select('analytics_events', {
                select: `
                    event_type,
                    event_data,
                    created_at
                `,
                eq: {
                    event_type: 'listing_view'
                },
                order: { column: 'created_at', ascending: false },
                limit: 100
            });

            if (result.success) {
                // Process analytics data
                const analytics = {
                    totalViews: result.data.length,
                    viewsThisWeek: result.data.filter(event => {
                        const eventDate = new Date(event.created_at);
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return eventDate >= weekAgo;
                    }).length,
                    topListings: {} // Could be enhanced with more complex analytics
                };

                return { success: true, data: analytics };
            }

            return result;
        } catch (error) {
            console.error('Listing analytics error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get KPI data for dashboard overview
     */
    async getKPIs(userType) {
        try {
            const user = await this.getCurrentUserProfile();
            const userId = user.profile.id;

            if (userType === 'buyer') {
                const [savedListings, matches, messages] = await Promise.all([
                    this.getSavedListings(),
                    this.getBuyerMatches(userId),
                    this.getRecentMessages(userId)
                ]);

                return {
                    success: true,
                    data: {
                        savedListings: {
                            value: savedListings.success ? savedListings.data.length : 0,
                            change: '+0', // Could calculate change over time
                            trend: 'neutral'
                        },
                        activeMatches: {
                            value: matches.success ? matches.data.length : 0,
                            change: '+0',
                            trend: 'neutral'
                        },
                        unreadMessages: {
                            value: messages.success ? messages.data.filter(m => !m.read).length : 0,
                            change: '+0',
                            trend: 'neutral'
                        }
                    }
                };
            } else if (userType === 'seller') {
                const [listings, deals, messages] = await Promise.all([
                    this.getSellerListings(userId),
                    this.getSellerDeals(userId),
                    this.getRecentMessages(userId)
                ]);

                return {
                    success: true,
                    data: {
                        activeListings: {
                            value: listings.success ? listings.data.filter(l => l.status === 'active').length : 0,
                            change: '+0',
                            trend: 'neutral'
                        },
                        activeDeals: {
                            value: deals.success ? deals.data.filter(d => d.status !== 'completed').length : 0,
                            change: '+0',
                            trend: 'neutral'
                        },
                        unreadMessages: {
                            value: messages.success ? messages.data.filter(m => !m.read).length : 0,
                            change: '+0',
                            trend: 'neutral'
                        }
                    }
                };
            }

            return { success: false, error: 'Invalid user type' };
        } catch (error) {
            console.error('KPI fetch error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update user preferences
     */
    async updatePreferences(preferences) {
        try {
            const user = await this.getCurrentUserProfile();
            const profileId = user.profile.id;

            const result = await supabaseService.update('profiles',
                { business_details: preferences },
                { id: profileId }
            );

            if (result.success) {
                // Clear cache to force refresh
                this.clearCache();
            }

            return result;
        } catch (error) {
            console.error('Preferences update error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Cache management methods
     */
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
        // Also clear current user cache
        this.currentUser = null;
    }

    /**
     * Get activity feed for dashboard
     */
    async getActivityFeed(limit = 20) {
        try {
            const user = await this.getCurrentUserProfile();
            const userId = user.profile.id;

            // Get recent activity from multiple sources
            const [messages, matches, notifications] = await Promise.all([
                this.getRecentMessages(userId, 5),
                this.getBuyerMatches(userId),
                this.getNotifications(userId, 10)
            ]);

            const activities = [];

            // Add messages to activity feed
            if (messages.success) {
                messages.data.forEach(message => {
                    activities.push({
                        id: `message-${message.id}`,
                        type: 'message',
                        title: 'New Message',
                        description: `Message from ${message.sender.first_name} ${message.sender.last_name}`,
                        timestamp: message.created_at,
                        data: message
                    });
                });
            }

            // Add matches to activity feed
            if (matches.success) {
                matches.data.slice(0, 3).forEach(match => {
                    activities.push({
                        id: `match-${match.id}`,
                        type: 'match',
                        title: 'New Match',
                        description: `Matched with ${match.listings.title}`,
                        timestamp: match.created_at,
                        data: match
                    });
                });
            }

            // Add notifications to activity feed
            if (notifications.success) {
                notifications.data.slice(0, 5).forEach(notification => {
                    activities.push({
                        id: `notification-${notification.id}`,
                        type: 'notification',
                        title: notification.title,
                        description: notification.message,
                        timestamp: notification.created_at,
                        data: notification
                    });
                });
            }

            // Sort by timestamp and limit
            activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            return {
                success: true,
                data: activities.slice(0, limit)
            };
        } catch (error) {
            console.error('Activity feed error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get active deals for current user
     */
    async getActiveDeals() {
        try {
            const user = await this.getCurrentUserProfile();
            const userId = user.profile.id;
            const userRole = user.profile.role;

            let dealsResult;
            if (userRole === 'seller') {
                dealsResult = await this.getSellerDeals(userId);
            } else {
                // For buyers, get deals where they are the buyer
                dealsResult = await supabaseService.select('deals', {
                    select: `
                        *,
                        listings (
                            id, title, asking_price, business_type
                        ),
                        seller:profiles!seller_id (
                            id, first_name, last_name, company
                        )
                    `,
                    eq: { buyer_id: userId },
                    order: { column: 'created_at', ascending: false }
                });
            }

            if (dealsResult.success) {
                // Filter for active deals only
                const activeDeals = dealsResult.data.filter(deal =>
                    deal.status !== 'completed' &&
                    deal.status !== 'cancelled' &&
                    deal.status !== 'expired'
                );

                return { success: true, data: activeDeals };
            }

            return dealsResult;
        } catch (error) {
            console.error('Active deals error:', error);
            return { success: false, error: error.message };
        }
    }
}

// Export singleton instance
export const dashboardService = new DashboardService();
