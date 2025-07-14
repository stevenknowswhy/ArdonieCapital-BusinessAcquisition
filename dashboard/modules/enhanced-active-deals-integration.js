/**
 * Enhanced Active Deals Integration for Buyer Dashboard
 * Replaces mock data with real Supabase integration
 * Implements full functionality for deals management
 */

console.log('💼 Loading Enhanced Active Deals Integration...');

/**
 * Enhanced Active Deals Integration Service
 * Provides comprehensive deals functionality with Supabase backend
 */
const EnhancedActiveDealsIntegration = {
    // Service instances
    supabaseClient: null,
    currentUser: null,
    userProfile: null,
    isInitialized: false,
    
    // Current state
    deals: [],
    filteredDeals: [],
    currentFilters: {
        search: '',
        status: '',
        value: ''
    },
    
    // Real-time subscriptions
    subscriptions: [],
    
    // Cache for performance
    cache: new Map(),
    cacheTimeout: 5 * 60 * 1000, // 5 minutes for deals

    /**
     * Initialize the active deals integration
     */
    async init() {
        try {
            console.log('🔄 Initializing Enhanced Active Deals Integration...');
            
            // Get Supabase client from global or buyer dashboard integration
            if (window.BuyerDashboardSupabase && window.BuyerDashboardSupabase.supabaseClient) {
                this.supabaseClient = window.BuyerDashboardSupabase.supabaseClient;
                this.currentUser = window.BuyerDashboardSupabase.currentUser;
                this.userProfile = window.BuyerDashboardSupabase.userProfile;
            } else if (window.supabase) {
                this.supabaseClient = window.supabase;
                const { data: { user }, error } = await this.supabaseClient.auth.getUser();
                if (!error && user) {
                    this.currentUser = user;
                    await this.loadUserProfile();
                }
            } else {
                throw new Error('Supabase client not available');
            }

            if (!this.currentUser) {
                console.warn('⚠️ No authenticated user for active deals');
                return false;
            }
            
            // Setup real-time subscriptions
            this.setupRealtimeSubscriptions();
            
            // Setup event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('✅ Enhanced Active Deals Integration initialized');
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Enhanced Active Deals Integration:', error);
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
        } catch (error) {
            console.error('❌ Error loading user profile for deals:', error);
        }
    },

    /**
     * Setup real-time subscriptions for deals
     */
    setupRealtimeSubscriptions() {
        try {
            // Subscribe to deals updates for real-time changes
            const dealsSubscription = this.supabaseClient
                .channel('enhanced-deals')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'deals'
                }, (payload) => {
                    console.log('💼 Deal update received:', payload);
                    this.handleDealUpdate(payload);
                })
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'deal_participants'
                }, (payload) => {
                    console.log('👥 Deal participant update received:', payload);
                    this.handleDealParticipantUpdate(payload);
                })
                .subscribe();

            this.subscriptions.push(dealsSubscription);
            console.log('✅ Real-time deals subscriptions setup');
        } catch (error) {
            console.error('❌ Error setting up deals subscriptions:', error);
        }
    },

    /**
     * Handle real-time deal updates
     */
    async handleDealUpdate(payload) {
        const { eventType, new: newDeal, old: oldDeal } = payload;
        
        if (eventType === 'INSERT' || eventType === 'UPDATE') {
            // Check if this deal involves the current user
            const isRelevant = await this.isDealRelevantToUser(newDeal);
            if (isRelevant) {
                await this.loadDeals();
                this.updateDealCountInUI();
            }
        } else if (eventType === 'DELETE') {
            // Remove deal from local state
            this.deals = this.deals.filter(deal => deal.id !== oldDeal.id);
            this.applyFilters();
            this.updateDealCountInUI();
        }
    },

    /**
     * Handle deal participant updates
     */
    async handleDealParticipantUpdate(payload) {
        const { eventType, new: newParticipant } = payload;
        
        if (eventType === 'INSERT' && newParticipant.user_id === this.currentUser.id) {
            // User was added to a deal
            await this.loadDeals();
            this.updateDealCountInUI();
        }
    },

    /**
     * Check if deal is relevant to current user
     */
    async isDealRelevantToUser(deal) {
        try {
            const { data, error } = await this.supabaseClient
                .from('deal_participants')
                .select('id')
                .eq('deal_id', deal.id)
                .eq('user_id', this.currentUser.id)
                .single();

            return !error && data;
        } catch (error) {
            return false;
        }
    },

    /**
     * Load deals from database
     */
    async loadDeals() {
        try {
            console.log('🔄 Loading deals from database...');
            
            // Check cache first
            const cacheKey = `deals_${this.currentUser.id}`;
            const cached = this.cache.get(cacheKey);
            if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
                this.deals = cached.data;
                this.applyFilters();
                console.log('✅ Deals loaded from cache');
                return;
            }

            // Get deals where user is a participant
            const { data, error } = await this.supabaseClient
                .from('deals')
                .select(`
                    id,
                    deal_number,
                    business_name,
                    business_type,
                    location,
                    asking_price,
                    negotiated_price,
                    ebitda,
                    revenue,
                    status,
                    progress_percentage,
                    start_date,
                    expected_closing_date,
                    last_activity_date,
                    created_at,
                    updated_at,
                    deal_participants!inner (
                        role,
                        user_id
                    ),
                    listings (
                        id,
                        title,
                        description,
                        images
                    )
                `)
                .eq('deal_participants.user_id', this.currentUser.id)
                .eq('deal_participants.is_active', true)
                .order('updated_at', { ascending: false });

            if (error) throw error;

            // Process deals data
            this.deals = data.map(deal => ({
                id: deal.id,
                dealNumber: deal.deal_number,
                businessName: deal.business_name,
                businessType: deal.business_type,
                location: deal.location,
                askingPrice: deal.asking_price,
                negotiatedPrice: deal.negotiated_price,
                ebitda: deal.ebitda,
                revenue: deal.revenue,
                status: deal.status,
                progressPercentage: deal.progress_percentage,
                startDate: deal.start_date,
                expectedClosing: deal.expected_closing_date,
                lastActivity: this.formatLastActivity(deal.last_activity_date),
                createdAt: deal.created_at,
                updatedAt: deal.updated_at,
                userRole: deal.deal_participants[0]?.role || 'participant',
                listing: deal.listings
            }));

            // Cache the results
            this.cache.set(cacheKey, {
                data: this.deals,
                timestamp: Date.now()
            });

            this.applyFilters();
            console.log(`✅ Loaded ${this.deals.length} deals from database`);
        } catch (error) {
            console.error('❌ Error loading deals:', error);
            // Fallback to empty state
            this.deals = [];
            this.filteredDeals = [];
        }
    },

    /**
     * Apply current filters to deals
     */
    applyFilters() {
        let filtered = [...this.deals];

        // Apply search filter
        if (this.currentFilters.search) {
            const searchTerm = this.currentFilters.search.toLowerCase();
            filtered = filtered.filter(deal => 
                deal.businessName.toLowerCase().includes(searchTerm) ||
                deal.location.toLowerCase().includes(searchTerm) ||
                deal.businessType.toLowerCase().includes(searchTerm) ||
                deal.dealNumber.toLowerCase().includes(searchTerm)
            );
        }

        // Apply status filter
        if (this.currentFilters.status) {
            filtered = filtered.filter(deal => deal.status === this.currentFilters.status);
        }

        // Apply value filter
        if (this.currentFilters.value) {
            filtered = filtered.filter(deal => {
                const price = deal.askingPrice || 0;
                switch (this.currentFilters.value) {
                    case '0-250000':
                        return price < 250000;
                    case '250000-500000':
                        return price >= 250000 && price < 500000;
                    case '500000-1000000':
                        return price >= 500000 && price < 1000000;
                    case '1000000+':
                        return price >= 1000000;
                    default:
                        return true;
                }
            });
        }

        this.filteredDeals = filtered;
        this.renderDealsGrid();
    },

    /**
     * Render deals grid
     */
    renderDealsGrid() {
        const container = document.getElementById('deals-grid');
        if (!container) return;

        // Check subscription limits for free tier users
        const isFreeTier = this.getCurrentSubscriptionTier() === 'free';
        const maxDealsForFreeTier = 3;
        let dealsToShow = this.filteredDeals;

        if (isFreeTier && this.filteredDeals.length > maxDealsForFreeTier) {
            dealsToShow = this.filteredDeals.slice(0, maxDealsForFreeTier);
        }

        if (dealsToShow.length === 0) {
            container.innerHTML = this.createEmptyStateHTML();
        } else {
            let dealsHTML = dealsToShow.map(deal => this.createDealCardHTML(deal)).join('');
            
            // Add upgrade prompt for free tier users
            if (isFreeTier && this.filteredDeals.length > maxDealsForFreeTier) {
                dealsHTML += this.createUpgradePromptHTML(this.filteredDeals.length - maxDealsForFreeTier);
            }
            
            container.innerHTML = dealsHTML;
        }

        // Setup card click handlers
        this.setupDealCardHandlers();
    },

    /**
     * Create empty state HTML
     */
    createEmptyStateHTML() {
        return `
            <div class="col-span-full text-center py-12">
                <div class="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                </div>
                <h3 class="text-lg font-medium text-slate-900 dark:text-white mb-2">No active deals found</h3>
                <p class="text-slate-600 dark:text-slate-400 mb-4">
                    ${this.currentFilters.search || this.currentFilters.status || this.currentFilters.value ? 
                        'Try adjusting your filters or start exploring listings to begin your first deal' : 
                        'Start exploring listings to begin your first deal'
                    }
                </p>
                <div class="space-x-3">
                    ${this.currentFilters.search || this.currentFilters.status || this.currentFilters.value ? 
                        '<button type="button" onclick="EnhancedActiveDealsIntegration.clearFilters()" class="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">Clear Filters</button>' : 
                        ''
                    }
                    <button type="button" onclick="window.location.href='../marketplace/listings.html'" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                        Browse Listings
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Create upgrade prompt HTML for free tier users
     */
    createUpgradePromptHTML(hiddenCount) {
        return `
            <div class="col-span-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-6 text-center">
                <div class="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                </div>
                <h3 class="text-lg font-medium text-slate-900 dark:text-white mb-2">Upgrade to See More Deals</h3>
                <p class="text-slate-600 dark:text-slate-400 mb-4">
                    You have ${hiddenCount} more deal${hiddenCount > 1 ? 's' : ''} available. Upgrade to Pro to view all your deals and unlock advanced features.
                </p>
                <button type="button" onclick="window.location.href='./buyer-settings.html#subscription'" class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                    Upgrade to Pro
                </button>
            </div>
        `;
    }
};

    /**
     * Create deal card HTML
     */
    createDealCardHTML(deal) {
        const statusColors = {
            'initial_interest': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            'due_diligence': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            'negotiation': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
            'financing': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            'legal_review': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
            'closing': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        };

        const progressPercentage = deal.progressPercentage || this.calculateProgressFromStatus(deal.status);

        return `
            <div class="deal-card bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow cursor-pointer" data-deal-id="${deal.id}">
                <div class="p-6">
                    <!-- Header -->
                    <div class="flex items-start justify-between mb-4">
                        <div>
                            <h3 class="font-semibold text-slate-900 dark:text-white mb-1">${deal.businessName}</h3>
                            <p class="text-sm text-slate-600 dark:text-slate-400">${deal.location} • ${deal.businessType}</p>
                            <p class="text-xs text-slate-500 dark:text-slate-500 mt-1">Deal #${deal.dealNumber}</p>
                        </div>
                        <span class="px-2 py-1 text-xs font-medium rounded-full ${statusColors[deal.status] || statusColors.initial_interest}">
                            ${deal.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                    </div>

                    <!-- Progress Bar -->
                    <div class="mb-4">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Progress</span>
                            <span class="text-sm text-slate-600 dark:text-slate-400">${progressPercentage}%</span>
                        </div>
                        <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div class="bg-primary h-2 rounded-full transition-all duration-300" style="width: ${progressPercentage}%"></div>
                        </div>
                    </div>

                    <!-- Deal Details -->
                    <div class="space-y-2 mb-4">
                        <div class="flex justify-between text-sm">
                            <span class="text-slate-600 dark:text-slate-400">Asking Price</span>
                            <span class="font-medium text-slate-900 dark:text-white">${this.formatCurrency(deal.askingPrice)}</span>
                        </div>
                        ${deal.negotiatedPrice ? `
                            <div class="flex justify-between text-sm">
                                <span class="text-slate-600 dark:text-slate-400">Negotiated</span>
                                <span class="font-medium text-green-600 dark:text-green-400">${this.formatCurrency(deal.negotiatedPrice)}</span>
                            </div>
                        ` : ''}
                        <div class="flex justify-between text-sm">
                            <span class="text-slate-600 dark:text-slate-400">Revenue</span>
                            <span class="font-medium text-slate-900 dark:text-white">${this.formatCurrency(deal.revenue)}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-slate-600 dark:text-slate-400">EBITDA</span>
                            <span class="font-medium text-slate-900 dark:text-white">${this.formatCurrency(deal.ebitda)}</span>
                        </div>
                    </div>

                    <!-- Last Activity -->
                    <div class="pt-3 border-t border-slate-200 dark:border-slate-700">
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-slate-600 dark:text-slate-400">Last Activity</span>
                            <span class="text-slate-900 dark:text-white">${deal.lastActivity}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Setup deal card click handlers
     */
    setupDealCardHandlers() {
        const dealCards = document.querySelectorAll('.deal-card');
        dealCards.forEach(card => {
            card.addEventListener('click', () => {
                const dealId = card.dataset.dealId;
                this.showDealDetail(dealId);
            });
        });
    },

    /**
     * Show deal detail view
     */
    async showDealDetail(dealId) {
        try {
            const deal = this.deals.find(d => d.id === dealId);
            if (!deal) {
                console.error('Deal not found:', dealId);
                return;
            }

            // Load additional deal details if needed
            const detailData = await this.loadDealDetails(dealId);

            // Show detail view
            const listView = document.getElementById('active-deals-list');
            const detailView = document.getElementById('deal-detail-view');

            if (listView && detailView) {
                detailView.innerHTML = this.createDealDetailHTML({...deal, ...detailData});
                listView.style.display = 'none';
                detailView.style.display = 'block';

                // Setup detail view event listeners
                this.setupDealDetailEventListeners();
            }
        } catch (error) {
            console.error('❌ Error showing deal detail:', error);
        }
    },

    /**
     * Load additional deal details
     */
    async loadDealDetails(dealId) {
        try {
            const { data, error } = await this.supabaseClient
                .from('deals')
                .select(`
                    *,
                    deal_participants (
                        role,
                        profiles (
                            first_name,
                            last_name,
                            company
                        )
                    ),
                    deal_activities (
                        id,
                        activity_type,
                        description,
                        created_at,
                        profiles (
                            first_name,
                            last_name
                        )
                    )
                `)
                .eq('id', dealId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error loading deal details:', error);
            return {};
        }
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('deals-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value;
                this.applyFilters();
            });
        }

        // Status filter
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.currentFilters.status = e.target.value;
                this.applyFilters();
            });
        }

        // Value filter
        const valueFilter = document.getElementById('value-filter');
        if (valueFilter) {
            valueFilter.addEventListener('change', (e) => {
                this.currentFilters.value = e.target.value;
                this.applyFilters();
            });
        }

        // Clear filters button
        const clearFiltersBtn = document.getElementById('clear-filters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }

        // New Deal button
        const newDealBtn = document.querySelector('button:contains("New Deal")');
        if (newDealBtn) {
            newDealBtn.addEventListener('click', () => {
                this.handleNewDeal();
            });
        }
    },

    /**
     * Clear all filters
     */
    clearFilters() {
        this.currentFilters = { search: '', status: '', value: '' };

        // Reset form elements
        const searchInput = document.getElementById('deals-search');
        const statusFilter = document.getElementById('status-filter');
        const valueFilter = document.getElementById('value-filter');

        if (searchInput) searchInput.value = '';
        if (statusFilter) statusFilter.value = '';
        if (valueFilter) valueFilter.value = '';

        this.applyFilters();
    },

    /**
     * Handle new deal creation
     */
    handleNewDeal() {
        // Check subscription limits for free tier
        const isFreeTier = this.getCurrentSubscriptionTier() === 'free';
        const maxDealsForFreeTier = 3;

        if (isFreeTier && this.deals.length >= maxDealsForFreeTier) {
            this.showUpgradePrompt('deal_creation');
            return;
        }

        // Navigate to listings to start a new deal
        window.location.href = '../marketplace/listings.html?action=start_deal';
    },

    /**
     * Update deal count in UI
     */
    updateDealCountInUI() {
        // Update sidebar badge
        const dealBadge = document.querySelector('[data-section="active-deals"] .ml-auto');
        if (dealBadge) {
            dealBadge.textContent = this.deals.length;
        }

        // Update KPI card
        const kpiElement = document.querySelector('[data-kpi="activeDeals"] .kpi-value');
        if (kpiElement) {
            kpiElement.textContent = this.deals.length;
        }
    },

    /**
     * Utility functions
     */
    formatCurrency(amount) {
        if (!amount) return '$0';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    },

    formatLastActivity(date) {
        if (!date) return 'No activity';
        const now = new Date();
        const activityDate = new Date(date);
        const diffInHours = (now - activityDate) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)} hours ago`;
        } else if (diffInHours < 168) { // 7 days
            return `${Math.floor(diffInHours / 24)} days ago`;
        } else {
            return activityDate.toLocaleDateString();
        }
    },

    calculateProgressFromStatus(status) {
        const statusProgress = {
            'initial_interest': 15,
            'due_diligence': 35,
            'negotiation': 55,
            'financing': 75,
            'legal_review': 85,
            'closing': 95
        };
        return statusProgress[status] || 10;
    },

    getCurrentSubscriptionTier() {
        if (!this.userProfile?.user_subscriptions?.[0]) {
            return 'free';
        }
        return this.userProfile.user_subscriptions[0].subscription_tiers?.slug || 'free';
    },

    showUpgradePrompt(feature) {
        if (window.SidebarNavigationIntegration && window.SidebarNavigationIntegration.showUpgradePrompt) {
            window.SidebarNavigationIntegration.showUpgradePrompt(feature);
        }
    },

    /**
     * Update dashboard deals data
     */
    async updateDashboardDealsData() {
        try {
            console.log('🔄 Updating dashboard deals data...');

            // Load fresh deals data
            await this.loadDeals();

            // Update UI counts
            this.updateDealCountInUI();

            console.log('✅ Dashboard deals data updated');
        } catch (error) {
            console.error('❌ Error updating dashboard deals data:', error);
        }
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
    // Wait for buyer dashboard to initialize first
    setTimeout(async () => {
        try {
            const initialized = await EnhancedActiveDealsIntegration.init();
            if (initialized) {
                console.log('✅ Enhanced Active Deals Integration ready');

                // Load initial data
                await EnhancedActiveDealsIntegration.updateDashboardDealsData();

                // Set up periodic updates
                setInterval(() => {
                    EnhancedActiveDealsIntegration.updateDashboardDealsData();
                }, 60000); // Update every minute
            }
        } catch (error) {
            console.error('❌ Failed to initialize Enhanced Active Deals Integration:', error);
        }
    }, 2000); // Wait for buyer dashboard
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    EnhancedActiveDealsIntegration.cleanup();
});

// Make available globally
window.EnhancedActiveDealsIntegration = EnhancedActiveDealsIntegration;
