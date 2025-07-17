/**
 * Dashboard Search Alerts Module
 * Integrates search alerts functionality into the buyer dashboard
 * Handles loading, displaying, and managing search alerts
 */

class DashboardSearchAlerts {
    constructor() {
        this.isInitialized = false;
        this.searchAlertsDashboard = null;
        this.alertsCount = 0;
    }

    /**
     * Initialize the search alerts dashboard module
     */
    async init() {
        try {
            console.log('🔍 Initializing Dashboard Search Alerts module...');
            
            // Set up navigation event listener
            this.setupNavigationListener();
            
            // Update alerts count in navigation
            await this.updateAlertsCount();
            
            this.isInitialized = true;
            console.log('✅ Dashboard Search Alerts module initialized');
            
        } catch (error) {
            console.error('❌ Error initializing Dashboard Search Alerts:', error);
        }
    }

    /**
     * Set up navigation listener for search alerts section
     */
    setupNavigationListener() {
        // Listen for section changes
        document.addEventListener('sectionChanged', (event) => {
            if (event.detail.section === 'search-alerts') {
                this.loadSearchAlertsSection();
            }
        });

        // Also handle direct navigation clicks
        const searchAlertsNavItem = document.querySelector('[data-section="search-alerts"]');
        if (searchAlertsNavItem) {
            searchAlertsNavItem.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSearchAlertsSection();
            });
        }
    }

    /**
     * Show the search alerts section
     */
    showSearchAlertsSection() {
        // Hide all other sections
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.add('hidden');
            section.classList.remove('active');
        });

        // Show search alerts section
        const searchAlertsSection = document.getElementById('search-alerts-section');
        if (searchAlertsSection) {
            searchAlertsSection.classList.remove('hidden');
            searchAlertsSection.classList.add('active');
        }

        // Update navigation active state
        document.querySelectorAll('.dashboard-nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const searchAlertsNavItem = document.querySelector('[data-section="search-alerts"]');
        if (searchAlertsNavItem) {
            searchAlertsNavItem.classList.add('active');
        }

        // Load the search alerts dashboard
        this.loadSearchAlertsSection();
    }

    /**
     * Load the search alerts section content
     */
    async loadSearchAlertsSection() {
        try {
            console.log('📋 Loading search alerts dashboard...');
            
            const container = document.getElementById('search-alerts-dashboard-container');
            if (!container) {
                console.error('❌ Search alerts container not found');
                return;
            }

            // Show loading state
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p class="text-slate-600 dark:text-slate-300">Loading search alerts...</p>
                </div>
            `;

            // Dynamically import the search alerts dashboard
            const { SearchAlertsDashboard } = await import('/src/features/search-alerts/components/search-alerts-dashboard.js');
            
            // Create and initialize the dashboard
            if (!this.searchAlertsDashboard) {
                this.searchAlertsDashboard = new SearchAlertsDashboard();
            }

            // Initialize the dashboard in the container
            await this.searchAlertsDashboard.init('search-alerts-dashboard-container');
            
            console.log('✅ Search alerts dashboard loaded successfully');

        } catch (error) {
            console.error('❌ Error loading search alerts dashboard:', error);
            
            // Show error state
            const container = document.getElementById('search-alerts-dashboard-container');
            if (container) {
                container.innerHTML = `
                    <div class="text-center py-12">
                        <div class="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <h3 class="text-lg font-medium text-slate-900 dark:text-white mb-2">Failed to Load Search Alerts</h3>
                        <p class="text-slate-600 dark:text-slate-300 mb-4">
                            There was an error loading your search alerts. Please try refreshing the page.
                        </p>
                        <button type="button" 
                            onclick="window.dashboardSearchAlerts.loadSearchAlertsSection()" 
                            class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors">
                            Try Again
                        </button>
                    </div>
                `;
            }
        }
    }

    /**
     * Update the alerts count in the navigation
     */
    async updateAlertsCount() {
        try {
            // Dynamically import the search alert service
            const { searchAlertService } = await import('/src/features/search-alerts/services/search-alert.service.js');
            
            // Get user's search alerts count
            const result = await searchAlertService.getUserSearchAlerts({
                limit: 1000, // Get all to count
                count_only: true
            });

            if (result.success) {
                this.alertsCount = result.count || 0;
                this.updateNavigationBadge();
            }

        } catch (error) {
            console.warn('⚠️ Could not update search alerts count:', error);
            // Don't show error to user, just log it
        }
    }

    /**
     * Update the navigation badge with alerts count
     */
    updateNavigationBadge() {
        const badge = document.getElementById('search-alerts-count');
        if (badge) {
            if (this.alertsCount > 0) {
                badge.textContent = this.alertsCount;
                badge.classList.remove('hidden');
                badge.setAttribute('aria-label', `${this.alertsCount} active search alerts`);
            } else {
                badge.classList.add('hidden');
            }
        }
    }

    /**
     * Refresh the search alerts data
     */
    async refresh() {
        if (this.searchAlertsDashboard) {
            await this.searchAlertsDashboard.loadSearchAlerts();
        }
        await this.updateAlertsCount();
    }

    /**
     * Handle new search alert created
     */
    onSearchAlertCreated() {
        this.refresh();
    }

    /**
     * Handle search alert deleted
     */
    onSearchAlertDeleted() {
        this.refresh();
    }

    /**
     * Handle search alert updated
     */
    onSearchAlertUpdated() {
        this.refresh();
    }
}

// Create global instance
window.dashboardSearchAlerts = new DashboardSearchAlerts();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardSearchAlerts.init();
});

// Listen for search alert events from other parts of the application
document.addEventListener('searchAlertCreated', () => {
    window.dashboardSearchAlerts.onSearchAlertCreated();
});

document.addEventListener('searchAlertDeleted', () => {
    window.dashboardSearchAlerts.onSearchAlertDeleted();
});

document.addEventListener('searchAlertUpdated', () => {
    window.dashboardSearchAlerts.onSearchAlertUpdated();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DashboardSearchAlerts };
}
