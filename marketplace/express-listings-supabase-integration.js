/**
 * Express Listings Supabase Integration
 * Complete database integration for Express Listings functionality
 * Replaces static listings with real Supabase data
 */

console.log('🚀 Loading Express Listings Supabase Integration...');

/**
 * Express Listings Supabase Integration Service
 * Handles all database operations for Express Listings
 */
const ExpressListingsSupabase = {
    // Service instances
    supabaseClient: null,
    currentUser: null,
    userProfile: null,
    isInitialized: false,
    
    // Current state
    listings: [],
    filters: {
        search: '',
        priceRange: 'all',
        location: 'all',
        businessType: 'all',
        sortBy: 'newest'
    },
    
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
            console.log('🔄 Initializing Express Listings Supabase Integration...');
            
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

            // Get current authenticated user (optional for browsing)
            const { data: { user }, error } = await this.supabaseClient.auth.getUser();
            if (!error && user) {
                this.currentUser = user;
                await this.loadUserProfile();
            }
            
            // Setup real-time subscriptions
            this.setupRealtimeSubscriptions();
            
            // Setup event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('✅ Express Listings Supabase Integration initialized');
            
            // Load initial listings
            await this.loadListings();
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Express Listings Supabase Integration:', error);
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
            console.log('✅ User profile loaded for listings');
        } catch (error) {
            console.error('❌ Error loading user profile:', error);
        }
    },

    /**
     * Setup real-time subscriptions for live updates
     */
    setupRealtimeSubscriptions() {
        try {
            // Subscribe to listings for real-time updates
            const listingsSubscription = this.supabaseClient
                .channel('express-listings')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'listings',
                    filter: 'status=eq.active'
                }, (payload) => {
                    console.log('📋 Listing update received:', payload);
                    this.invalidateCache('listings');
                    this.loadListings();
                })
                .subscribe();

            this.subscriptions.push(listingsSubscription);
            console.log('✅ Real-time subscriptions setup for listings');
        } catch (error) {
            console.error('❌ Error setting up real-time subscriptions:', error);
        }
    },

    /**
     * Setup event listeners for filters and interactions
     */
    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value;
                this.debounceSearch();
            });
        }

        // Filter dropdowns
        const filterElements = document.querySelectorAll('[data-filter]');
        filterElements.forEach(element => {
            element.addEventListener('change', (e) => {
                const filterType = e.target.dataset.filter;
                this.filters[filterType] = e.target.value;
                this.loadListings();
            });
        });

        // Sort dropdown
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.filters.sortBy = e.target.value;
                this.loadListings();
            });
        }

        // View toggle buttons
        const gridViewBtn = document.querySelector('[aria-label="Grid view"]');
        const listViewBtn = document.querySelector('[aria-label="List view"]');
        
        if (gridViewBtn) {
            gridViewBtn.addEventListener('click', () => this.setViewMode('grid'));
        }
        
        if (listViewBtn) {
            listViewBtn.addEventListener('click', () => this.setViewMode('list'));
        }
    },

    /**
     * Debounced search function
     */
    debounceSearch: (() => {
        let timeout;
        return function() {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                this.loadListings();
            }, 300);
        };
    })(),

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
     * Load listings from Supabase with filters
     */
    async loadListings() {
        try {
            console.log('🔄 Loading listings from Supabase...');
            
            // Show loading state
            this.showLoadingState();

            // Build query
            let query = this.supabaseClient
                .from('listings')
                .select(`
                    *,
                    profiles!seller_id (
                        first_name,
                        last_name,
                        company,
                        phone
                    )
                `)
                .eq('status', 'active');

            // Apply filters
            if (this.filters.search) {
                query = query.or(`title.ilike.%${this.filters.search}%,description.ilike.%${this.filters.search}%,location.ilike.%${this.filters.search}%`);
            }

            if (this.filters.businessType !== 'all') {
                query = query.eq('business_type', this.filters.businessType);
            }

            if (this.filters.location !== 'all') {
                query = query.ilike('location', `%${this.filters.location}%`);
            }

            if (this.filters.priceRange !== 'all') {
                const priceRanges = {
                    'under-500k': [0, 500000],
                    '500k-1m': [500000, 1000000],
                    '1m-2m': [1000000, 2000000],
                    'over-2m': [2000000, 999999999]
                };
                
                if (priceRanges[this.filters.priceRange]) {
                    const [min, max] = priceRanges[this.filters.priceRange];
                    query = query.gte('asking_price', min).lte('asking_price', max);
                }
            }

            // Apply sorting
            switch (this.filters.sortBy) {
                case 'Price: Low to High':
                    query = query.order('asking_price', { ascending: true });
                    break;
                case 'Price: High to Low':
                    query = query.order('asking_price', { ascending: false });
                    break;
                case 'Revenue: High to Low':
                    query = query.order('annual_revenue', { ascending: false });
                    break;
                case 'Location':
                    query = query.order('location', { ascending: true });
                    break;
                default: // Newest
                    query = query.order('created_at', { ascending: false });
            }

            // Execute query
            const { data, error } = await query.limit(50);

            if (error) throw error;

            this.listings = data || [];
            console.log(`✅ Loaded ${this.listings.length} listings`);
            
            // Render listings
            this.renderListings();
            
            // Update results count
            this.updateResultsCount();

        } catch (error) {
            console.error('❌ Error loading listings:', error);
            this.showErrorState('Failed to load listings. Please try again.');
        }
    },

    /**
     * Show loading state
     */
    showLoadingState() {
        const container = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3');
        if (container) {
            container.innerHTML = `
                <div class="col-span-full flex items-center justify-center py-12">
                    <div class="text-center">
                        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p class="text-slate-600 dark:text-slate-400">Loading listings...</p>
                    </div>
                </div>
            `;
        }
    },

    /**
     * Show error state
     */
    showErrorState(message) {
        const container = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3');
        if (container) {
            container.innerHTML = `
                <div class="col-span-full flex items-center justify-center py-12">
                    <div class="text-center">
                        <div class="text-red-500 mb-4">
                            <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                            </svg>
                        </div>
                        <p class="text-slate-600 dark:text-slate-400 mb-4">${message}</p>
                        <button onclick="ExpressListingsSupabase.loadListings()" class="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors">
                            Try Again
                        </button>
                    </div>
                </div>
            `;
        }
    },

    /**
     * Render listings in the UI
     */
    renderListings() {
        const container = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3');
        if (!container) return;

        if (this.listings.length === 0) {
            container.innerHTML = `
                <div class="col-span-full flex items-center justify-center py-12">
                    <div class="text-center">
                        <div class="text-slate-400 mb-4">
                            <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                            </svg>
                        </div>
                        <p class="text-slate-600 dark:text-slate-400 mb-4">No listings found matching your criteria</p>
                        <button onclick="ExpressListingsSupabase.clearFilters()" class="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors">
                            Clear Filters
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = this.listings.map(listing => this.renderListingCard(listing)).join('');
    },

    /**
     * Render individual listing card
     */
    renderListingCard(listing) {
        const sellerName = listing.profiles ? 
            `${listing.profiles.first_name} ${listing.profiles.last_name}`.trim() : 
            'Private Seller';
        
        const imageUrl = listing.images && listing.images.length > 0 ? 
            listing.images[0] : 
            'https://images.unsplash.com/photo-1632823469850-1b7b1e8b7e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80';

        const isExpressDeal = listing.featured || listing.express_deal;
        const urgencyBadge = isExpressDeal ? 
            '<div class="absolute top-3 right-3 bg-accent text-white text-xs font-bold px-2 py-1 rounded flex items-center">🚖 Express Seller</div>' :
            '';

        return `
            <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow">
                <div class="relative">
                    <img src="${imageUrl}" alt="${listing.title}" class="w-full h-48 object-cover" loading="lazy">
                    ${urgencyBadge}
                    <button type="button" 
                            onclick="ExpressListingsSupabase.toggleSaveListing('${listing.id}')"
                            aria-label="Add to favorites" 
                            title="Add to favorites" 
                            class="absolute top-3 left-3 p-2 bg-white/80 rounded-full hover:bg-white transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>
                </div>
                <div class="p-4">
                    <div class="flex items-center justify-between mb-2">
                        <span class="bg-primary-light/20 text-primary-dark text-xs font-medium px-2 py-1 rounded">${listing.business_type || 'Auto Repair'}</span>
                        <div class="flex items-center text-sm text-slate-500 dark:text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            ${listing.location}
                        </div>
                    </div>
                    <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">${listing.title}</h3>
                    <p class="text-sm text-slate-600 dark:text-slate-300 mb-3 line-clamp-2">${listing.description || 'No description available'}</p>
                    <div class="space-y-1 mb-4">
                        <div class="flex justify-between text-sm">
                            <span class="text-slate-500 dark:text-slate-400">Asking Price:</span>
                            <span class="font-semibold text-slate-900 dark:text-white">$${this.formatCurrency(listing.asking_price)}</span>
                        </div>
                        ${listing.ebitda ? `
                        <div class="flex justify-between text-sm">
                            <span class="text-slate-500 dark:text-slate-400">EBITDA:</span>
                            <span class="font-semibold text-slate-900 dark:text-white">$${this.formatCurrency(listing.ebitda)}/year</span>
                        </div>
                        ` : ''}
                        ${listing.annual_revenue ? `
                        <div class="flex justify-between text-sm">
                            <span class="text-slate-500 dark:text-slate-400">Revenue:</span>
                            <span class="font-semibold text-slate-900 dark:text-white">$${this.formatCurrency(listing.annual_revenue)}/year</span>
                        </div>
                        ` : ''}
                    </div>
                    <div class="flex space-x-2">
                        <button type="button" 
                                onclick="ExpressListingsSupabase.viewListing('${listing.id}')"
                                class="flex-1 bg-primary-dark hover:bg-primary text-white text-sm font-medium py-2 px-3 rounded-md transition-all">
                            View Details
                        </button>
                        <button type="button" 
                                onclick="ExpressListingsSupabase.contactSeller('${listing.id}')"
                                class="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium py-2 px-3 rounded-md transition-all">
                            Contact
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Format currency for display
     */
    formatCurrency(amount) {
        if (!amount) return '0';
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    },

    /**
     * Update results count display
     */
    updateResultsCount() {
        const countElement = document.querySelector('[data-results-count]');
        if (countElement) {
            countElement.textContent = `${this.listings.length} listings found`;
        }
    },

    /**
     * Clear all filters
     */
    clearFilters() {
        this.filters = {
            search: '',
            priceRange: 'all',
            location: 'all',
            businessType: 'all',
            sortBy: 'newest'
        };

        // Reset form elements
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = '';

        const filterElements = document.querySelectorAll('[data-filter]');
        filterElements.forEach(element => {
            element.value = 'all';
        });

        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) sortSelect.selectedIndex = 0;

        // Reload listings
        this.loadListings();
    },

    /**
     * Set view mode (grid or list)
     */
    setViewMode(mode) {
        const container = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3');
        const gridBtn = document.querySelector('[aria-label="Grid view"]');
        const listBtn = document.querySelector('[aria-label="List view"]');

        if (mode === 'grid') {
            container?.classList.remove('grid-cols-1');
            container?.classList.add('md:grid-cols-2', 'lg:grid-cols-3');
            gridBtn?.classList.add('bg-primary', 'text-white');
            gridBtn?.classList.remove('bg-white', 'dark:bg-slate-700', 'text-slate-600', 'dark:text-slate-300');
            listBtn?.classList.remove('bg-primary', 'text-white');
            listBtn?.classList.add('bg-white', 'dark:bg-slate-700', 'text-slate-600', 'dark:text-slate-300');
        } else {
            container?.classList.add('grid-cols-1');
            container?.classList.remove('md:grid-cols-2', 'lg:grid-cols-3');
            listBtn?.classList.add('bg-primary', 'text-white');
            listBtn?.classList.remove('bg-white', 'dark:bg-slate-700', 'text-slate-600', 'dark:text-slate-300');
            gridBtn?.classList.remove('bg-primary', 'text-white');
            gridBtn?.classList.add('bg-white', 'dark:bg-slate-700', 'text-slate-600', 'dark:text-slate-300');
        }
    },

    /**
     * Toggle save/favorite listing
     */
    async toggleSaveListing(listingId) {
        if (!this.currentUser) {
            alert('Please log in to save listings');
            window.location.href = '../auth/login.html';
            return;
        }

        try {
            // Check if already saved
            const { data: existing } = await this.supabaseClient
                .from('saved_listings')
                .select('id')
                .eq('buyer_id', this.userProfile.id)
                .eq('listing_id', listingId)
                .single();

            if (existing) {
                // Remove from saved
                const { error } = await this.supabaseClient
                    .from('saved_listings')
                    .delete()
                    .eq('id', existing.id);

                if (error) throw error;
                alert('Listing removed from favorites');
            } else {
                // Add to saved
                const { error } = await this.supabaseClient
                    .from('saved_listings')
                    .insert({
                        buyer_id: this.userProfile.id,
                        listing_id: listingId
                    });

                if (error) throw error;
                alert('Listing saved to favorites!');
            }

        } catch (error) {
            console.error('❌ Error toggling saved listing:', error);
            alert('Error saving listing. Please try again.');
        }
    },

    /**
     * View listing details
     */
    viewListing(listingId) {
        window.location.href = `listing-details.html?id=${listingId}`;
    },

    /**
     * Contact seller
     */
    contactSeller(listingId) {
        if (!this.currentUser) {
            alert('Please log in to contact sellers');
            window.location.href = '../auth/login.html';
            return;
        }
        
        window.location.href = `../messages/compose.html?listing=${listingId}`;
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
        const initialized = await ExpressListingsSupabase.init();
        if (initialized) {
            console.log('✅ Express Listings Supabase integration ready');
        }
    } catch (error) {
        console.error('❌ Failed to initialize Express Listings:', error);
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    ExpressListingsSupabase.cleanup();
});

// Make available globally
window.ExpressListingsSupabase = ExpressListingsSupabase;
