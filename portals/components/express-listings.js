/**
 * Express Listings Component with Supabase Integration
 * Handles Express Deal Program listings for buyers
 */

class ExpressListings {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.listings = [];
        this.filters = {
            priceRange: 'all',
            location: 'all',
            businessType: 'all'
        };
        this.init();
    }

    async init() {
        console.log('⚡ Initializing Express Listings...');
        
        // Wait for Supabase to be available
        await this.waitForSupabase();
        
        // Initialize Supabase client
        this.initializeSupabase();
        
        // Get current user
        await this.getCurrentUser();
        
        // Load express listings
        await this.loadExpressListings();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('✅ Express Listings initialized successfully');
    }

    async waitForSupabase(maxWait = 10000) {
        const startTime = Date.now();
        while (!window.supabase && (Date.now() - startTime) < maxWait) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        if (!window.supabase) {
            throw new Error('Supabase not available');
        }
    }

    initializeSupabase() {
        const SUPABASE_URL = 'https://pbydepsqcypwqbicnsco.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieWRlcHNxY3lwd3FiaWNuc2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjAxOTQsImV4cCI6MjA2NzQ5NjE5NH0.5aF46QcNOFN_vwXcHxCsVx_8a4EsqE1bL4fy4K7UXI0';
        
        this.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase client initialized for express listings');
    }

    async getCurrentUser() {
        try {
            const { data: { session }, error } = await this.supabase.auth.getSession();
            
            if (error) {
                console.error('❌ Auth check error:', error);
                return;
            }

            if (session) {
                this.currentUser = session.user;
                console.log('✅ Current user:', this.currentUser.email);
            }

        } catch (error) {
            console.error('❌ Failed to get current user:', error);
        }
    }

    async loadExpressListings() {
        try {
            const { data: listings, error } = await this.supabase
                .from('listings')
                .select(`
                    *,
                    profiles (
                        first_name,
                        last_name,
                        business_type
                    )
                `)
                .eq('status', 'active')
                .eq('is_express_deal', true)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ Failed to load express listings:', error);
                this.showError('Failed to load express listings');
                return;
            }

            this.listings = listings || [];
            console.log(`✅ Loaded ${this.listings.length} express listings`);
            
            this.renderListings();

        } catch (error) {
            console.error('❌ Error loading express listings:', error);
            this.showError('Error loading express listings');
        }
    }

    renderListings() {
        const container = document.getElementById('express-listings-container');
        if (!container) {
            console.warn('Express listings container not found');
            return;
        }

        if (this.listings.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-gray-400 mb-4">
                        <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">No Express Listings Available</h3>
                    <p class="text-gray-600 mb-4">Check back soon for new Express Deal opportunities!</p>
                    <a href="../marketplace/listings.html" class="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                        Browse All Listings
                    </a>
                </div>
            `;
            return;
        }

        const filteredListings = this.applyFilters(this.listings);

        container.innerHTML = filteredListings.map(listing => this.renderListingCard(listing)).join('');
    }

    renderListingCard(listing) {
        const daysRemaining = this.calculateDaysRemaining(listing.express_deadline);
        const urgencyClass = daysRemaining <= 7 ? 'bg-red-100 text-red-800' : 
                           daysRemaining <= 14 ? 'bg-yellow-100 text-yellow-800' : 
                           'bg-green-100 text-green-800';

        return `
            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-primary-300 hover:shadow-lg transition-all duration-200">
                <!-- Express Badge -->
                <div class="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2">
                    <div class="flex items-center justify-between">
                        <span class="font-semibold text-sm">⚡ EXPRESS DEAL</span>
                        <span class="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">34-Day Close</span>
                    </div>
                </div>

                <!-- Listing Image -->
                <div class="relative h-48 bg-gray-200">
                    ${listing.image_url ? 
                        `<img src="${listing.image_url}" alt="${listing.title}" class="w-full h-full object-cover">` :
                        `<div class="w-full h-full flex items-center justify-center text-gray-400">
                            <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                            </svg>
                        </div>`
                    }
                    
                    <!-- Urgency Badge -->
                    <div class="absolute top-3 right-3">
                        <span class="px-2 py-1 rounded-full text-xs font-medium ${urgencyClass}">
                            ${daysRemaining} days left
                        </span>
                    </div>
                </div>

                <!-- Listing Content -->
                <div class="p-6">
                    <div class="flex items-start justify-between mb-3">
                        <h3 class="text-lg font-semibold text-gray-900 line-clamp-2">${listing.title}</h3>
                        <div class="text-right ml-4">
                            <div class="text-2xl font-bold text-primary-600">$${this.formatPrice(listing.price)}</div>
                            ${listing.revenue ? `<div class="text-sm text-gray-600">Revenue: $${this.formatPrice(listing.revenue)}</div>` : ''}
                        </div>
                    </div>

                    <div class="space-y-2 mb-4">
                        <div class="flex items-center text-sm text-gray-600">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            ${listing.location || 'Location not specified'}
                        </div>
                        
                        <div class="flex items-center text-sm text-gray-600">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                            </svg>
                            ${listing.profiles?.business_type || 'Business type not specified'}
                        </div>
                    </div>

                    <p class="text-gray-600 text-sm mb-4 line-clamp-3">
                        ${listing.description || 'No description available'}
                    </p>

                    <!-- Express Features -->
                    <div class="bg-gray-50 rounded-lg p-3 mb-4">
                        <h4 class="text-sm font-medium text-gray-900 mb-2">Express Deal Includes:</h4>
                        <div class="grid grid-cols-2 gap-2 text-xs text-gray-600">
                            <div class="flex items-center">
                                <svg class="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                </svg>
                                34-Day Close
                            </div>
                            <div class="flex items-center">
                                <svg class="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                </svg>
                                Due Diligence
                            </div>
                            <div class="flex items-center">
                                <svg class="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                </svg>
                                Legal Support
                            </div>
                            <div class="flex items-center">
                                <svg class="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                </svg>
                                Financing Help
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex space-x-3">
                        <button onclick="expressListings.viewListing('${listing.id}')" 
                                class="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
                            View Details
                        </button>
                        <button onclick="expressListings.saveListing('${listing.id}')" 
                                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    applyFilters(listings) {
        return listings.filter(listing => {
            // Price range filter
            if (this.filters.priceRange !== 'all') {
                const price = listing.price || 0;
                const ranges = {
                    'under-100k': price < 100000,
                    '100k-500k': price >= 100000 && price < 500000,
                    '500k-1m': price >= 500000 && price < 1000000,
                    'over-1m': price >= 1000000
                };
                if (!ranges[this.filters.priceRange]) return false;
            }

            // Location filter
            if (this.filters.location !== 'all') {
                if (!listing.location || !listing.location.toLowerCase().includes(this.filters.location.toLowerCase())) {
                    return false;
                }
            }

            // Business type filter
            if (this.filters.businessType !== 'all') {
                if (!listing.profiles?.business_type || 
                    !listing.profiles.business_type.toLowerCase().includes(this.filters.businessType.toLowerCase())) {
                    return false;
                }
            }

            return true;
        });
    }

    calculateDaysRemaining(deadline) {
        if (!deadline) return 34; // Default Express Deal timeline
        
        const deadlineDate = new Date(deadline);
        const today = new Date();
        const diffTime = deadlineDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return Math.max(0, diffDays);
    }

    formatPrice(price) {
        if (!price) return '0';
        return price.toLocaleString();
    }

    setupEventListeners() {
        // Filter controls
        const filterControls = document.querySelectorAll('[data-filter]');
        filterControls.forEach(control => {
            control.addEventListener('change', (e) => {
                const filterType = e.target.dataset.filter;
                this.filters[filterType] = e.target.value;
                this.renderListings();
            });
        });

        // Refresh button
        const refreshButton = document.getElementById('refresh-express-listings');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.loadExpressListings();
            });
        }
    }

    async viewListing(listingId) {
        window.location.href = `../marketplace/listing.html?id=${listingId}`;
    }

    async saveListing(listingId) {
        if (!this.currentUser) {
            alert('Please log in to save listings');
            return;
        }

        try {
            const { error } = await this.supabase
                .from('saved_listings')
                .insert({
                    user_id: this.currentUser.id,
                    listing_id: listingId
                });

            if (error) {
                console.error('❌ Failed to save listing:', error);
                alert('Failed to save listing');
                return;
            }

            alert('Listing saved successfully!');

        } catch (error) {
            console.error('❌ Error saving listing:', error);
            alert('Error saving listing');
        }
    }

    showError(message) {
        const container = document.getElementById('express-listings-container');
        if (container) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-red-400 mb-4">
                        <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Error Loading Listings</h3>
                    <p class="text-gray-600 mb-4">${message}</p>
                    <button onclick="expressListings.loadExpressListings()" class="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                        Try Again
                    </button>
                </div>
            `;
        }
    }
}

// Initialize express listings when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.expressListings = new ExpressListings();
});
