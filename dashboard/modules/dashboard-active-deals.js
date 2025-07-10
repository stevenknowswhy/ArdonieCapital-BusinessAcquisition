/**
 * Dashboard Active Deals Module
 * Active deals management functionality
 * @author Ardonie Capital Development Team
 */

console.log('💼 Loading Dashboard Active Deals Module...');

/**
 * Active Deals management functions
 * Handles deal tracking, filtering, and detail views
 */
const DashboardActiveDeals = {
    /**
     * Create Active Deals Section
     */
    createActiveDealsSection() {
        console.log('🔄 Creating active deals section...');
        const container = document.getElementById('dashboard-sections');
        if (!container) {
            console.error('❌ Dashboard sections container not found!');
            return;
        }

        const section = document.createElement('div');
        section.id = 'active-deals-section';
        section.className = 'dashboard-section';
        section.style.display = 'none';

        section.innerHTML = this.createActiveDealsHTML();
        container.appendChild(section);

        // Load deals data
        this.loadActiveDealsData();
        
        console.log('✅ Active deals section created');
    },

    /**
     * Create Active Deals HTML structure
     * @returns {string} HTML content for active deals section
     */
    createActiveDealsHTML() {
        return `
            <!-- Active Deals List View -->
            <div id="active-deals-list">
                <!-- Header -->
                <div class="mb-6">
                    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Active Deals</h2>
                            <p class="text-slate-600 dark:text-slate-400">Track and manage your ongoing business acquisitions</p>
                        </div>
                        <div class="mt-4 lg:mt-0">
                            <button type="button" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                </svg>
                                New Deal
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Filters and Search -->
                <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-6">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <!-- Search -->
                        <div class="relative">
                            <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                            <input type="text" 
                                   id="deals-search" 
                                   placeholder="Search deals..." 
                                   class="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                        </div>

                        <!-- Status Filter -->
                        <select id="status-filter" class="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20">
                            <option value="">All Statuses</option>
                            <option value="initial_interest">Initial Interest</option>
                            <option value="due_diligence">Due Diligence</option>
                            <option value="negotiation">Negotiation</option>
                            <option value="financing">Financing</option>
                            <option value="legal_review">Legal Review</option>
                            <option value="closing">Closing</option>
                        </select>

                        <!-- Value Filter -->
                        <select id="value-filter" class="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20">
                            <option value="">All Values</option>
                            <option value="0-250000">Under $250K</option>
                            <option value="250000-500000">$250K - $500K</option>
                            <option value="500000-1000000">$500K - $1M</option>
                            <option value="1000000+">$1M+</option>
                        </select>

                        <!-- Clear Filters -->
                        <button type="button" id="clear-filters" class="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            Clear Filters
                        </button>
                    </div>
                </div>

                <!-- Deals Grid -->
                <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" id="deals-grid">
                    <!-- Deal cards will be populated by JavaScript -->
                </div>
            </div>

            <!-- Deal Detail View (Hidden by default) -->
            <div id="deal-detail-view" style="display: none;">
                <!-- Deal detail content will be populated by JavaScript -->
            </div>
        `;
    },

    /**
     * Load active deals data
     */
    loadActiveDealsData() {
        const deals = this.getMockDealsData();
        this.renderDealsGrid(deals);
        console.log('✅ Active deals data loaded');
    },

    /**
     * Render deals grid
     * @param {Array} deals - Array of deal objects
     */
    renderDealsGrid(deals) {
        const container = document.getElementById('deals-grid');
        if (!container) return;

        if (deals.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                    </div>
                    <h3 class="text-lg font-medium text-slate-900 dark:text-white mb-2">No active deals</h3>
                    <p class="text-slate-600 dark:text-slate-400 mb-4">Start exploring listings to begin your first deal</p>
                    <button type="button" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors" onclick="window.buyerDashboard?.showSection('express-listings')">
                        Browse Listings
                    </button>
                </div>
            `;
        } else {
            container.innerHTML = deals.map(deal => this.createDealCardHTML(deal)).join('');
        }
    },

    /**
     * Create deal card HTML
     * @param {Object} deal - Deal object
     * @returns {string} HTML for deal card
     */
    createDealCardHTML(deal) {
        const progressPercentage = this.calculateDealProgress(deal.status);
        const statusColors = {
            'initial_interest': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            'due_diligence': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            'negotiation': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
            'financing': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            'legal_review': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
            'closing': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        };

        return `
            <div class="deal-card bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow cursor-pointer" data-deal-id="${deal.id}">
                <div class="p-6">
                    <!-- Header -->
                    <div class="flex items-start justify-between mb-4">
                        <div>
                            <h3 class="font-semibold text-slate-900 dark:text-white mb-1">${deal.businessName}</h3>
                            <p class="text-sm text-slate-600 dark:text-slate-400">${deal.location} • ${deal.industry}</p>
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
                            <span class="text-slate-600 dark:text-slate-400">Deal Value</span>
                            <span class="font-semibold text-slate-900 dark:text-white">${this.formatCurrency(deal.dealValue)}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-slate-600 dark:text-slate-400">Annual Revenue</span>
                            <span class="font-semibold text-slate-900 dark:text-white">${this.formatCurrency(deal.revenue)}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-slate-600 dark:text-slate-400">EBITDA</span>
                            <span class="font-semibold text-slate-900 dark:text-white">${this.formatCurrency(deal.ebitda)}</span>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                        <p class="text-xs text-slate-500">Last activity: ${deal.lastActivity}</p>
                        <div class="flex items-center space-x-2">
                            <button type="button" class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" title="Add Note">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                            </button>
                            <button type="button" class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" title="Contact Team">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Filter deals based on search and filter criteria
     */
    filterDeals() {
        const searchTerm = document.getElementById('deals-search')?.value.toLowerCase() || '';
        const statusFilter = document.getElementById('status-filter')?.value || '';
        const valueFilter = document.getElementById('value-filter')?.value || '';

        const deals = this.getMockDealsData();
        const filteredDeals = deals.filter(deal => {
            // Search filter
            const matchesSearch = !searchTerm || 
                deal.businessName.toLowerCase().includes(searchTerm) ||
                deal.location.toLowerCase().includes(searchTerm) ||
                deal.industry.toLowerCase().includes(searchTerm);

            // Status filter
            const matchesStatus = !statusFilter || deal.status === statusFilter;

            // Value filter
            let matchesValue = true;
            if (valueFilter) {
                const value = deal.dealValue;
                switch (valueFilter) {
                    case '0-250000':
                        matchesValue = value < 250000;
                        break;
                    case '250000-500000':
                        matchesValue = value >= 250000 && value < 500000;
                        break;
                    case '500000-1000000':
                        matchesValue = value >= 500000 && value < 1000000;
                        break;
                    case '1000000+':
                        matchesValue = value >= 1000000;
                        break;
                }
            }

            return matchesSearch && matchesStatus && matchesValue;
        });

        this.renderDealsGrid(filteredDeals);
        console.log(`🔍 Filtered deals: ${filteredDeals.length} of ${deals.length} deals shown`);
    },

    /**
     * Show deal detail view
     * @param {string} dealId - ID of the deal to show
     */
    showDealDetail(dealId) {
        const deals = this.getMockDealsData();
        const deal = deals.find(d => d.id === dealId);
        
        if (!deal) {
            console.error('Deal not found:', dealId);
            return;
        }

        const listView = document.getElementById('active-deals-list');
        const detailView = document.getElementById('deal-detail-view');

        if (listView && detailView) {
            listView.style.display = 'none';
            detailView.style.display = 'block';
            detailView.innerHTML = this.createDealDetailHTML(deal);
            
            // Setup detail view event listeners
            this.setupDealDetailEventListeners();
        }

        console.log('📋 Showing deal detail for:', deal.businessName);
    },

    /**
     * Create deal detail HTML
     * @param {Object} deal - Deal object
     * @returns {string} HTML for deal detail view
     */
    createDealDetailHTML(deal) {
        const progressPercentage = this.calculateDealProgress(deal.status);
        
        return `
            <!-- Breadcrumb Navigation -->
            <div class="mb-6">
                <nav class="flex" aria-label="Breadcrumb">
                    <ol class="flex items-center space-x-2">
                        <li>
                            <button type="button" id="back-to-dashboard" class="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                                Dashboard
                            </button>
                        </li>
                        <li>
                            <svg class="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                            </svg>
                        </li>
                        <li>
                            <button type="button" id="back-to-deals" class="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                                Active Deals
                            </button>
                        </li>
                        <li>
                            <svg class="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                            </svg>
                        </li>
                        <li>
                            <span class="text-slate-900 dark:text-white font-medium">${deal.businessName}</span>
                        </li>
                    </ol>
                </nav>
            </div>

            <!-- Deal Header -->
            <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
                <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">${deal.businessName}</h1>
                        <p class="text-slate-600 dark:text-slate-400 mb-4">${deal.location} • ${deal.industry}</p>
                        <div class="flex items-center space-x-4">
                            <div class="text-sm">
                                <span class="text-slate-600 dark:text-slate-400">Deal Value:</span>
                                <span class="font-semibold text-slate-900 dark:text-white ml-1">${this.formatCurrency(deal.dealValue)}</span>
                            </div>
                            <div class="text-sm">
                                <span class="text-slate-600 dark:text-slate-400">Progress:</span>
                                <span class="font-semibold text-slate-900 dark:text-white ml-1">${progressPercentage}%</span>
                            </div>
                        </div>
                    </div>
                    <div class="mt-4 lg:mt-0 flex space-x-3">
                        <button type="button" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                            Update Status
                        </button>
                        <button type="button" class="border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            Add Note
                        </button>
                    </div>
                </div>
            </div>

            <!-- Deal Progress and Information -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Business Information -->
                <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Business Information</h3>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-slate-600 dark:text-slate-400">Business Name</span>
                            <span class="font-medium text-slate-900 dark:text-white">${deal.businessName}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-600 dark:text-slate-400">Location</span>
                            <span class="font-medium text-slate-900 dark:text-white">${deal.location}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-600 dark:text-slate-400">Industry</span>
                            <span class="font-medium text-slate-900 dark:text-white">${deal.industry}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-600 dark:text-slate-400">Annual Revenue</span>
                            <span class="font-medium text-slate-900 dark:text-white">${this.formatCurrency(deal.revenue)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-600 dark:text-slate-400">EBITDA</span>
                            <span class="font-medium text-slate-900 dark:text-white">${this.formatCurrency(deal.ebitda)}</span>
                        </div>
                    </div>
                </div>

                <!-- Deal Timeline -->
                <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Deal Timeline</h3>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-slate-600 dark:text-slate-400">Start Date</span>
                            <span class="font-medium text-slate-900 dark:text-white">${new Date(deal.startDate).toLocaleDateString()}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-600 dark:text-slate-400">Expected Closing</span>
                            <span class="font-medium text-slate-900 dark:text-white">${new Date(deal.expectedClosing).toLocaleDateString()}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-600 dark:text-slate-400">Asking Price</span>
                            <span class="font-medium text-slate-900 dark:text-white">${this.formatCurrency(deal.askingPrice)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-600 dark:text-slate-400">Negotiated Price</span>
                            <span class="font-medium text-slate-900 dark:text-white">${this.formatCurrency(deal.negotiatedPrice)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-600 dark:text-slate-400">Last Activity</span>
                            <span class="font-medium text-slate-900 dark:text-white">${deal.lastActivity}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Setup deal detail event listeners
     */
    setupDealDetailEventListeners() {
        // Back to dashboard
        const backToDashboard = document.getElementById('back-to-dashboard');
        if (backToDashboard) {
            backToDashboard.addEventListener('click', () => {
                this.showSection('overview');
            });
        }

        // Back to deals list
        const backToDeals = document.getElementById('back-to-deals');
        if (backToDeals) {
            backToDeals.addEventListener('click', () => {
                const listView = document.getElementById('active-deals-list');
                const detailView = document.getElementById('deal-detail-view');
                
                if (listView && detailView) {
                    detailView.style.display = 'none';
                    listView.style.display = 'block';
                }
            });
        }

        console.log('✅ Deal detail event listeners setup complete');
    }
};

// Extend BuyerDashboard prototype with active deals methods
if (typeof window !== 'undefined' && window.BuyerDashboard) {
    Object.assign(window.BuyerDashboard.prototype, DashboardActiveDeals);
    console.log('✅ Dashboard Active Deals methods added to BuyerDashboard prototype');
} else {
    console.warn('⚠️ BuyerDashboard not available, active deals methods not added');
}

// Update loading status
if (window.dashboardLoadingStatus) {
    window.dashboardLoadingStatus.modulesLoaded.activeDeals = true;
}

console.log('✅ Dashboard Active Deals Module loaded');

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DashboardActiveDeals };
}
