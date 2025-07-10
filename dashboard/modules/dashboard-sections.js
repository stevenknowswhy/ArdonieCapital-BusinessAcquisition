/**
 * Dashboard Sections Module
 * Section creation and management methods
 * @author Ardonie Capital Development Team
 */

console.log('📋 Loading Dashboard Sections Module...');

/**
 * Dashboard sections management functions
 * Handles creation and management of all dashboard sections
 */
const DashboardSections = {
    /**
     * Initialize all dashboard sections
     * Creates and sets up all dashboard content sections
     */
    initializeSections() {
        console.log('🔄 Initializing dashboard sections...');
        
        try {
            this.createOverviewSection();
            console.log('✅ Overview section created');
        } catch (error) {
            console.error('❌ Error creating overview section:', error);
        }

        try {
            this.createActiveDealsSection();
            console.log('✅ Active deals section created');
        } catch (error) {
            console.error('❌ Error creating active deals section:', error);
        }

        try {
            this.createExpressListingsSection();
            console.log('✅ Express listings section created');
        } catch (error) {
            console.error('❌ Error creating express listings section:', error);
        }

        try {
            this.createSavedListingsSection();
            console.log('✅ Saved listings section created');
        } catch (error) {
            console.error('❌ Error creating saved listings section:', error);
        }

        try {
            this.createMessagesSection();
            console.log('✅ Messages section created');
        } catch (error) {
            console.error('❌ Error creating messages section:', error);
        }

        try {
            this.createProfileSection();
            console.log('✅ Profile section created');
        } catch (error) {
            console.error('❌ Error creating profile section:', error);
        }

        try {
            this.createSettingsSection();
            console.log('✅ Settings section created');
        } catch (error) {
            console.error('❌ Error creating settings section:', error);
        }

        console.log('✅ Dashboard sections initialization completed');
    },

    /**
     * Create Overview Section
     * Main dashboard overview with KPIs and recent activity
     */
    createOverviewSection() {
        console.log('🔄 Creating overview section...');
        const container = document.getElementById('dashboard-sections');
        if (!container) {
            console.error('❌ Dashboard sections container not found!');
            return;
        }

        const section = document.createElement('div');
        section.id = 'overview-section';
        section.className = 'dashboard-section';
        section.style.display = 'block'; // Show by default

        section.innerHTML = this.createOverviewHTML();
        container.appendChild(section);
        
        // Load overview data
        this.loadOverviewData();
        
        console.log('✅ Overview section created');
    },

    /**
     * Create Overview HTML structure
     * @returns {string} HTML content for overview section
     */
    createOverviewHTML() {
        return `
            <!-- Welcome Header -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Welcome back${this.currentUser ? ', ' + (this.currentUser.firstName || 'User') : ''}!
                </h1>
                <p class="text-slate-600 dark:text-slate-400">Here's what's happening with your business acquisitions</p>
            </div>

            <!-- KPI Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <!-- Total Active Deals -->
                <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Active Deals</p>
                            <p id="total-deals-value" class="text-2xl font-bold text-slate-900 dark:text-white">-</p>
                        </div>
                        <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                        </div>
                    </div>
                    <div class="mt-4 flex items-center">
                        <span id="total-deals-change" class="text-sm font-medium text-green-600">-</span>
                        <span class="text-sm text-slate-600 dark:text-slate-400 ml-2">from last month</span>
                    </div>
                </div>

                <!-- Active Listings -->
                <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Active Listings</p>
                            <p id="active-listings-value" class="text-2xl font-bold text-slate-900 dark:text-white">-</p>
                        </div>
                        <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                            </svg>
                        </div>
                    </div>
                    <div class="mt-4 flex items-center">
                        <span id="active-listings-change" class="text-sm font-medium text-green-600">-</span>
                        <span class="text-sm text-slate-600 dark:text-slate-400 ml-2">new this week</span>
                    </div>
                </div>

                <!-- Average Deal Value -->
                <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Deal Value</p>
                            <p id="avg-deal-value" class="text-2xl font-bold text-slate-900 dark:text-white">-</p>
                        </div>
                        <div class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                            </svg>
                        </div>
                    </div>
                    <div class="mt-4 flex items-center">
                        <span id="avg-deal-change" class="text-sm font-medium text-green-600">-</span>
                        <span class="text-sm text-slate-600 dark:text-slate-400 ml-2">vs last quarter</span>
                    </div>
                </div>

                <!-- Completion Rate -->
                <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Completion Rate</p>
                            <p id="completion-rate-value" class="text-2xl font-bold text-slate-900 dark:text-white">-</p>
                        </div>
                        <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                    </div>
                    <div class="mt-4 flex items-center">
                        <span id="completion-rate-change" class="text-sm font-medium text-green-600">-</span>
                        <span class="text-sm text-slate-600 dark:text-slate-400 ml-2">success rate</span>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <!-- Quick Actions Card -->
                <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
                    <div class="space-y-3">
                        <button type="button" class="w-full flex items-center justify-between p-3 text-left bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors" onclick="window.buyerDashboard?.showSection('express-listings')">
                            <div class="flex items-center">
                                <div class="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                                    <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                    </svg>
                                </div>
                                <div>
                                    <p class="font-medium text-slate-900 dark:text-white">Browse Express Listings</p>
                                    <p class="text-sm text-slate-600 dark:text-slate-400">Find auto repair shops ready for quick acquisition</p>
                                </div>
                            </div>
                            <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </button>

                        <button type="button" class="w-full flex items-center justify-between p-3 text-left bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors" onclick="window.buyerDashboard?.showSection('active-deals')">
                            <div class="flex items-center">
                                <div class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3">
                                    <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                    </svg>
                                </div>
                                <div>
                                    <p class="font-medium text-slate-900 dark:text-white">Manage Active Deals</p>
                                    <p class="text-sm text-slate-600 dark:text-slate-400">Track progress and update deal status</p>
                                </div>
                            </div>
                            <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </button>

                        <button type="button" class="w-full flex items-center justify-between p-3 text-left bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors" onclick="window.buyerDashboard?.showSection('messages')">
                            <div class="flex items-center">
                                <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                                    <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                                    </svg>
                                </div>
                                <div>
                                    <p class="font-medium text-slate-900 dark:text-white">Check Messages</p>
                                    <p class="text-sm text-slate-600 dark:text-slate-400">Communicate with sellers and brokers</p>
                                </div>
                            </div>
                            <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
                    <div id="recent-activity-list" class="space-y-4">
                        <!-- Activity items will be populated by JavaScript -->
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Load overview data
     * Populates the overview section with real data
     */
    loadOverviewData() {
        try {
            const data = this.getMockOverviewData();
            
            // Update KPI values
            this.updateElement('total-deals-value', data.totalDeals.value);
            this.updateElement('total-deals-change', data.totalDeals.change);
            
            this.updateElement('active-listings-value', data.activeListings.value);
            this.updateElement('active-listings-change', data.activeListings.change);
            
            this.updateElement('avg-deal-value', this.formatCurrency(data.avgDealValue.value));
            this.updateElement('avg-deal-change', data.avgDealValue.change);
            
            this.updateElement('completion-rate-value', data.completionRate.value + '%');
            this.updateElement('completion-rate-change', data.completionRate.change);
            
            // Load recent activity
            this.loadRecentActivity();
            
            console.log('✅ Overview data loaded');
        } catch (error) {
            console.error('❌ Failed to load overview data:', error);
        }
    },

    /**
     * Load recent activity
     * Populates the recent activity section
     */
    loadRecentActivity() {
        const container = document.getElementById('recent-activity-list');
        if (!container) return;
        
        const activities = this.getMockRecentActivity();
        container.innerHTML = activities.map(activity => this.createActivityItemHTML(activity)).join('');
    },

    /**
     * Create activity item HTML
     * @param {Object} activity - Activity object
     * @returns {string} HTML for activity item
     */
    createActivityItemHTML(activity) {
        const iconMap = {
            deal: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
            message: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
            listing: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
            document: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
        };
        
        return `
            <div class="flex items-start space-x-3">
                <div class="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${iconMap[activity.icon] || iconMap.document}"></path>
                    </svg>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-slate-900 dark:text-white">${activity.title}</p>
                    <p class="text-sm text-slate-600 dark:text-slate-400">${activity.description}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-500 mt-1">${this.formatTimeAgo(activity.timestamp)}</p>
                </div>
            </div>
        `;
    },

    /**
     * Update element content safely
     * @param {string} id - Element ID
     * @param {string} content - Content to set
     */
    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    },

    /**
     * Create placeholder section for simple sections
     * @param {string} id - Section ID
     * @param {string} title - Section title
     * @param {string} description - Section description
     */
    createPlaceholderSection(id, title, description) {
        const container = document.getElementById('dashboard-sections');
        if (!container) return;

        const section = document.createElement('div');
        section.id = `${id}-section`;
        section.className = 'dashboard-section';
        section.style.display = 'none';

        section.innerHTML = `
            <div class="text-center py-12">
                <div class="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">${title}</h3>
                <p class="text-slate-600 dark:text-slate-400 mb-6">${description}</p>
                <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md mx-auto">
                    <p class="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Coming Soon:</strong> This section is under development and will be available in a future update.
                    </p>
                </div>
            </div>
        `;

        container.appendChild(section);
    },

    /**
     * Create Profile Section
     */
    createProfileSection() {
        this.createPlaceholderSection('profile', 'Profile', 'Manage your account information and preferences');
    },

    /**
     * Create Settings Section
     */
    createSettingsSection() {
        this.createPlaceholderSection('settings', 'Settings', 'Configure your dashboard and notification preferences');
    },

    /**
     * Create Saved Listings Section
     */
    createSavedListingsSection() {
        this.createPlaceholderSection('saved-listings', 'Saved Listings', 'Your bookmarked business opportunities');
    },

    /**
     * Create placeholder section for simple sections
     * @param {string} id - Section ID
     * @param {string} title - Section title
     * @param {string} description - Section description
     */
    createPlaceholderSection(id, title, description) {
        const container = document.getElementById('dashboard-sections');
        if (!container) return;

        const section = document.createElement('div');
        section.id = `${id}-section`;
        section.className = 'dashboard-section';
        section.style.display = 'none';

        section.innerHTML = `
            <div class="text-center py-12">
                <div class="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">${title}</h3>
                <p class="text-slate-600 dark:text-slate-400 mb-6">${description}</p>
                <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md mx-auto">
                    <p class="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Coming Soon:</strong> This section is under development and will be available in a future update.
                    </p>
                </div>
            </div>
        `;

        container.appendChild(section);
    },

    /**
     * Create Profile Section
     */
    createProfileSection() {
        this.createPlaceholderSection('profile', 'Profile', 'Manage your account information and preferences');
    },

    /**
     * Create Settings Section
     */
    createSettingsSection() {
        this.createPlaceholderSection('settings', 'Settings', 'Configure your dashboard and notification preferences');
    },

    /**
     * Create Saved Listings Section
     */
    createSavedListingsSection() {
        console.log('🔄 Creating saved listings section...');
        const container = document.getElementById('dashboard-sections');
        if (!container) {
            console.error('❌ Dashboard sections container not found!');
            return;
        }

        const section = document.createElement('div');
        section.id = 'saved-listings-section';
        section.className = 'dashboard-section';
        section.style.display = 'none';

        section.innerHTML = `
            <div class="mb-6">
                <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Saved Listings</h2>
                        <p class="text-slate-600 dark:text-slate-400">Your bookmarked business opportunities</p>
                    </div>
                    <div class="mt-4 lg:mt-0">
                        <button type="button" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                            Browse More Listings
                        </button>
                    </div>
                </div>
            </div>

            <!-- Saved Listings Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" id="saved-listings-grid">
                <!-- Will be populated by JavaScript -->
            </div>
        `;

        container.appendChild(section);

        // Load saved listings data
        this.loadSavedListingsData();

        console.log('✅ Saved listings section created');
    },

    /**
     * Load saved listings data
     */
    loadSavedListingsData() {
        const container = document.getElementById('saved-listings-grid');
        if (!container) return;

        const savedListings = this.getMockSavedListings();

        if (savedListings.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                        </svg>
                    </div>
                    <h3 class="text-lg font-medium text-slate-900 dark:text-white mb-2">No saved listings yet</h3>
                    <p class="text-slate-600 dark:text-slate-400 mb-4">Start browsing listings and save the ones you're interested in</p>
                    <button type="button" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors" onclick="window.buyerDashboard?.showSection('express-listings')">
                        Browse Listings
                    </button>
                </div>
            `;
        } else {
            container.innerHTML = savedListings.map(listing => this.createSavedListingCardHTML(listing)).join('');
        }
    },

    /**
     * Create saved listing card HTML
     * @param {Object} listing - Saved listing object
     * @returns {string} HTML for saved listing card
     */
    createSavedListingCardHTML(listing) {
        return `
            <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow">
                <div class="p-6">
                    <div class="flex items-start justify-between mb-4">
                        <div>
                            <h3 class="font-semibold text-slate-900 dark:text-white mb-1">${listing.businessName}</h3>
                            <p class="text-sm text-slate-600 dark:text-slate-400">${listing.location}</p>
                        </div>
                        <button type="button" class="p-1 text-red-500 hover:text-red-700 transition-colors" title="Remove from saved">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                            </svg>
                        </button>
                    </div>

                    <div class="space-y-2 mb-4">
                        <div class="flex justify-between text-sm">
                            <span class="text-slate-600 dark:text-slate-400">Asking Price</span>
                            <span class="font-semibold text-slate-900 dark:text-white">${this.formatCurrency(listing.askingPrice)}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-slate-600 dark:text-slate-400">Annual Revenue</span>
                            <span class="font-semibold text-slate-900 dark:text-white">${this.formatCurrency(listing.revenue)}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-slate-600 dark:text-slate-400">Industry</span>
                            <span class="font-semibold text-slate-900 dark:text-white">${listing.industry}</span>
                        </div>
                    </div>

                    ${listing.notes ? `
                        <div class="mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                            <p class="text-sm text-slate-600 dark:text-slate-400">
                                <strong>Notes:</strong> ${listing.notes}
                            </p>
                        </div>
                    ` : ''}

                    <div class="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                        <p class="text-xs text-slate-500">Saved ${this.formatTimeAgo(listing.savedDate)}</p>
                        <div class="flex items-center space-x-2">
                            <button type="button" class="text-primary hover:text-primary-dark font-medium text-sm">View Details</button>
                            <button type="button" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" title="Contact Seller">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};

// Extend BuyerDashboard prototype with sections methods
console.log('🔄 Attempting to extend BuyerDashboard with sections methods...');
console.log('🔍 window.BuyerDashboard available:', !!window.BuyerDashboard);
console.log('🔍 DashboardSections object keys:', Object.keys(DashboardSections));

if (typeof window !== 'undefined' && window.BuyerDashboard) {
    try {
        Object.assign(window.BuyerDashboard.prototype, DashboardSections);
        console.log('✅ Dashboard Sections methods added to BuyerDashboard prototype');

        // Verify methods were added
        const testInstance = new window.BuyerDashboard();
        const addedMethods = Object.keys(DashboardSections).filter(key =>
            typeof testInstance[key] === 'function'
        );
        console.log('✅ Verified sections methods added:', addedMethods);
    } catch (error) {
        console.error('❌ Failed to extend BuyerDashboard prototype with sections:', error);
    }
} else {
    console.warn('⚠️ BuyerDashboard not available, sections methods not added');
    console.log('🔍 window object keys containing "Dashboard":',
        Object.keys(window).filter(key => key.includes('Dashboard')));
}

// Update loading status
if (window.dashboardLoadingStatus) {
    window.dashboardLoadingStatus.modulesLoaded.sections = true;
}

console.log('✅ Dashboard Sections Module loaded');

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DashboardSections };
}
