/**
 * CMS Marketplace Integration
 * Complete frontend/backend integration with Supabase for dynamic marketplace listings
 * Implements real-time updates, advanced filtering, search, and messaging system
 */

console.log('🏗️ Loading CMS Marketplace Integration...');

/**
 * CMS Marketplace Service
 * Handles all database operations and real-time functionality for marketplace
 */
class CMSMarketplace {
    constructor() {
        this.supabaseClient = null;
        this.currentUser = null;
        this.userProfile = null;
        this.isInitialized = false;

        // Current state
        this.listings = [];
        this.filteredListings = [];
        this.favorites = [];
        this.currentFilters = {
            search: '',
            businessTypes: [],
            priceMin: null,
            priceMax: null,
            location: 'all',
            revenue: null,
            expressOnly: false,
            sortBy: 'newest'
        };

        // Real-time subscriptions
        this.subscriptions = [];

        // Cache for performance
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes

        // Pagination
        this.currentPage = 1;
        this.itemsPerPage = 9;
        this.totalCount = 0;

        this.init();
    }

    /**
     * Initialize CMS Marketplace
     */
    async init() {
        try {
            console.log('🔄 Initializing CMS Marketplace...');

            // Initialize Supabase client
            await this.initSupabase();

            // Get current user and profile
            await this.getCurrentUser();

            // Load user favorites
            await this.loadUserFavorites();

            // Setup event listeners
            this.setupEventListeners();

            // Load listings from database
            await this.loadListings();

            // Setup real-time subscriptions
            this.setupRealTimeSubscriptions();

            this.isInitialized = true;
            console.log('✅ CMS Marketplace initialized successfully');

        } catch (error) {
            console.error('❌ Failed to initialize CMS Marketplace:', error);
            this.showError('Failed to initialize marketplace. Please refresh the page.');
        }
    }

    /**
     * Initialize Supabase client
     */
    async initSupabase() {
        try {
            // Import Supabase client
            const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');

            // Initialize client with project configuration
            this.supabaseClient = createClient(
                'https://pbydepsqcypwqbicnsco.supabase.co',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieWRlcHNxY3lwd3FiaWNuc2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjAxOTQsImV4cCI6MjA2NzQ5NjE5NH0.5aF46QcNOFN_vwXcHxCsVx_8a4EsqE1bL4fy4K7UXI0',
                {
                    auth: {
                        autoRefreshToken: true,
                        persistSession: true,
                        detectSessionInUrl: true
                    },
                    realtime: {
                        params: {
                            eventsPerSecond: 10
                        }
                    }
                }
            );

            // Test the connection
            const { data: testData, error: testError } = await this.supabaseClient
                .from('profiles')
                .select('count')
                .limit(1);

            if (testError) {
                console.warn('⚠️ Supabase connection test failed:', testError.message);
                console.log('📝 This may be due to RLS policies or missing tables - will use fallback data');
            } else {
                console.log('✅ Supabase client initialized and connection verified');
            }

        } catch (error) {
            console.error('❌ Failed to initialize Supabase:', error);
            console.log('📝 Will fall back to sample data for development');
            // Don't throw error - allow fallback to sample data
        }
    }

    /**
     * Get current authenticated user
     */
    async getCurrentUser() {
        try {
            const { data: { user }, error } = await this.supabaseClient.auth.getUser();

            if (error) {
                console.log('No authenticated user found');
                return;
            }

            this.currentUser = user;

            if (user) {
                // Get user profile
                const { data: profile, error: profileError } = await this.supabaseClient
                    .from('profiles')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (!profileError && profile) {
                    this.userProfile = profile;
                    console.log('✅ User profile loaded:', profile.first_name);
                }
            }

        } catch (error) {
            console.error('Error getting current user:', error);
        }
    }

    /**
     * Load user favorites from database
     */
    async loadUserFavorites() {
        try {
            if (!this.currentUser) {
                // Load from localStorage for non-authenticated users
                const saved = localStorage.getItem('marketplace-favorites');
                this.favorites = saved ? JSON.parse(saved) : [];
                return;
            }

            const { data, error } = await this.supabaseClient
                .from('saved_listings')
                .select('listing_id')
                .eq('buyer_id', this.userProfile?.id);

            if (!error && data) {
                this.favorites = data.map(item => item.listing_id);
                console.log('✅ User favorites loaded:', this.favorites.length);
            }

        } catch (error) {
            console.error('Error loading user favorites:', error);
            // Fallback to localStorage
            const saved = localStorage.getItem('marketplace-favorites');
            this.favorites = saved ? JSON.parse(saved) : [];
        }
    }

