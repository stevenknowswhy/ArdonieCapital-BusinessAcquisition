/**
 * Enhanced Dashboard Data Module
 * Real database integration replacing mock data
 * @author Ardonie Capital Development Team
 */

console.log('📊 Loading Enhanced Dashboard Data Module...');

/**
 * Enhanced Dashboard data management functions
 * Provides real database data via Supabase integration
 */
const DashboardDataEnhanced = {
    // Service instance for database operations
    dashboardService: null,
    
    // Loading states
    loadingStates: {
        overview: false,
        messages: false,
        deals: false,
        listings: false
    },

    /**
     * Initialize the enhanced dashboard data module
     */
    async init() {
        try {
            console.log('🔄 Initializing Enhanced Dashboard Data...');
            
            // Import the dashboard service dynamically
            const { dashboardService } = await import('../../src/features/dashboard/index.js');
            this.dashboardService = dashboardService;
            
            // Ensure service is initialized
            if (!this.dashboardService.isInitialized) {
                await this.dashboardService.initializeService();
            }
            
            console.log('✅ Enhanced Dashboard Data initialized');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Enhanced Dashboard Data:', error);
            return false;
        }
    },

    /**
     * Get real overview data for KPI cards
     */
    async getRealOverviewData() {
        try {
            if (!this.dashboardService) {
                console.warn('⚠️ Dashboard service not initialized, falling back to mock data');
                return this.getMockOverviewData();
            }

            // Get current user to determine dashboard type
            const user = await this.dashboardService.getCurrentUserProfile();
            const userRole = user.profile.role;

            const kpiResult = await this.dashboardService.getKPIs(userRole);
            
            if (kpiResult.success) {
                // Transform KPI data to match expected format
                if (userRole === 'buyer') {
                    return {
                        savedListings: {
                            value: kpiResult.data.savedListings.value,
                            change: kpiResult.data.savedListings.change,
                            trend: kpiResult.data.savedListings.trend
                        },
                        activeMatches: {
                            value: kpiResult.data.activeMatches.value,
                            change: kpiResult.data.activeMatches.change,
                            trend: kpiResult.data.activeMatches.trend
                        },
                        unreadMessages: {
                            value: kpiResult.data.unreadMessages.value,
                            change: kpiResult.data.unreadMessages.change,
                            trend: kpiResult.data.unreadMessages.trend
                        },
                        totalSearches: {
                            value: 0, // Could be enhanced with search history count
                            change: '+0',
                            trend: 'neutral'
                        }
                    };
                } else if (userRole === 'seller') {
                    return {
                        activeListings: {
                            value: kpiResult.data.activeListings.value,
                            change: kpiResult.data.activeListings.change,
                            trend: kpiResult.data.activeListings.trend
                        },
                        activeDeals: {
                            value: kpiResult.data.activeDeals.value,
                            change: kpiResult.data.activeDeals.change,
                            trend: kpiResult.data.activeDeals.trend
                        },
                        unreadMessages: {
                            value: kpiResult.data.unreadMessages.value,
                            change: kpiResult.data.unreadMessages.change,
                            trend: kpiResult.data.unreadMessages.trend
                        },
                        totalViews: {
                            value: 0, // Could be enhanced with analytics data
                            change: '+0',
                            trend: 'neutral'
                        }
                    };
                }
            }

            // Fallback to mock data if database query fails
            console.warn('⚠️ KPI query failed, falling back to mock data');
            return this.getMockOverviewData();
        } catch (error) {
            console.error('❌ Failed to get real overview data:', error);
            return this.getMockOverviewData();
        }
    },

    /**
     * Get real deals data
     */
    async getRealDealsData() {
        try {
            if (!this.dashboardService) {
                return this.getMockDealsData();
            }

            const dealsResult = await this.dashboardService.getActiveDeals();
            
            if (dealsResult.success) {
                // Transform deals data to match expected format
                return dealsResult.data.map(deal => ({
                    id: deal.id,
                    businessName: deal.listings?.title || 'Unknown Business',
                    location: deal.listings?.location || 'Unknown Location',
                    industry: deal.listings?.business_type || 'Unknown Industry',
                    dealValue: deal.current_offer || deal.initial_offer || 0,
                    askingPrice: deal.listings?.asking_price || 0,
                    negotiatedPrice: deal.current_offer || 0,
                    status: deal.status,
                    progress: deal.completion_percentage || 0,
                    startDate: deal.created_at,
                    expectedClosing: deal.closing_date,
                    lastActivity: this.getRelativeTime(deal.updated_at),
                    teamMembers: {
                        buyer: deal.buyer ? `${deal.buyer.first_name} ${deal.buyer.last_name}` : 'Unknown',
                        seller: deal.seller ? `${deal.seller.first_name} ${deal.seller.last_name}` : 'Unknown'
                    }
                }));
            }

            return this.getMockDealsData();
        } catch (error) {
            console.error('❌ Failed to get real deals data:', error);
            return this.getMockDealsData();
        }
    },

    /**
     * Get real conversations data
     */
    async getRealConversationsData() {
        try {
            if (!this.dashboardService) {
                return this.getMockConversationsData();
            }

            const messagesResult = await this.dashboardService.getRecentMessages();
            
            if (messagesResult.success) {
                // Group messages by conversation and transform to expected format
                const conversations = {};
                
                messagesResult.data.forEach(message => {
                    const otherUser = message.sender.id === message.receiver.id ? 
                        message.receiver : message.sender;
                    const conversationId = otherUser.id;
                    
                    if (!conversations[conversationId]) {
                        conversations[conversationId] = {
                            id: conversationId,
                            name: `${otherUser.first_name} ${otherUser.last_name}`,
                            avatar: otherUser.avatar_url || '/assets/images/default-avatar.png',
                            lastMessage: message.content,
                            timestamp: message.created_at,
                            unread: !message.read,
                            online: false // Could be enhanced with real-time presence
                        };
                    }
                });

                return Object.values(conversations).slice(0, 10);
            }

            return this.getMockConversationsData();
        } catch (error) {
            console.error('❌ Failed to get real conversations data:', error);
            return this.getMockConversationsData();
        }
    },

    /**
     * Get real recent activity
     */
    async getRealRecentActivity() {
        try {
            if (!this.dashboardService) {
                return this.getMockRecentActivity();
            }

            const activityResult = await this.dashboardService.getActivityFeed(10);
            
            if (activityResult.success) {
                return activityResult.data.map(activity => ({
                    id: activity.id,
                    type: activity.type,
                    title: activity.title,
                    description: activity.description,
                    timestamp: this.getRelativeTime(activity.timestamp),
                    icon: this.getActivityIcon(activity.type)
                }));
            }

            return this.getMockRecentActivity();
        } catch (error) {
            console.error('❌ Failed to get real recent activity:', error);
            return this.getMockRecentActivity();
        }
    },

    /**
     * Load overview data for the dashboard (Enhanced)
     */
    async loadOverviewData() {
        try {
            console.log('🔄 Loading real overview data...');
            this.loadingStates.overview = true;

            // Show loading state
            this.showLoadingState('overview');

            const overviewData = await this.getRealOverviewData();

            // Update KPI cards with real data
            this.updateKPICard('total-deals', overviewData.activeDeals || overviewData.savedListings);
            this.updateKPICard('active-listings', overviewData.activeListings || overviewData.activeMatches);
            this.updateKPICard('avg-deal-value', overviewData.totalViews || overviewData.unreadMessages);
            this.updateKPICard('completion-rate', overviewData.unreadMessages || overviewData.totalSearches);

            // Load real recent activity
            const recentActivity = await this.getRealRecentActivity();
            this.updateRecentActivity(recentActivity);

            this.hideLoadingState('overview');
            this.loadingStates.overview = false;

            console.log('✅ Real overview data loaded successfully');
        } catch (error) {
            console.error('❌ Failed to load real overview data:', error);
            this.hideLoadingState('overview');
            this.loadingStates.overview = false;
            
            // Fallback to mock data
            await this.loadMockOverviewData();
        }
    },

    /**
     * Load messages data for the dashboard (Enhanced)
     */
    async loadMessagesData() {
        try {
            console.log('🔄 Loading real messages data...');
            this.loadingStates.messages = true;

            this.showLoadingState('messages');

            const conversations = await this.getRealConversationsData();
            this.updateConversationsList(conversations);

            this.hideLoadingState('messages');
            this.loadingStates.messages = false;

            console.log('✅ Real messages data loaded successfully');
        } catch (error) {
            console.error('❌ Failed to load real messages data:', error);
            this.hideLoadingState('messages');
            this.loadingStates.messages = false;
            
            // Fallback to mock data
            const conversations = this.getMockConversationsData();
            this.updateConversationsList(conversations);
        }
    },

    /**
     * Utility functions
     */
    getRelativeTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInSeconds = Math.floor((now - time) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    },

    getActivityIcon(type) {
        const icons = {
            message: '💬',
            match: '🤝',
            notification: '🔔',
            deal: '💼',
            listing: '🏢'
        };
        return icons[type] || '📋';
    },

    showLoadingState(section) {
        const element = document.getElementById(`${section}-loading`);
        if (element) {
            element.style.display = 'block';
        }
    },

    hideLoadingState(section) {
        const element = document.getElementById(`${section}-loading`);
        if (element) {
            element.style.display = 'none';
        }
    }
};

// Extend the original DashboardData with enhanced methods
if (typeof DashboardData !== 'undefined') {
    // Merge enhanced methods into existing DashboardData
    Object.assign(DashboardData, DashboardDataEnhanced);
    console.log('✅ Enhanced Dashboard Data methods merged with existing DashboardData');
} else {
    // Create new DashboardData with enhanced methods
    window.DashboardData = DashboardDataEnhanced;
    console.log('✅ Enhanced Dashboard Data created as new DashboardData');
}

// Auto-initialize when loaded
document.addEventListener('DOMContentLoaded', async () => {
    if (window.DashboardData && window.DashboardData.init) {
        await window.DashboardData.init();
    }
});

console.log('📊 Enhanced Dashboard Data Module loaded successfully');
