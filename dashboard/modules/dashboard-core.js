/**
 * Dashboard Core Module
 * Main BuyerDashboard class and initialization logic
 * @author Ardonie Capital Development Team
 */

console.log('🚀 Loading Dashboard Core Module...');

// Global dashboard loading status for debugging
window.dashboardLoadingStatus = {
    coreLoaded: true,
    modulesLoaded: {},
    initializationAttempts: 0,
    lastError: null,
    isInitialized: false
};

/**
 * Main BuyerDashboard class
 * Coordinates all dashboard functionality and manages the overall state
 */
class BuyerDashboard {
    constructor() {
        this.currentSection = 'overview';
        this.currentUser = null;
        this.charts = {};
        this.isInitialized = false;
        
        console.log('📊 BuyerDashboard instance created');
    }

    /**
     * Initialize the dashboard
     * Orchestrates the complete dashboard setup process
     */
    async init() {
        try {
            console.log('🔄 Initializing Buyer Dashboard...');

            // Hide loading overlay immediately
            this.hideLoadingOverlay();

            // Wait for authentication to complete (with fallback)
            await this.waitForAuthentication();

            // Load footer component
            await this.loadFooter();

            // Setup event listeners (with fallback)
            if (typeof this.setupEventListeners === 'function') {
                this.setupEventListeners();
            } else {
                console.warn('⚠️ setupEventListeners method not available, skipping...');
            }

            // Initialize dashboard sections (with fallback)
            if (typeof this.initializeSections === 'function') {
                this.initializeSections();
            } else {
                console.warn('⚠️ initializeSections method not available, creating basic layout...');
                this.createBasicLayout();
            }

            // Load initial data (with fallback)
            await this.loadDashboardData();

            this.isInitialized = true;
            console.log('✅ Buyer Dashboard initialized successfully');

        } catch (error) {
            console.error('❌ Failed to initialize dashboard:', error);
            // Still hide loading overlay even if there's an error
            this.hideLoadingOverlay();

            // Only show error if it's a critical failure, not missing optional methods
            if (error.message && !error.message.includes('not a function')) {
                this.showError('Failed to load dashboard. Please refresh the page.');
            } else {
                console.warn('⚠️ Dashboard initialized with limited functionality due to missing methods');
            }
        }
    }

