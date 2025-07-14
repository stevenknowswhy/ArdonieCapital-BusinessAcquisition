/**
 * Buyer Dashboard Supabase Integration
 * Complete integration with Supabase for buyer dashboard functionality
 * Replaces mock data with real database operations
 */

console.log('🔗 Loading Buyer Dashboard Supabase Integration...');

/**
 * Buyer Dashboard Supabase Integration Service
 * Handles all database operations for the buyer dashboard
 */
const BuyerDashboardSupabase = {
    // Service instances
    supabaseClient: null,
    currentUser: null,
    userProfile: null,
    isInitialized: false,
    
    // Real-time subscriptions
    subscriptions: [],
    
    // Cache for performance
    cache: new Map(),
    cacheTimeout: 5 * 60 * 1000, // 5 minutes

    /**
     * Initialize the Supabase integration
     */
    async init() {
        try {
            console.log('🔄 Initializing Buyer Dashboard Supabase Integration...');
            
            // Initialize Supabase client
            if (window.supabase) {
                this.supabaseClient = window.supabase;
            } else {
                // Import Supabase if not available globally
                const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
                this.supabaseClient = createClient(
                    'https://pbydepsqcypwqbicnsco.supabase.co',
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieWRlcHNxY3lwd3FiaWNuc2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjAxOTQsImV4cCI6MjA2NzQ5NjE5NH0.5aF46QcNOFN_vwXcHxCsVx_8a4EsqE1bL4fy4K7UXI0'
                );
            }

            // Get current authenticated user
            const { data: { user }, error } = await this.supabaseClient.auth.getUser();
            if (error || !user) {
                throw new Error('No authenticated user found');
            }
            
            this.currentUser = user;
            
            // Get user profile
            await this.loadUserProfile();
            
            // Setup real-time subscriptions
            this.setupRealtimeSubscriptions();
            
            this.isInitialized = true;
            console.log('✅ Buyer Dashboard Supabase Integration initialized');
            console.log('👤 User:', this.currentUser.email);
            console.log('📊 Profile:', this.userProfile);
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Buyer Dashboard Supabase Integration:', error);
            return false;
        }
    },

    /**
     * Load user profile from database
     */
    async loadUserProfile() {
        try {
            const { data, error } = await this.supabaseClient
                .from('profiles')
                .select(`
                    *,
                    user_subscriptions (
                        status,
                        subscription_tiers (
                            name,
                            slug,
                            features,
                            limits
                        )
                    )
                `)
                .eq('user_id', this.currentUser.id)
                .single();

            if (error) throw error;
            
            this.userProfile = data;
            console.log('✅ User profile loaded:', data);
        } catch (error) {
            console.error('❌ Error loading user profile:', error);
            throw error;
        }
    },

    /**
     * Setup real-time subscriptions for live updates
     */
    setupRealtimeSubscriptions() {
        try {
            // Subscribe to messages for real-time unread count updates
            const messagesSubscription = this.supabaseClient
                .channel('buyer-messages')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'messages',
                    filter: `recipient_id=eq.${this.currentUser.id}`
                }, (payload) => {
                    console.log('📨 Message update received:', payload);
                    this.invalidateCache('unreadMessages');
                    this.updateUnreadMessagesCount();
                })
                .subscribe();

            // Subscribe to saved listings updates
            const savedListingsSubscription = this.supabaseClient
                .channel('buyer-saved-listings')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'saved_listings',
                    filter: `buyer_id=eq.${this.userProfile.id}`
                }, (payload) => {
                    console.log('💾 Saved listing update received:', payload);
                    this.invalidateCache('savedListings');
                    this.updateSavedListingsCount();
                })
                .subscribe();

            this.subscriptions.push(messagesSubscription, savedListingsSubscription);
            console.log('✅ Real-time subscriptions setup complete');
        } catch (error) {
            console.error('❌ Error setting up real-time subscriptions:', error);
        }
    },

    /**
     * Get cached data or fetch from database
     */
    async getCachedData(key, fetchFunction, forceRefresh = false) {
        if (!forceRefresh && this.cache.has(key)) {
            const cached = this.cache.get(key);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        const data = await fetchFunction();
        this.cache.set(key, { data, timestamp: Date.now() });
        return data;
    },

    /**
     * Invalidate cache for specific key
     */
    invalidateCache(key) {
        this.cache.delete(key);
    },

    /**
     * Get dashboard overview statistics
     */
    async getDashboardOverview() {
        if (!this.isInitialized) await this.init();

        return await this.getCachedData('overview', async () => {
            const [savedListings, activeMatches, unreadMessages, activeDeals] = await Promise.all([
                this.getSavedListingsCount(),
                this.getActiveMatchesCount(),
                this.getUnreadMessagesCount(),
                this.getActiveDealsCount()
            ]);

            return {
                savedListings: {
                    value: savedListings,
                    change: '+2',
                    trend: 'up',
                    label: 'Saved Listings'
                },
                activeMatches: {
                    value: activeMatches,
                    change: '+1',
                    trend: 'up',
                    label: 'Active Matches'
                },
                unreadChat: {
                    value: unreadMessages,
                    change: '+3',
                    trend: 'up',
                    label: 'Unread Chat'
                },
                activeDeals: {
                    value: activeDeals,
                    change: activeDeals > 0 ? '+1' : '0',
                    trend: activeDeals > 0 ? 'up' : 'neutral',
                    label: 'Active Deals'
                }
            };
        });
    },

    /**
     * Get saved listings count
     */
    async getSavedListingsCount() {
        try {
            const { count, error } = await this.supabaseClient
                .from('saved_listings')
                .select('*', { count: 'exact', head: true })
                .eq('buyer_id', this.userProfile.id);

            if (error) throw error;
            return count || 0;
        } catch (error) {
            console.error('❌ Error getting saved listings count:', error);
            return 0;
        }
    },

    /**
     * Get active matches count
     */
    async getActiveMatchesCount() {
        try {
            const { count, error } = await this.supabaseClient
                .from('matches')
                .select('*', { count: 'exact', head: true })
                .eq('buyer_id', this.userProfile.id)
                .eq('status', 'active');

            if (error) throw error;
            return count || 0;
        } catch (error) {
            console.error('❌ Error getting active matches count:', error);
            return 0;
        }
    },

    /**
     * Get unread messages count
     */
    async getUnreadMessagesCount() {
        try {
            const { count, error } = await this.supabaseClient
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('recipient_id', this.currentUser.id)
                .eq('is_read', false);

            if (error) throw error;
            return count || 0;
        } catch (error) {
            console.error('❌ Error getting unread messages count:', error);
            return 0;
        }
    },

    /**
     * Get total searches count
     */
    async getTotalSearchesCount() {
        try {
            const { count, error } = await this.supabaseClient
                .from('search_history')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', this.userProfile.id);

            if (error) throw error;
            return count || 0;
        } catch (error) {
            console.error('❌ Error getting total searches count:', error);
            return 0;
        }
    },

    /**
     * Get active deals count
     */
    async getActiveDealsCount() {
        try {
            // Use the helper function from deals schema
            const { data, error } = await this.supabaseClient
                .rpc('get_user_active_deals_count', { user_uuid: this.currentUser.id });

            if (error) throw error;
            return data || 0;
        } catch (error) {
            console.error('❌ Error getting active deals count:', error);
            return 0;
        }
    },

    /**
     * Get saved listings with details
     */
    async getSavedListings(limit = 10) {
        return await this.getCachedData('savedListingsDetails', async () => {
            try {
                const { data, error } = await this.supabaseClient
                    .from('saved_listings')
                    .select(`
                        *,
                        listings (
                            id,
                            title,
                            asking_price,
                            location,
                            business_type,
                            industry,
                            annual_revenue,
                            images
                        )
                    `)
                    .eq('buyer_id', this.userProfile.id)
                    .order('created_at', { ascending: false })
                    .limit(limit);

                if (error) throw error;
                return data || [];
            } catch (error) {
                console.error('❌ Error getting saved listings:', error);
                return [];
            }
        });
    },

    /**
     * Get active matches with listing details
     */
    async getActiveMatches(limit = 10) {
        return await this.getCachedData('activeMatchesDetails', async () => {
            try {
                const { data, error } = await this.supabaseClient
                    .from('matches')
                    .select(`
                        *,
                        listings (
                            id,
                            title,
                            asking_price,
                            location,
                            business_type,
                            industry,
                            annual_revenue,
                            images
                        )
                    `)
                    .eq('buyer_id', this.userProfile.id)
                    .eq('status', 'active')
                    .order('compatibility_score', { ascending: false })
                    .limit(limit);

                if (error) throw error;
                return data || [];
            } catch (error) {
                console.error('❌ Error getting active matches:', error);
                return [];
            }
        });
    },

    /**
     * Get recent messages
     */
    async getRecentMessages(limit = 10) {
        return await this.getCachedData('recentMessages', async () => {
            try {
                const { data, error } = await this.supabaseClient
                    .from('messages')
                    .select(`
                        *,
                        sender:profiles!messages_sender_id_fkey (
                            first_name,
                            last_name,
                            avatar_url
                        ),
                        recipient:profiles!messages_recipient_id_fkey (
                            first_name,
                            last_name,
                            avatar_url
                        )
                    `)
                    .or(`sender_id.eq.${this.currentUser.id},recipient_id.eq.${this.currentUser.id}`)
                    .order('created_at', { ascending: false })
                    .limit(limit);

                if (error) throw error;
                return data || [];
            } catch (error) {
                console.error('❌ Error getting recent messages:', error);
                return [];
            }
        });
    },

    /**
     * Update dashboard UI with real data
     */
    async updateDashboardUI() {
        try {
            console.log('🔄 Updating dashboard UI with real data...');
            
            // Update overview statistics
            const overview = await this.getDashboardOverview();
            this.updateOverviewCards(overview);
            
            // Update saved listings section
            const savedListings = await this.getSavedListings(5);
            this.updateSavedListingsSection(savedListings);
            
            // Update matches section
            const matches = await this.getActiveMatches(5);
            this.updateMatchesSection(matches);
            
            // Update messages section
            const messages = await this.getRecentMessages(5);
            this.updateMessagesSection(messages);
            
            console.log('✅ Dashboard UI updated with real data');
        } catch (error) {
            console.error('❌ Error updating dashboard UI:', error);
        }
    },

    /**
     * Update overview cards with real data
     */
    updateOverviewCards(overview) {
        Object.keys(overview).forEach(key => {
            const card = document.querySelector(`[data-kpi="${key}"]`);
            if (card) {
                const valueElement = card.querySelector('.kpi-value');
                const changeElement = card.querySelector('.kpi-change');
                
                if (valueElement) valueElement.textContent = overview[key].value;
                if (changeElement) changeElement.textContent = overview[key].change;
            }
        });
    },

    /**
     * Update saved listings section
     */
    updateSavedListingsSection(listings) {
        const container = document.querySelector('#saved-listings-container');
        if (!container) return;

        if (listings.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <p>No saved listings yet</p>
                    <a href="../listings.html" class="text-blue-600 hover:underline">Browse listings</a>
                </div>
            `;
            return;
        }

        container.innerHTML = listings.map(item => `
            <div class="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                <h4 class="font-semibold text-gray-900">${item.listings.title}</h4>
                <p class="text-gray-600">${item.listings.location}</p>
                <p class="text-green-600 font-semibold">$${item.listings.asking_price?.toLocaleString()}</p>
                <p class="text-sm text-gray-500">${item.listings.business_type}</p>
            </div>
        `).join('');
    },

    /**
     * Update matches section
     */
    updateMatchesSection(matches) {
        const container = document.querySelector('#matches-container');
        if (!container) return;

        if (matches.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <p>No active matches yet</p>
                    <p class="text-sm">Complete your profile to get better matches</p>
                </div>
            `;
            return;
        }

        container.innerHTML = matches.map(match => `
            <div class="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-semibold text-gray-900">${match.listings.title}</h4>
                        <p class="text-gray-600">${match.listings.location}</p>
                        <p class="text-green-600 font-semibold">$${match.listings.asking_price?.toLocaleString()}</p>
                    </div>
                    <div class="text-right">
                        <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            ${Math.round(match.compatibility_score)}% match
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
    },

    /**
     * Update messages section
     */
    updateMessagesSection(messages) {
        const container = document.querySelector('#messages-container');
        if (!container) return;

        if (messages.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <p>No messages yet</p>
                    <p class="text-sm">Start conversations with sellers</p>
                </div>
            `;
            return;
        }

        container.innerHTML = messages.slice(0, 5).map(message => {
            const isFromCurrentUser = message.sender_id === this.currentUser.id;
            const otherUser = isFromCurrentUser ? message.recipient : message.sender;
            
            return `
                <div class="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            ${otherUser?.first_name?.[0] || '?'}
                        </div>
                        <div class="flex-1">
                            <h4 class="font-semibold text-gray-900">
                                ${otherUser?.first_name} ${otherUser?.last_name}
                            </h4>
                            <p class="text-gray-600 text-sm truncate">${message.subject || 'No subject'}</p>
                            <p class="text-xs text-gray-500">
                                ${new Date(message.created_at).toLocaleDateString()}
                            </p>
                        </div>
                        ${!message.is_read && !isFromCurrentUser ? 
                            '<div class="w-2 h-2 bg-blue-600 rounded-full"></div>' : ''
                        }
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Real-time update functions
     */
    async updateUnreadMessagesCount() {
        const count = await this.getUnreadMessagesCount();
        const element = document.querySelector('[data-kpi="unreadMessages"] .kpi-value');
        if (element) element.textContent = count;
    },

    async updateSavedListingsCount() {
        const count = await this.getSavedListingsCount();
        const element = document.querySelector('[data-kpi="savedListings"] .kpi-value');
        if (element) element.textContent = count;
    },

    /**
     * Cleanup subscriptions
     */
    cleanup() {
        this.subscriptions.forEach(subscription => {
            this.supabaseClient.removeChannel(subscription);
        });
        this.subscriptions = [];
        this.cache.clear();
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const initialized = await BuyerDashboardSupabase.init();
        if (initialized) {
            // Update UI with real data
            await BuyerDashboardSupabase.updateDashboardUI();
            
            // Set up periodic updates
            setInterval(() => {
                BuyerDashboardSupabase.updateDashboardUI();
            }, 30000); // Update every 30 seconds
        }
    } catch (error) {
        console.error('❌ Failed to initialize buyer dashboard:', error);
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    BuyerDashboardSupabase.cleanup();
});

// Make available globally
window.BuyerDashboardSupabase = BuyerDashboardSupabase;
