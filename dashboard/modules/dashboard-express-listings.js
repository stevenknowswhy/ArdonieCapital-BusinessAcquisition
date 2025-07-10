/**
 * Dashboard Express Listings Module
 * Express listings functionality for auto repair shops
 * @author Ardonie Capital Development Team
 */

console.log('🚖 Loading Dashboard Express Listings Module...');

/**
 * Express Listings management functions
 * Handles browsing and filtering of express program listings
 */
const DashboardExpressListings = {
    /**
     * Create Express Listings Section
     */
    createExpressListingsSection() {
        console.log('🔄 Creating express listings section...');
        const container = document.getElementById('dashboard-sections');
        if (!container) {
            console.error('❌ Dashboard sections container not found!');
            return;
        }

        const section = document.createElement('div');
        section.id = 'express-listings-section';
        section.className = 'dashboard-section';
        section.style.display = 'none';

        section.innerHTML = this.createExpressListingsHTML();
        container.appendChild(section);
        
        console.log('✅ Express listings section created');
    },

    /**
     * Create Express Listings HTML structure
     * @returns {string} HTML content for express listings section
     */
    createExpressListingsHTML() {
        return `
            <div class="mb-6">
                <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Express Listings</h2>
                        <p class="text-slate-600 dark:text-slate-400">Browse auto repair shops available for quick acquisition</p>
                    </div>
                    <div class="mt-4 lg:mt-0 flex items-center space-x-3">
                        <div class="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                            <span class="text-lg">🚖</span>
                            <span>Express Program Active</span>
                        </div>
                        <button type="button" class="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-dark transition-colors">
                            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                            </svg>
                            Filters
                        </button>
                    </div>
                </div>
            </div>

            <!-- Express Listings Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <!-- Listing 1 -->
                <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow">
                    <div class="p-6">
                        <div class="flex items-start justify-between mb-4">
                            <div>
                                <h3 class="font-semibold text-slate-900 dark:text-white mb-1">AutoCare Plus</h3>
                                <p class="text-sm text-slate-600 dark:text-slate-400">San Antonio, TX</p>
                            </div>
                            <span class="px-2 py-1 text-xs font-medium bg-accent/10 text-accent rounded-full">Express</span>
                        </div>
                        
                        <div class="space-y-2 mb-4">
                            <div class="flex justify-between text-sm">
                                <span class="text-slate-600 dark:text-slate-400">Asking Price</span>
                                <span class="font-semibold text-slate-900 dark:text-white">$425,000</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-slate-600 dark:text-slate-400">Annual Revenue</span>
                                <span class="font-semibold text-slate-900 dark:text-white">$650,000</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-slate-600 dark:text-slate-400">Match Score</span>
                                <span class="font-semibold text-accent">92%</span>
                            </div>
                        </div>

                        <div class="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                            <button type="button" class="text-primary hover:text-primary-dark font-medium text-sm">View Details</button>
                            <div class="flex items-center space-x-2">
                                <button type="button" class="p-1 text-slate-400 hover:text-red-500 transition-colors" title="Save">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                    </svg>
                                </button>
                                <button type="button" class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" title="Contact">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Listing 2 -->
                <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow">
                    <div class="p-6">
                        <div class="flex items-start justify-between mb-4">
                            <div>
                                <h3 class="font-semibold text-slate-900 dark:text-white mb-1">Precision Motors</h3>
                                <p class="text-sm text-slate-600 dark:text-slate-400">Fort Worth, TX</p>
                            </div>
                            <span class="px-2 py-1 text-xs font-medium bg-accent/10 text-accent rounded-full">Express</span>
                        </div>
                        
                        <div class="space-y-2 mb-4">
                            <div class="flex justify-between text-sm">
                                <span class="text-slate-600 dark:text-slate-400">Asking Price</span>
                                <span class="font-semibold text-slate-900 dark:text-white">$680,000</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-slate-600 dark:text-slate-400">Annual Revenue</span>
                                <span class="font-semibold text-slate-900 dark:text-white">$920,000</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-slate-600 dark:text-slate-400">Match Score</span>
                                <span class="font-semibold text-accent">88%</span>
                            </div>
                        </div>

                        <div class="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                            <button type="button" class="text-primary hover:text-primary-dark font-medium text-sm">View Details</button>
                            <div class="flex items-center space-x-2">
                                <button type="button" class="p-1 text-slate-400 hover:text-red-500 transition-colors" title="Save">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                    </svg>
                                </button>
                                <button type="button" class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" title="Contact">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Listing 3 -->
                <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow">
                    <div class="p-6">
                        <div class="flex items-start justify-between mb-4">
                            <div>
                                <h3 class="font-semibold text-slate-900 dark:text-white mb-1">Elite Auto Works</h3>
                                <p class="text-sm text-slate-600 dark:text-slate-400">Plano, TX</p>
                            </div>
                            <span class="px-2 py-1 text-xs font-medium bg-accent/10 text-accent rounded-full">Express</span>
                        </div>
                        
                        <div class="space-y-2 mb-4">
                            <div class="flex justify-between text-sm">
                                <span class="text-slate-600 dark:text-slate-400">Asking Price</span>
                                <span class="font-semibold text-slate-900 dark:text-white">$750,000</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-slate-600 dark:text-slate-400">Annual Revenue</span>
                                <span class="font-semibold text-slate-900 dark:text-white">$1,100,000</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-slate-600 dark:text-slate-400">Match Score</span>
                                <span class="font-semibold text-accent">95%</span>
                            </div>
                        </div>

                        <div class="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                            <button type="button" class="text-primary hover:text-primary-dark font-medium text-sm">View Details</button>
                            <div class="flex items-center space-x-2">
                                <button type="button" class="p-1 text-slate-400 hover:text-red-500 transition-colors" title="Save">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                    </svg>
                                </button>
                                <button type="button" class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" title="Contact">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Listing 4 -->
                <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow">
                    <div class="p-6">
                        <div class="flex items-start justify-between mb-4">
                            <div>
                                <h3 class="font-semibold text-slate-900 dark:text-white mb-1">Quick Fix Garage</h3>
                                <p class="text-sm text-slate-600 dark:text-slate-400">Arlington, TX</p>
                            </div>
                            <span class="px-2 py-1 text-xs font-medium bg-accent/10 text-accent rounded-full">Express</span>
                        </div>
                        
                        <div class="space-y-2 mb-4">
                            <div class="flex justify-between text-sm">
                                <span class="text-slate-600 dark:text-slate-400">Asking Price</span>
                                <span class="font-semibold text-slate-900 dark:text-white">$320,000</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-slate-600 dark:text-slate-400">Annual Revenue</span>
                                <span class="font-semibold text-slate-900 dark:text-white">$485,000</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-slate-600 dark:text-slate-400">Match Score</span>
                                <span class="font-semibold text-accent">85%</span>
                            </div>
                        </div>

                        <div class="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                            <button type="button" class="text-primary hover:text-primary-dark font-medium text-sm">View Details</button>
                            <div class="flex items-center space-x-2">
                                <button type="button" class="p-1 text-slate-400 hover:text-red-500 transition-colors" title="Save">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                    </svg>
                                </button>
                                <button type="button" class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" title="Contact">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Listing 5 -->
                <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow">
                    <div class="p-6">
                        <div class="flex items-start justify-between mb-4">
                            <div>
                                <h3 class="font-semibold text-slate-900 dark:text-white mb-1">Metro Auto Center</h3>
                                <p class="text-sm text-slate-600 dark:text-slate-400">Irving, TX</p>
                            </div>
                            <span class="px-2 py-1 text-xs font-medium bg-accent/10 text-accent rounded-full">Express</span>
                        </div>
                        
                        <div class="space-y-2 mb-4">
                            <div class="flex justify-between text-sm">
                                <span class="text-slate-600 dark:text-slate-400">Asking Price</span>
                                <span class="font-semibold text-slate-900 dark:text-white">$550,000</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-slate-600 dark:text-slate-400">Annual Revenue</span>
                                <span class="font-semibold text-slate-900 dark:text-white">$780,000</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-slate-600 dark:text-slate-400">Match Score</span>
                                <span class="font-semibold text-accent">90%</span>
                            </div>
                        </div>

                        <div class="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                            <button type="button" class="text-primary hover:text-primary-dark font-medium text-sm">View Details</button>
                            <div class="flex items-center space-x-2">
                                <button type="button" class="p-1 text-slate-400 hover:text-red-500 transition-colors" title="Save">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                    </svg>
                                </button>
                                <button type="button" class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" title="Contact">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Listing 6 -->
                <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow">
                    <div class="p-6">
                        <div class="flex items-start justify-between mb-4">
                            <div>
                                <h3 class="font-semibold text-slate-900 dark:text-white mb-1">Speedy Service Shop</h3>
                                <p class="text-sm text-slate-600 dark:text-slate-400">Garland, TX</p>
                            </div>
                            <span class="px-2 py-1 text-xs font-medium bg-accent/10 text-accent rounded-full">Express</span>
                        </div>
                        
                        <div class="space-y-2 mb-4">
                            <div class="flex justify-between text-sm">
                                <span class="text-slate-600 dark:text-slate-400">Asking Price</span>
                                <span class="font-semibold text-slate-900 dark:text-white">$395,000</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-slate-600 dark:text-slate-400">Annual Revenue</span>
                                <span class="font-semibold text-slate-900 dark:text-white">$590,000</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-slate-600 dark:text-slate-400">Match Score</span>
                                <span class="font-semibold text-accent">87%</span>
                            </div>
                        </div>

                        <div class="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                            <button type="button" class="text-primary hover:text-primary-dark font-medium text-sm">View Details</button>
                            <div class="flex items-center space-x-2">
                                <button type="button" class="p-1 text-slate-400 hover:text-red-500 transition-colors" title="Save">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                    </svg>
                                </button>
                                <button type="button" class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" title="Contact">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Load More Button -->
            <div class="mt-8 text-center">
                <button type="button" class="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    Load More Listings
                </button>
            </div>
        `;
    }
};

// Extend BuyerDashboard prototype with express listings methods
if (typeof window !== 'undefined' && window.BuyerDashboard) {
    Object.assign(window.BuyerDashboard.prototype, DashboardExpressListings);
    console.log('✅ Dashboard Express Listings methods added to BuyerDashboard prototype');
} else {
    console.warn('⚠️ BuyerDashboard not available, express listings methods not added');
}

// Update loading status
if (window.dashboardLoadingStatus) {
    window.dashboardLoadingStatus.modulesLoaded.expressListings = true;
}

console.log('✅ Dashboard Express Listings Module loaded');

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DashboardExpressListings };
}