    /**
     * Check available columns in listings table
     */
    async checkAvailableColumns() {
        if (this.availableColumns) {
            return this.availableColumns;
        }

        try {
            // Try a simple query to see what columns are available
            const { data, error } = await this.supabaseClient
                .from('listings')
                .select('*')
                .limit(1);

            if (!error && data && data.length > 0) {
                this.availableColumns = Object.keys(data[0]);
                console.log('📋 Available columns:', this.availableColumns);
            } else {
                // Default columns if we can't determine them
                this.availableColumns = ['id', 'title', 'description', 'business_type', 'location', 'price', 'revenue', 'profit'];
                console.log('📋 Using default columns (could not determine available columns)');
            }
        } catch (error) {
            this.availableColumns = ['id', 'title', 'description', 'business_type', 'location', 'price', 'revenue', 'profit'];
            console.log('📋 Using default columns due to error:', error.message);
        }

        return this.availableColumns;
    }

    /**
     * Load listings from Supabase with filters and pagination
     */
    async loadListings() {
        try {
            console.log('🔄 Loading listings from database...');
            this.showLoadingState();

            // Check available columns first
            const availableColumns = await this.checkAvailableColumns();

            // Build query with filters
            let query = this.supabaseClient
                .from('listings')
                .select(`
                    *,
                    profiles!seller_id (
                        first_name,
                        last_name,
                        company,
                        phone,
                        avatar_url
                    )
                `)
                .eq('status', 'active');

            // Apply search filter
            if (this.currentFilters.search) {
                const searchTerm = this.currentFilters.search;
                query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,business_type.ilike.%${searchTerm}%`);
            }

            // Apply business type filter
            if (this.currentFilters.businessTypes.length > 0) {
                query = query.in('business_type', this.currentFilters.businessTypes);
            }

            // Apply price range filter
            if (this.currentFilters.priceMin) {
                query = query.gte('price', this.currentFilters.priceMin);
            }
            if (this.currentFilters.priceMax) {
                query = query.lte('price', this.currentFilters.priceMax);
            }

            // Apply location filter
            if (this.currentFilters.location !== 'all') {
                query = query.ilike('location', `%${this.currentFilters.location}%`);
            }

            // Apply express sellers filter (only if column exists)
            if (this.currentFilters.expressOnly && availableColumns.includes('express_seller')) {
                query = query.eq('express_seller', true);
            } else if (this.currentFilters.expressOnly) {
                console.warn('⚠️ express_seller column not found in database, skipping express filter');
            }

            // Apply sorting
            switch (this.currentFilters.sortBy) {
                case 'price-low':
                    query = query.order('price', { ascending: true });
                    break;
                case 'price-high':
                    query = query.order('price', { ascending: false });
                    break;
                case 'revenue-high':
                    query = query.order('revenue', { ascending: false });
                    break;
                case 'revenue-low':
                    query = query.order('revenue', { ascending: true });
                    break;
                case 'oldest':
                    query = query.order('created_at', { ascending: true });
                    break;
                default: // newest
                    query = query.order('created_at', { ascending: false });
            }

            // Apply pagination
            const startIndex = (this.currentPage - 1) * this.itemsPerPage;
            query = query.range(startIndex, startIndex + this.itemsPerPage - 1);

            // Execute query
            const { data, error, count } = await query;

            if (error) {
                throw error;
            }

            // Process listings data
            this.listings = data || [];
            this.filteredListings = [...this.listings];
            this.totalCount = count || this.listings.length;

            console.log(`✅ Loaded ${this.listings.length} listings from database`);

            // Render listings
            this.renderListings();
            this.updateResultsCount();

        } catch (error) {
            console.error('❌ Error loading listings:', error);

            // Provide detailed error information
            if (error.message?.includes('401')) {
                console.error('🔐 Authentication error - check API key and RLS policies');
                this.showError('Authentication error. Using sample data for demonstration.');
            } else if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
                console.error('🗄️ Database table missing - check if schema is deployed');
                this.showError('Database not ready. Using sample data for demonstration.');
            } else if (error.message?.includes('column') && error.message?.includes('does not exist')) {
                console.error('📋 Database column missing - schema may be incomplete');
                this.showError('Database schema incomplete. Using sample data for demonstration.');
            } else {
                console.error('🌐 Network or configuration error:', error.message);
                this.showError('Connection error. Using sample data for demonstration.');
            }

            // Fallback to sample data for development
            console.log('📝 Loading sample data as fallback...');
            this.loadSampleData();
        }
    }

    /**
     * Setup event listeners for filters and interactions
     */
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.currentFilters.search = e.target.value;
                    this.currentPage = 1; // Reset to first page
                    this.loadListings();
                }, 300); // Debounce search
            });
        }

        // Express sellers toggle
        const expressToggle = document.getElementById('express-only');
        if (expressToggle) {
            expressToggle.addEventListener('change', (e) => {
                this.currentFilters.expressOnly = e.target.checked;
                this.currentPage = 1;
                this.loadListings();
            });
        }

        // Price range filters
        const priceMinInput = document.getElementById('price-min');
        const priceMaxInput = document.getElementById('price-max');

        if (priceMinInput) {
            let priceTimeout;
            priceMinInput.addEventListener('input', (e) => {
                clearTimeout(priceTimeout);
                priceTimeout = setTimeout(() => {
                    this.currentFilters.priceMin = e.target.value ? parseInt(e.target.value) : null;
                    this.currentPage = 1;
                    this.loadListings();
                }, 500);
            });
        }

        if (priceMaxInput) {
            let priceTimeout;
            priceMaxInput.addEventListener('input', (e) => {
                clearTimeout(priceTimeout);
                priceTimeout = setTimeout(() => {
                    this.currentFilters.priceMax = e.target.value ? parseInt(e.target.value) : null;
                    this.currentPage = 1;
                    this.loadListings();
                }, 500);
            });
        }

        // Business type checkboxes
        const businessTypeCheckboxes = document.querySelectorAll('input[name="business-type"]');
        businessTypeCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.currentFilters.businessTypes = Array.from(businessTypeCheckboxes)
                    .filter(cb => cb.checked)
                    .map(cb => cb.value);
                this.currentPage = 1;
                this.loadListings();
            });
        });

        // Location filter
        const locationSelect = document.getElementById('location-filter');
        if (locationSelect) {
            locationSelect.addEventListener('change', (e) => {
                this.currentFilters.location = e.target.value;
                this.currentPage = 1;
                this.loadListings();
            });
        }

        // Sort functionality
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentFilters.sortBy = e.target.value;
                this.loadListings();
            });
        }
    }

    /**
     * Setup real-time subscriptions for live updates
     */
    setupRealTimeSubscriptions() {
        try {
            if (!this.supabaseClient) {
                console.log('⚠️ Supabase client not available - skipping real-time subscriptions');
                return;
            }

            // Subscribe to listings changes
            const listingsSubscription = this.supabaseClient
                .channel('listings_changes')
                .on('postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'listings'
                    },
                    (payload) => {
                        console.log('📡 Real-time listing update:', payload);
                        this.handleListingUpdate(payload);
                    }
                )
                .subscribe((status) => {
                    console.log('📡 Listings subscription status:', status);
                    if (status === 'SUBSCRIBED') {
                        console.log('✅ Real-time listings subscription active');
                    } else if (status === 'CHANNEL_ERROR') {
                        console.error('❌ Real-time listings subscription failed');
                    }
                });

            this.subscriptions.push(listingsSubscription);

            // Subscribe to saved listings changes (if user is authenticated)
            if (this.currentUser && this.userProfile) {
                const savedListingsSubscription = this.supabaseClient
                    .channel('saved_listings_changes')
                    .on('postgres_changes',
                        {
                            event: '*',
                            schema: 'public',
                            table: 'saved_listings',
                            filter: `buyer_id=eq.${this.userProfile.id}`
                        },
                        (payload) => {
                            console.log('📡 Real-time favorites update:', payload);
                            this.handleFavoritesUpdate(payload);
                        }
                    )
                    .subscribe((status) => {
                        console.log('📡 Favorites subscription status:', status);
                        if (status === 'SUBSCRIBED') {
                            console.log('✅ Real-time favorites subscription active');
                        } else if (status === 'CHANNEL_ERROR') {
                            console.error('❌ Real-time favorites subscription failed');
                        }
                    });

                this.subscriptions.push(savedListingsSubscription);
            } else {
                console.log('👤 User not authenticated - skipping favorites subscription');
            }

            console.log('✅ Real-time subscriptions setup complete');

        } catch (error) {
            console.error('❌ Error setting up real-time subscriptions:', error);
        }
    }

    /**
     * Handle real-time listing updates
     */
    handleListingUpdate(payload) {
        const { eventType, new: newRecord, old: oldRecord } = payload;

        switch (eventType) {
            case 'INSERT':
                // Add new listing if it matches current filters
                if (this.matchesCurrentFilters(newRecord)) {
                    this.listings.unshift(newRecord);
                    this.renderListings();
                    this.showToast('New listing added!', 'info');
                }
                break;

            case 'UPDATE':
                // Update existing listing
                const updateIndex = this.listings.findIndex(l => l.id === newRecord.id);
                if (updateIndex !== -1) {
                    this.listings[updateIndex] = newRecord;
                    this.renderListings();
                    this.showToast('Listing updated', 'info');
                }
                break;

            case 'DELETE':
                // Remove deleted listing
                this.listings = this.listings.filter(l => l.id !== oldRecord.id);
                this.renderListings();
                this.showToast('Listing removed', 'info');
                break;
        }

        this.updateResultsCount();
    }

    /**
     * Handle real-time favorites updates
     */
    handleFavoritesUpdate(payload) {
        const { eventType, new: newRecord, old: oldRecord } = payload;

        switch (eventType) {
            case 'INSERT':
                if (!this.favorites.includes(newRecord.listing_id)) {
                    this.favorites.push(newRecord.listing_id);
                    this.renderListings(); // Re-render to update heart icons
                }
                break;

            case 'DELETE':
                this.favorites = this.favorites.filter(id => id !== oldRecord.listing_id);
                this.renderListings(); // Re-render to update heart icons
                break;
        }
    }

    /**
     * Check if a listing matches current filters
     */
    matchesCurrentFilters(listing) {
        // Search filter
        if (this.currentFilters.search) {
            const searchTerm = this.currentFilters.search.toLowerCase();
            const searchableText = `${listing.title} ${listing.description} ${listing.location} ${listing.business_type}`.toLowerCase();
            if (!searchableText.includes(searchTerm)) return false;
        }

        // Business type filter
        if (this.currentFilters.businessTypes.length > 0) {
            if (!this.currentFilters.businessTypes.includes(listing.business_type)) return false;
        }

        // Price range filter
        if (this.currentFilters.priceMin && listing.price < this.currentFilters.priceMin) return false;
        if (this.currentFilters.priceMax && listing.price > this.currentFilters.priceMax) return false;

        // Location filter
        if (this.currentFilters.location !== 'all') {
            if (!listing.location.toLowerCase().includes(this.currentFilters.location.toLowerCase())) return false;
        }

        // Express sellers filter (only if column exists and is true)
        if (this.currentFilters.expressOnly && listing.express_seller !== true) return false;

        return true;
    }

    /**
     * Render listings to the page
     */
    renderListings() {
        const container = document.getElementById('listings-container');
        if (!container) return;

        if (this.listings.length === 0) {
            container.innerHTML = this.renderEmptyState();
            return;
        }

        container.innerHTML = this.listings.map(listing => this.renderListingCard(listing)).join('');
    }

    /**
     * Render empty state
     */
    renderEmptyState() {
        return `
            <div class="col-span-full text-center py-12">
                <div class="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                </div>
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">No listings found</h3>
                <p class="text-slate-600 dark:text-slate-300 mb-4">Try adjusting your filters to see more results.</p>
                <button type="button" onclick="window.cmsMarketplace.clearFilters()" class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                    Clear Filters
                </button>
            </div>
        `;
    }

    /**
     * Render individual listing card
     */
    renderListingCard(listing) {
        const isFavorite = this.favorites.includes(listing.id);
        const favoriteIcon = isFavorite ?
            `<svg class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>` :
            `<svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>`;

        // Generate badges
        const badges = [];
        if (listing.express_seller === true) {
            badges.push('<div class="absolute top-3 right-3 bg-accent text-white text-xs font-bold px-2 py-1 rounded">🚖 Express Seller</div>');
        }
        if (listing.featured === true) {
            badges.push('<div class="absolute top-3 right-3 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded">⭐ Featured</div>');
        }

        // Calculate ROI
        const roi = listing.profit && listing.price ? ((listing.profit / listing.price) * 100).toFixed(1) : 'N/A';

        // Format numbers
        const formatPrice = (price) => price ? `$${(price / 1000).toFixed(0)}K` : 'N/A';
        const formatRevenue = (revenue) => revenue ? `$${(revenue / 1000).toFixed(0)}K/year` : 'N/A';

        // Get seller name
        const sellerName = listing.profiles ?
            `${listing.profiles.first_name || ''} ${listing.profiles.last_name || ''}`.trim() || 'Private Seller' :
            'Private Seller';

        return `
            <div class="listing-card bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all duration-300">
                <div class="relative">
                    <img src="${listing.images?.[0] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80'}"
                         alt="${listing.title}"
                         class="w-full h-48 object-cover"
                         loading="lazy">
                    ${badges.join('')}
                    <button type="button"
                            onclick="window.cmsMarketplace.toggleFavorite('${listing.id}')"
                            aria-label="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}"
                            title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}"
                            class="absolute top-3 left-3 p-2 bg-white/80 rounded-full hover:bg-white transition-all favorite-heart">
                        ${favoriteIcon}
                    </button>
                </div>
                <div class="p-4">
                    <div class="flex items-center justify-between mb-2">
                        <span class="bg-primary-light/20 text-primary-dark text-xs font-medium px-2 py-1 rounded">${listing.business_type || 'Business'}</span>
                        <div class="flex items-center text-sm text-slate-500 dark:text-slate-400">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            ${listing.location || 'Location TBD'}
                        </div>
                    </div>
                    <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">${listing.title}</h3>
                    <p class="text-sm text-slate-600 dark:text-slate-300 mb-3 line-clamp-2">${listing.description || 'No description available.'}</p>
                    <div class="space-y-1 mb-4">
                        <div class="flex justify-between text-sm">
                            <span class="text-slate-500 dark:text-slate-400">Asking Price:</span>
                            <span class="font-semibold text-slate-900 dark:text-white">${formatPrice(listing.price)}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-slate-500 dark:text-slate-400">Revenue:</span>
                            <span class="font-semibold text-emerald-600">${formatRevenue(listing.revenue)}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-slate-500 dark:text-slate-400">ROI:</span>
                            <span class="font-semibold text-blue-600">${roi}${roi !== 'N/A' ? '%' : ''}</span>
                        </div>
                    </div>
                    <div class="flex space-x-2">
                        <button type="button"
                                onclick="window.cmsMarketplace.openDetailsModal('${listing.id}')"
                                class="flex-1 bg-primary-dark hover:bg-primary text-white text-sm font-medium py-2 px-3 rounded-md transition-all">
                            View Details
                        </button>
                        <button type="button"
                                onclick="window.cmsMarketplace.contactSeller('${listing.id}')"
                                class="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium py-2 px-3 rounded-md transition-all">
                            Contact
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Toggle favorite status for a listing
     */
    async toggleFavorite(listingId) {
        try {
            if (!this.currentUser || !this.userProfile) {
                // For non-authenticated users, use localStorage
                const index = this.favorites.indexOf(listingId);
                if (index > -1) {
                    this.favorites.splice(index, 1);
                    this.showToast('Removed from favorites', 'info');
                } else {
                    this.favorites.push(listingId);
                    this.showToast('Added to favorites!', 'success');
                }

                localStorage.setItem('marketplace-favorites', JSON.stringify(this.favorites));
                this.renderListings();
                return;
            }

            // For authenticated users, use database
            const { data: existing } = await this.supabaseClient
                .from('saved_listings')
                .select('id')
                .eq('buyer_id', this.userProfile.id)
                .eq('listing_id', listingId)
                .single();

            if (existing) {
                // Remove from favorites
                const { error } = await this.supabaseClient
                    .from('saved_listings')
                    .delete()
                    .eq('id', existing.id);

                if (error) throw error;

                this.favorites = this.favorites.filter(id => id !== listingId);
                this.showToast('Removed from favorites', 'info');
            } else {
                // Add to favorites
                const { error } = await this.supabaseClient
                    .from('saved_listings')
                    .insert({
                        buyer_id: this.userProfile.id,
                        listing_id: listingId
                    });

                if (error) throw error;

                this.favorites.push(listingId);
                this.showToast('Added to favorites!', 'success');
            }

            this.renderListings();

        } catch (error) {
            console.error('❌ Error toggling favorite:', error);
            this.showError('Error updating favorites. Please try again.');
        }
    }

    /**
     * Open detailed view modal for a listing
     */
    async openDetailsModal(listingId) {
        try {
            const listing = this.listings.find(l => l.id === listingId);
            if (!listing) {
                // Fetch from database if not in current listings
                const { data, error } = await this.supabaseClient
                    .from('listings')
                    .select(`
                        *,
                        profiles!seller_id (
                            first_name,
                            last_name,
                            company,
                            phone,
                            avatar_url
                        )
                    `)
                    .eq('id', listingId)
                    .single();

                if (error || !data) {
                    this.showError('Listing not found');
                    return;
                }

                listing = data;
            }

            // Populate modal with listing data
            this.populateModal(listing);

            // Show modal
            const modal = document.getElementById('business-details-modal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
                document.body.style.overflow = 'hidden';
            }

        } catch (error) {
            console.error('❌ Error opening details modal:', error);
            this.showError('Error loading business details');
        }
    }

    /**
     * Populate modal with listing data
     */
    populateModal(listing) {
        // Basic information
        document.getElementById('modal-business-name').textContent = listing.title;
        document.getElementById('modal-business-location').textContent = listing.location || 'Location TBD';

        // Main image
        const mainImage = document.getElementById('modal-main-image');
        mainImage.src = listing.images?.[0] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80';
        mainImage.alt = listing.title;

        // Key metrics
        document.getElementById('modal-asking-price').textContent = listing.price ? `$${(listing.price / 1000).toFixed(0)}K` : 'N/A';
        document.getElementById('modal-revenue').textContent = listing.revenue ? `$${(listing.revenue / 1000).toFixed(0)}K` : 'N/A';
        document.getElementById('modal-cash-flow').textContent = listing.profit ? `$${(listing.profit / 1000).toFixed(0)}K` : 'N/A';

        const roi = listing.profit && listing.price ? ((listing.profit / listing.price) * 100).toFixed(1) : 'N/A';
        document.getElementById('modal-roi').textContent = roi !== 'N/A' ? `${roi}%` : 'N/A';

        // Business details
        document.getElementById('modal-description').textContent = listing.description || 'No description available.';
        document.getElementById('modal-business-type').textContent = listing.business_type || 'Business';
        document.getElementById('modal-established').textContent = listing.established_year || 'N/A';
        document.getElementById('modal-employees').textContent = listing.employees || 'N/A';
        document.getElementById('modal-square-footage').textContent = listing.square_footage ? `${listing.square_footage.toLocaleString()} sq ft` : 'N/A';

        // Badges
        const badgesContainer = document.getElementById('modal-badges-container');
        const badges = [];
        if (listing.express_seller === true) {
            badges.push('<div class="bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">🚖 Express Seller</div>');
        }
        if (listing.featured === true) {
            badges.push('<div class="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">⭐ Featured</div>');
        }
        badgesContainer.innerHTML = badges.join('');

        // Features (if available)
        const featuresContainer = document.getElementById('modal-features-container');
        if (listing.features && Array.isArray(listing.features)) {
            featuresContainer.innerHTML = listing.features.map(feature =>
                `<span class="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm px-3 py-1 rounded-full">${feature}</span>`
            ).join('');
        } else {
            featuresContainer.innerHTML = '<span class="text-slate-500 dark:text-slate-400 text-sm">No specific features listed</span>';
        }

        // Seller information
        const sellerName = listing.profiles ?
            `${listing.profiles.first_name || ''} ${listing.profiles.last_name || ''}`.trim() || 'Private Seller' :
            'Private Seller';
        const sellerCompany = listing.profiles?.company || 'Independent Seller';
        const sellerInitials = sellerName.split(' ').map(n => n[0]).join('').toUpperCase() || 'PS';

        document.getElementById('modal-seller-name').textContent = sellerName;
        document.getElementById('modal-seller-company').textContent = sellerCompany;
        document.getElementById('modal-seller-initials').textContent = sellerInitials;

        // Update favorite button
        const favoriteBtn = document.getElementById('modal-favorite-btn');
        const isFavorite = this.favorites.includes(listing.id);
        favoriteBtn.dataset.listingId = listing.id;
        favoriteBtn.innerHTML = isFavorite ?
            `<svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>` :
            `<svg class="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>`;

        // Update action buttons
        document.getElementById('modal-contact-btn').dataset.listingId = listing.id;
        document.getElementById('modal-schedule-btn').dataset.listingId = listing.id;
    }

    /**
     * Close details modal
     */
    closeDetailsModal() {
        const modal = document.getElementById('business-details-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            document.body.style.overflow = '';
        }
    }

    /**
     * Contact seller - opens messaging system
     */
    async contactSeller(listingId) {
        try {
            if (!this.currentUser || !this.userProfile) {
                this.showError('Please log in to contact sellers');
                return;
            }

            const listing = this.listings.find(l => l.id === listingId);
            if (!listing) {
                this.showError('Listing not found');
                return;
            }

            // Create or find existing conversation
            const conversation = await this.createOrFindConversation(listing.seller_id, listingId);

            if (conversation) {
                // Open messaging interface
                this.openMessagingInterface(conversation, listing);
            }

        } catch (error) {
            console.error('❌ Error contacting seller:', error);
            this.showError('Error starting conversation. Please try again.');
        }
    }

    /**
     * Create or find existing conversation between buyer and seller
     */
    async createOrFindConversation(sellerId, listingId) {
        try {
            // Check for existing conversation
            const { data: existing, error: findError } = await this.supabaseClient
                .from('conversations')
                .select('*')
                .eq('buyer_id', this.userProfile.id)
                .eq('seller_id', sellerId)
                .eq('listing_id', listingId)
                .single();

            if (!findError && existing) {
                return existing;
            }

            // Create new conversation
            const { data: newConversation, error: createError } = await this.supabaseClient
                .from('conversations')
                .insert({
                    buyer_id: this.userProfile.id,
                    seller_id: sellerId,
                    listing_id: listingId,
                    status: 'active'
                })
                .select()
                .single();

            if (createError) throw createError;

            return newConversation;

        } catch (error) {
            console.error('❌ Error creating conversation:', error);
            throw error;
        }
    }

    /**
     * Open messaging interface
     */
    openMessagingInterface(conversation, listing) {
        // For now, show a simple contact form
        // In a full implementation, this would open a real-time messaging interface

        const sellerName = listing.profiles ?
            `${listing.profiles.first_name || ''} ${listing.profiles.last_name || ''}`.trim() || 'the seller' :
            'the seller';

        const message = `Hi ${sellerName},\n\nI'm interested in learning more about "${listing.title}" listed for ${listing.price ? `$${(listing.price / 1000).toFixed(0)}K` : 'the asking price'}.\n\nCould you please provide more details about:\n- Financial records\n- Reason for selling\n- Timeline for sale\n- Any additional information\n\nThank you for your time.\n\nBest regards,\n${this.userProfile.first_name || 'Interested Buyer'}`;

        // Show contact modal or redirect to messaging page
        this.showContactModal(conversation, listing, message);
    }

    /**
     * Show contact modal
     */
    showContactModal(conversation, listing, defaultMessage) {
        // Create and show contact modal
        const modalHtml = `
            <div id="contact-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                    <div class="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Contact Seller</h2>
                        <button type="button" onclick="window.cmsMarketplace.closeContactModal()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="p-6">
                        <div class="mb-4">
                            <h3 class="font-semibold text-slate-900 dark:text-white mb-2">Regarding: ${listing.title}</h3>
                            <p class="text-sm text-slate-600 dark:text-slate-300">${listing.location} • ${listing.price ? `$${(listing.price / 1000).toFixed(0)}K` : 'Price TBD'}</p>
                        </div>
                        <form id="contact-form" onsubmit="window.cmsMarketplace.sendMessage(event, '${conversation.id}')">
                            <div class="mb-4">
                                <label for="message-text" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Your Message</label>
                                <textarea id="message-text" rows="8" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">${defaultMessage}</textarea>
                            </div>
                            <div class="flex gap-3">
                                <button type="submit" class="flex-1 bg-gradient-to-r from-blue-500 to-emerald-600 hover:from-blue-600 hover:to-emerald-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300">
                                    Send Message
                                </button>
                                <button type="button" onclick="window.cmsMarketplace.closeContactModal()" class="border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 py-3 px-6 rounded-lg font-semibold transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        // Add modal to page
        const existingModal = document.getElementById('contact-modal');
        if (existingModal) {
            existingModal.remove();
        }

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.body.style.overflow = 'hidden';
    }

    /**
     * Send message to seller
     */
    async sendMessage(event, conversationId) {
        event.preventDefault();

        try {
            const messageText = document.getElementById('message-text').value.trim();
            if (!messageText) return;

            // Insert message into database
            const { error } = await this.supabaseClient
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    sender_id: this.userProfile.id,
                    content: messageText,
                    message_type: 'text'
                });

            if (error) throw error;

            this.showToast('Message sent successfully!', 'success');
            this.closeContactModal();

        } catch (error) {
            console.error('❌ Error sending message:', error);
            this.showError('Error sending message. Please try again.');
        }
    }

    /**
     * Close contact modal
     */
    closeContactModal() {
        const modal = document.getElementById('contact-modal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    }

    /**
     * Schedule tour (placeholder for future implementation)
     */
    scheduleTour(listingId) {
        const listing = this.listings.find(l => l.id === listingId);
        if (!listing) return;

        this.showToast(`Tour scheduling for ${listing.title} - Feature coming soon!`, 'info');
    }

    /**
     * Clear all filters
     */
    clearFilters() {
        // Reset filters
        this.currentFilters = {
            search: '',
            businessTypes: [],
            priceMin: null,
            priceMax: null,
            location: 'all',
            revenue: null,
            expressOnly: false,
            sortBy: 'newest'
        };

        // Reset form inputs
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = '';

        const expressToggle = document.getElementById('express-only');
        if (expressToggle) expressToggle.checked = false;

        const priceMinInput = document.getElementById('price-min');
        if (priceMinInput) priceMinInput.value = '';

        const priceMaxInput = document.getElementById('price-max');
        if (priceMaxInput) priceMaxInput.value = '';

        const businessTypeCheckboxes = document.querySelectorAll('input[name="business-type"]');
        businessTypeCheckboxes.forEach(cb => cb.checked = false);

        const locationSelect = document.getElementById('location-filter');
        if (locationSelect) locationSelect.value = 'all';

        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) sortSelect.value = 'newest';

        // Reset page and reload
        this.currentPage = 1;
        this.loadListings();

        this.showToast('Filters cleared', 'info');
    }

    /**
     * Update results count display
     */
    updateResultsCount() {
        const resultsCount = document.getElementById('results-count');
        if (resultsCount) {
            const total = this.totalCount;
            const start = (this.currentPage - 1) * this.itemsPerPage + 1;
            const end = Math.min(start + this.itemsPerPage - 1, total);

            if (total === 0) {
                resultsCount.textContent = 'No results found';
            } else {
                resultsCount.textContent = `Showing ${start}-${end} of ${total} listings`;
            }
        }
    }

    /**
     * Show loading state
     */
    showLoadingState() {
        const container = document.getElementById('listings-container');
        if (container) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p class="text-slate-600 dark:text-slate-300">Loading listings...</p>
                </div>
            `;
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white transform transition-all duration-300 translate-x-full`;

        switch (type) {
            case 'success':
                toast.classList.add('bg-emerald-500');
                break;
            case 'error':
                toast.classList.add('bg-red-500');
                break;
            case 'warning':
                toast.classList.add('bg-orange-500');
                break;
            default:
                toast.classList.add('bg-blue-500');
        }

        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.remove('translate-x-full'), 100);
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    /**
     * Show error message
     */
    showError(message) {
        this.showToast(message, 'error');
    }

    /**
     * Load sample data for development/fallback
     */
    loadSampleData() {
        console.log('📝 Loading sample data for development...');

        this.listings = [
            {
                id: 'sample-1',
                title: "Premier Auto Service Center",
                business_type: "Full Service Auto Repair",
                location: "Plano, TX",
                price: 850000,
                profit: 285000,
                revenue: 1200000,
                description: "Established full-service auto repair shop with loyal customer base and modern equipment. This business has been serving the Plano community for over 15 years.",
                images: ["https://images.unsplash.com/photo-1632823469850-1b7b1e8b7e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80"],
                express_seller: true,
                featured: false,
                established_year: 2008,
                employees: 12,
                square_footage: 8500,
                features: ["ASE Certified Technicians", "Modern Equipment", "Loyal Customer Base"],
                seller_id: 'sample-seller-1',
                profiles: {
                    first_name: "Michael",
                    last_name: "Johnson",
                    company: "Johnson Automotive Group"
                }
            },
            {
                id: 'sample-2',
                title: "Elite Transmission Specialists",
                business_type: "Transmission Repair",
                location: "Arlington, TX",
                price: 650000,
                profit: 195000,
                revenue: 850000,
                description: "Specialized transmission repair shop with 25+ years in business and excellent reputation in the DFW area.",
                images: ["https://images.unsplash.com/photo-1486754735734-325b5831c3ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80"],
                express_seller: false,
                featured: true,
                established_year: 1998,
                employees: 8,
                square_footage: 6000,
                features: ["Transmission Specialists", "25+ Years Experience", "Excellent Reputation"],
                seller_id: 'sample-seller-2',
                profiles: {
                    first_name: "Robert",
                    last_name: "Smith",
                    company: "Smith Transmission"
                }
            }
        ];

        this.filteredListings = [...this.listings];
        this.totalCount = this.listings.length;
        this.renderListings();
        this.updateResultsCount();
    }

    /**
     * Cleanup subscriptions and resources
     */
    cleanup() {
        // Unsubscribe from real-time channels
        this.subscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
        this.subscriptions = [];

        // Clear cache
        this.cache.clear();

        console.log('✅ CMS Marketplace cleanup complete');
    }
}

// Initialize CMS Marketplace when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing CMS Marketplace...');
    window.cmsMarketplace = new CMSMarketplace();
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (window.cmsMarketplace) {
        window.cmsMarketplace.cleanup();
    }
});

console.log('✅ CMS Marketplace Integration loaded successfully');