    /**
     * Wait for authentication to complete
     * Handles authentication with fallback for graceful degradation
     */
    async waitForAuthentication() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                console.warn('⚠️ Authentication timeout - proceeding with fallback');
                // Don't reject, just resolve with no user to allow dashboard to load
                resolve();
            }, 5000); // Reduced timeout

            const checkAuth = () => {
                if (window.authService && window.authService.isAuthenticated()) {
                    this.currentUser = window.authService.getCurrentUser();
                    if (this.currentUser) {
                        clearTimeout(timeout);
                        console.log('✅ Authentication confirmed for:', this.currentUser.email);
                        this.updateUserInfo();
                        resolve();
                        return;
                    }
                }
                setTimeout(checkAuth, 100);
            };

            // Also listen for authentication complete event
            document.addEventListener('authenticationComplete', (event) => {
                this.currentUser = event.detail.user;
                clearTimeout(timeout);
                console.log('✅ Authentication event received');
                this.updateUserInfo();
                resolve();
            });

            // Start checking immediately
            checkAuth();
            
            // Also try to proceed after a short delay even without auth
            setTimeout(() => {
                if (!this.currentUser) {
                    console.log('🔄 Proceeding without authentication confirmation...');
                    clearTimeout(timeout);
                    resolve();
                }
            }, 2000);
        });
    }

    /**
     * Update user information in the UI
     * Updates sidebar and header with authenticated user data
     */
    updateUserInfo() {
        if (!this.currentUser) return;

        // Update sidebar user info
        const userNameElement = document.getElementById('sidebar-user-name');
        const userEmailElement = document.getElementById('sidebar-user-email');
        
        if (userNameElement) {
            const displayName = this.currentUser.firstName && this.currentUser.lastName 
                ? `${this.currentUser.firstName} ${this.currentUser.lastName}`.trim()
                : this.currentUser.firstName || this.currentUser.lastName || 'User';
            userNameElement.textContent = displayName;
        }
        
        if (userEmailElement) {
            userEmailElement.textContent = this.currentUser.email || '';
        }

        console.log('✅ User info updated in UI');
    }

    /**
     * Load footer component
     * Dynamically loads the main footer into the dashboard
     */
    async loadFooter() {
        try {
            const footerContainer = document.getElementById('footer-container');
            if (!footerContainer) {
                console.warn('⚠️ Footer container not found');
                return;
            }

            const response = await fetch('../main-footer.html');
            if (!response.ok) {
                throw new Error(`Failed to load footer: ${response.status}`);
            }

            const footerHTML = await response.text();
            footerContainer.innerHTML = footerHTML;
            
            console.log('✅ Footer loaded successfully');
        } catch (error) {
            console.error('❌ Failed to load footer:', error);
        }
    }

    /**
     * Load dashboard data
     * Loads initial data for all dashboard sections
     */
    async loadDashboardData() {
        try {
            console.log('🔄 Loading dashboard data...');

            // Load data for each section (with graceful fallback)
            if (typeof this.loadOverviewData === 'function') {
                try {
                    await this.loadOverviewData();
                    console.log('✅ Overview data loaded');
                } catch (error) {
                    console.warn('⚠️ Failed to load overview data:', error);
                }
            } else {
                console.log('ℹ️ loadOverviewData method not available, skipping...');
            }

            if (typeof this.loadMessagesData === 'function') {
                try {
                    await this.loadMessagesData();
                    console.log('✅ Messages data loaded');
                } catch (error) {
                    console.warn('⚠️ Failed to load messages data:', error);
                }
            } else {
                console.log('ℹ️ loadMessagesData method not available, skipping...');
            }

            console.log('✅ Dashboard data loading completed');
        } catch (error) {
            console.error('❌ Failed to load dashboard data:', error);
            // Don't throw the error, just log it to prevent dashboard initialization failure
        }
    }

    /**
     * Show section by name
     * Manages section visibility and navigation state
     */
    showSection(sectionName) {
        console.log('🔄 Switching to section:', sectionName);
        
        // Hide all sections
        const sections = document.querySelectorAll('.dashboard-section');
        sections.forEach(section => {
            section.style.display = 'none';
        });

        // Show target section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.style.display = 'block';
            this.currentSection = sectionName;
        } else {
            console.error('❌ Section not found:', sectionName);
            return;
        }

        // Update navigation active state
        const navItems = document.querySelectorAll('.dashboard-nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            item.removeAttribute('aria-current');
            
            // Check both data-section and href attributes
            const itemSection = item.getAttribute('data-section') || 
                              item.getAttribute('href')?.substring(1);
            
            if (itemSection === sectionName) {
                item.classList.add('active');
                item.setAttribute('aria-current', 'page');
            }
        });

        console.log('✅ Section switched to:', sectionName);
    }

    /**
     * Hide loading overlay
     * Removes the authentication loading screen
     */
    hideLoadingOverlay() {
        const overlay = document.getElementById('auth-loading');
        if (overlay) {
            overlay.style.display = 'none';
            console.log('✅ Loading overlay hidden');
        }
    }

    /**
     * Create basic layout as fallback when sections module is not available
     */
    createBasicLayout() {
        console.log('🔄 Creating basic dashboard layout...');
        const container = document.getElementById('dashboard-sections');
        if (!container) {
            console.error('❌ Dashboard sections container not found!');
            return;
        }

        container.innerHTML = `
            <div class="dashboard-section" id="overview-section">
                <div class="mb-6">
                    <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Dashboard Overview</h2>
                    <p class="text-slate-600 dark:text-slate-400">Welcome to your buyer dashboard</p>
                </div>

                <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                    <div class="text-center">
                        <div class="text-blue-600 dark:text-blue-400 mb-4">
                            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">Dashboard Loaded Successfully</h3>
                        <p class="text-slate-600 dark:text-slate-400 mb-4">Your dashboard is running in basic mode. Some features may be limited.</p>
                        <button onclick="window.location.reload()" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                            Refresh Page
                        </button>
                    </div>
                </div>
            </div>
        `;

        console.log('✅ Basic dashboard layout created');
    }

    /**
     * Show error message
     * Displays error notifications to the user
     */
    showError(message) {
        console.error('❌ Dashboard Error:', message);
        
        // Create error notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg bg-red-500 text-white transition-all duration-300 transform translate-x-full';
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

/**
 * Initialize dashboard with proper module loading sequence and retry limits
 */
function initializeDashboard(retryCount = 0) {
    const maxRetries = 100; // Maximum 5 seconds of retries (100 * 50ms)

    // Update loading status
    window.dashboardLoadingStatus.initializationAttempts = retryCount + 1;

    // Check if all required methods are available
    const requiredMethods = [
        'setupEventListeners',
        'initializeSections',
        'loadOverviewData',
        'loadMessagesData'
    ];

    const dashboard = new BuyerDashboard();
    let missingMethods = [];
    let availableMethods = [];

    for (const method of requiredMethods) {
        if (typeof dashboard[method] !== 'function') {
            missingMethods.push(method);
        } else {
            availableMethods.push(method);
        }
    }

    console.log(`🔍 Dashboard methods check - Available: [${availableMethods.join(', ')}], Missing: [${missingMethods.join(', ')}]`);

    if (missingMethods.length > 0) {
        window.dashboardLoadingStatus.lastError = `Missing methods: ${missingMethods.join(', ')}`;

        if (retryCount < maxRetries) {
            console.log(`🔄 Dashboard initialization retry ${retryCount + 1}/${maxRetries}. Missing methods:`, missingMethods);
            // Retry initialization after a short delay
            setTimeout(() => initializeDashboard(retryCount + 1), 50);
            return;
        } else {
            console.error('❌ Dashboard initialization failed after maximum retries. Missing methods:', missingMethods);
            console.error('❌ This usually indicates a script loading order issue.');

            // Try to proceed anyway with graceful degradation
            console.warn('⚠️ Attempting to initialize dashboard with missing methods...');
        }
    }

    // Proceed with initialization (either all methods available or max retries reached)
    if (!window.buyerDashboard) {
        window.buyerDashboard = dashboard;
        console.log('✅ Dashboard instance created, starting initialization...');

        try {
            window.buyerDashboard.init();
            window.dashboardLoadingStatus.isInitialized = true;
            window.dashboardLoadingStatus.lastError = null;
        } catch (error) {
            window.dashboardLoadingStatus.lastError = error.message;
            console.error('❌ Dashboard initialization error:', error);
        }
    } else {
        console.log('ℹ️ Dashboard already initialized, skipping...');
        window.dashboardLoadingStatus.isInitialized = true;
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔄 DOM Content Loaded - Starting Dashboard Initialization...');
    initializeDashboard(0);
});

// Fallback initialization if DOMContentLoaded already fired
if (document.readyState === 'loading') {
    console.log('📄 Document still loading, waiting for DOMContentLoaded...');
} else {
    console.log('📄 Document already loaded, initializing dashboard immediately...');
    setTimeout(() => {
        if (!window.buyerDashboard) {
            console.log('🔄 Fallback initialization triggered...');
            initializeDashboard(0);
        }
    }, 100);
}

// Expose BuyerDashboard class to global scope for extension modules
window.BuyerDashboard = BuyerDashboard;
console.log('✅ BuyerDashboard class exposed to global scope');

console.log('✅ Dashboard Core Module loaded');

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BuyerDashboard };
}
