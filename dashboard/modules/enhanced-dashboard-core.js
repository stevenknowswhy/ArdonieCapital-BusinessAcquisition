/**
 * Enhanced Dashboard Core Module
 * Integrates with real database and multi-role authentication
 * Replaces mock data with actual Supabase integration
 */

import { enhancedDashboardDataService } from './enhanced-dashboard-data.service.js';
import { enhancedAuthService } from '../../src/features/authentication/services/enhanced-auth.service.js';

console.log('🚀 Loading Enhanced Dashboard Core Module...');

// Global dashboard status for debugging
window.enhancedDashboardStatus = {
    coreLoaded: true,
    dataServiceLoaded: false,
    authServiceLoaded: false,
    initializationAttempts: 0,
    lastError: null,
    isInitialized: false
};

/**
 * Enhanced Dashboard class with real database integration
 */
class EnhancedDashboard {
    constructor() {
        this.currentSection = 'overview';
        this.currentUser = null;
        this.userRole = null;
        this.charts = {};
        this.isInitialized = false;
        this.loadingStates = {};
        this.refreshInterval = null;
        
        console.log('📊 Enhanced Dashboard instance created');
    }

    /**
     * Initialize the enhanced dashboard
     */
    async init() {
        try {
            console.log('🔄 Initializing Enhanced Dashboard...');
            window.enhancedDashboardStatus.initializationAttempts++;

            // Initialize authentication service
            if (!enhancedAuthService.isInitialized) {
                await enhancedAuthService.init();
            }
            window.enhancedDashboardStatus.authServiceLoaded = true;

            // Get current user and verify authentication
            this.currentUser = await enhancedAuthService.getCurrentUser();
            if (!this.currentUser) {
                console.log('❌ No authenticated user found, redirecting to login');
                window.location.href = '/auth/login.html';
                return;
            }

            this.userRole = this.currentUser.selectedRole;
            console.log('👤 Current user:', this.currentUser.email, 'Role:', this.userRole);

            // Check if user needs role selection
            if (!this.userRole && this.currentUser.roles?.length > 1) {
                console.log('🔄 User needs role selection, redirecting...');
                window.location.href = '/dashboard/enhanced-role-selection.html';
                return;
            }

            // Initialize data service
            await enhancedDashboardDataService.init();
            window.enhancedDashboardStatus.dataServiceLoaded = true;

            // Setup dashboard
            await this.setupDashboard();
            
            // Load initial data
            await this.loadAllData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup auto-refresh
            this.setupAutoRefresh();
            
            // Hide loading overlay
            this.hideLoadingOverlay();
            
            this.isInitialized = true;
            window.enhancedDashboardStatus.isInitialized = true;
            
            console.log('✅ Enhanced Dashboard initialized successfully');

        } catch (error) {
            console.error('❌ Enhanced Dashboard initialization failed:', error);
            window.enhancedDashboardStatus.lastError = error.message;
            this.showError('Failed to initialize dashboard. Please refresh the page.');
        }
    }

    /**
     * Setup dashboard based on user role
     */
    async setupDashboard() {
        console.log('⚙️ Setting up dashboard for role:', this.userRole);
        
        // Update page title
        document.title = `${this.getRoleDisplayName()} Dashboard - Ardonie Capital`;
        
        // Update user info in header
        this.updateUserInfo();
        
        // Setup role-specific navigation
        this.setupRoleNavigation();
        
        // Show default section
        this.showSection('overview');
    }

    /**
     * Load all dashboard data
     */
    async loadAllData() {
        console.log('📊 Loading all dashboard data...');
        
        try {
            // Load data in parallel for better performance
            await Promise.all([
                this.loadOverviewData(),
                this.loadRecentActivity(),
                this.loadRoleSpecificData()
            ]);
            
            console.log('✅ All dashboard data loaded successfully');
        } catch (error) {
            console.error('❌ Error loading dashboard data:', error);
            this.showError('Some data could not be loaded. Please try refreshing.');
        }
    }

    /**
     * Load overview data for KPI cards
     */
    async loadOverviewData() {
        try {
            console.log('🔄 Loading overview data...');
            this.setLoadingState('overview', true);

            const overviewData = await enhancedDashboardDataService.getOverviewData();
            
            // Update KPI cards based on role
            this.updateKPICards(overviewData);
            
            // Track usage
            await enhancedDashboardDataService.updateUsageAnalytics('dashboard_overview');
            
            this.setLoadingState('overview', false);
            console.log('✅ Overview data loaded');
            
        } catch (error) {
            console.error('❌ Error loading overview data:', error);
            this.setLoadingState('overview', false);
            this.showKPIError();
        }
    }

    /**
     * Load recent activity
     */
    async loadRecentActivity() {
        try {
            console.log('🔄 Loading recent activity...');
            this.setLoadingState('activity', true);

            const activities = await enhancedDashboardDataService.getRecentActivity();
            this.updateRecentActivity(activities);
            
            this.setLoadingState('activity', false);
            console.log('✅ Recent activity loaded');
            
        } catch (error) {
            console.error('❌ Error loading recent activity:', error);
            this.setLoadingState('activity', false);
        }
    }

    /**
     * Load role-specific data
     */
    async loadRoleSpecificData() {
        try {
            console.log('🔄 Loading role-specific data for:', this.userRole);
            
            switch (this.userRole) {
                case 'buyer':
                    await this.loadBuyerData();
                    break;
                case 'seller':
                    await this.loadSellerData();
                    break;
                case 'vendor':
                case 'financial_professional':
                case 'legal_professional':
                    await this.loadVendorData();
                    break;
                case 'super_admin':
                case 'company_admin':
                    await this.loadAdminData();
                    break;
                default:
                    console.log('ℹ️ No specific data loading for role:', this.userRole);
            }
            
        } catch (error) {
            console.error('❌ Error loading role-specific data:', error);
        }
    }

    /**
     * Load buyer-specific data
     */
    async loadBuyerData() {
        try {
            const [savedListings, matches] = await Promise.all([
                enhancedDashboardDataService.getSavedListings(),
                enhancedDashboardDataService.getMatches()
            ]);
            
            this.updateSavedListings(savedListings);
            this.updateMatches(matches);
            
            console.log('✅ Buyer data loaded');
        } catch (error) {
            console.error('❌ Error loading buyer data:', error);
        }
    }

    /**
     * Load seller-specific data
     */
    async loadSellerData() {
        try {
            const activeListings = await enhancedDashboardDataService.getActiveListings();
            this.updateActiveListings(activeListings);
            
            console.log('✅ Seller data loaded');
        } catch (error) {
            console.error('❌ Error loading seller data:', error);
        }
    }

    /**
     * Load vendor-specific data
     */
    async loadVendorData() {
        try {
            // Placeholder for vendor-specific data
            console.log('✅ Vendor data loaded (placeholder)');
        } catch (error) {
            console.error('❌ Error loading vendor data:', error);
        }
    }

    /**
     * Load admin-specific data
     */
    async loadAdminData() {
        try {
            // Placeholder for admin-specific data
            console.log('✅ Admin data loaded (placeholder)');
        } catch (error) {
            console.error('❌ Error loading admin data:', error);
        }
    }

    /**
     * Update KPI cards based on role and data
     */
    updateKPICards(data) {
        const kpiMappings = {
            'buyer': {
                'saved-listings': { value: data.savedListings, label: 'Saved Listings', icon: '💾' },
                'active-matches': { value: data.activeMatches, label: 'Active Matches', icon: '🎯' },
                'total-views': { value: data.totalViews, label: 'Total Views', icon: '👁️' },
                'unread-messages': { value: data.unreadMessages, label: 'Unread Messages', icon: '💬' }
            },
            'seller': {
                'active-listings': { value: data.activeListings, label: 'Active Listings', icon: '📋' },
                'total-inquiries': { value: data.totalInquiries, label: 'Total Inquiries', icon: '❓' },
                'avg-listing-views': { value: data.avgListingViews, label: 'Avg. Views', icon: '📊' },
                'unread-messages': { value: data.unreadMessages, label: 'Unread Messages', icon: '💬' }
            },
            'vendor': {
                'active-clients': { value: data.activeClients, label: 'Active Clients', icon: '👥' },
                'pending-requests': { value: data.pendingRequests, label: 'Pending Requests', icon: '⏳' },
                'completed-projects': { value: data.completedProjects, label: 'Completed Projects', icon: '✅' },
                'monthly-revenue': { value: this.formatCurrency(data.monthlyRevenue), label: 'Monthly Revenue', icon: '💰' }
            },
            'super_admin': {
                'total-users': { value: data.totalUsers, label: 'Total Users', icon: '👥' },
                'active-listings': { value: data.activeListings, label: 'Active Listings', icon: '📋' },
                'monthly-signups': { value: data.monthlySignups, label: 'Monthly Signups', icon: '📈' },
                'system-health': { value: `${data.systemHealth}%`, label: 'System Health', icon: '🏥' }
            }
        };

        const mapping = kpiMappings[this.userRole] || kpiMappings['buyer'];
        
        Object.entries(mapping).forEach(([cardId, config]) => {
            this.updateKPICard(cardId, config);
        });
    }

    /**
     * Update individual KPI card
     */
    updateKPICard(cardId, config) {
        const card = document.querySelector(`[data-kpi="${cardId}"]`);
        if (!card) return;

        const valueEl = card.querySelector('.kpi-value');
        const labelEl = card.querySelector('.kpi-label');
        const iconEl = card.querySelector('.kpi-icon');

        if (valueEl) valueEl.textContent = config.value;
        if (labelEl) labelEl.textContent = config.label;
        if (iconEl) iconEl.textContent = config.icon;

        // Add animation
        card.classList.add('animate-pulse');
        setTimeout(() => card.classList.remove('animate-pulse'), 1000);
    }

    /**
     * Update recent activity list
     */
    updateRecentActivity(activities) {
        const container = document.getElementById('recent-activity-list');
        if (!container) return;

        if (activities.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No recent activity</p>
                </div>
            `;
            return;
        }

        container.innerHTML = activities.map(activity => `
            <div class="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span class="text-primary text-sm">${this.getActivityIcon(activity.type)}</span>
                    </div>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-white">${activity.description}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">${this.formatRelativeTime(activity.timestamp)}</p>
                </div>
            </div>
        `).join('');
    }

    /**
     * Get activity icon
     */
    getActivityIcon(type) {
        const icons = {
            'listing_view': '👁️',
            'listing_save': '💾',
            'message_sent': '💬',
            'profile_update': '👤',
            'search_performed': '🔍',
            'match_created': '🎯'
        };
        return icons[type] || '📝';
    }

    /**
     * Format relative time
     */
    formatRelativeTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return time.toLocaleDateString();
    }

    /**
     * Format currency
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    /**
     * Get role display name
     */
    getRoleDisplayName() {
        const roleNames = {
            'buyer': 'Buyer',
            'seller': 'Seller',
            'vendor': 'Vendor',
            'financial_professional': 'Financial Professional',
            'legal_professional': 'Legal Professional',
            'super_admin': 'Super Admin',
            'company_admin': 'Company Admin',
            'blog_editor': 'Blog Editor',
            'blog_contributor': 'Blog Contributor'
        };
        return roleNames[this.userRole] || 'User';
    }

    /**
     * Update user info in header
     */
    updateUserInfo() {
        const userNameEl = document.querySelector('.user-name');
        const userRoleEl = document.querySelector('.user-role');
        const userAvatarEl = document.querySelector('.user-avatar');

        if (userNameEl) {
            const fullName = `${this.currentUser.firstName} ${this.currentUser.lastName}`.trim();
            userNameEl.textContent = fullName || this.currentUser.email;
        }

        if (userRoleEl) {
            userRoleEl.textContent = this.getRoleDisplayName();
        }

        if (userAvatarEl) {
            const initials = (this.currentUser.firstName?.[0] || '') + (this.currentUser.lastName?.[0] || '');
            userAvatarEl.textContent = initials || this.currentUser.email[0].toUpperCase();
        }
    }

    /**
     * Setup role-specific navigation
     */
    setupRoleNavigation() {
        // This would customize navigation based on role
        // Implementation depends on specific navigation structure
        console.log('⚙️ Setting up navigation for role:', this.userRole);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshDashboard());
        }

        // Section navigation
        document.querySelectorAll('[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.showSection(section);
            });
        });

        // Role switching
        const roleSwitchBtn = document.getElementById('switch-role');
        if (roleSwitchBtn && this.currentUser.roles?.length > 1) {
            roleSwitchBtn.addEventListener('click', () => {
                window.location.href = '/dashboard/enhanced-role-selection.html';
            });
        }
    }

    /**
     * Setup auto-refresh
     */
    setupAutoRefresh() {
        // Refresh data every 5 minutes
        this.refreshInterval = setInterval(() => {
            console.log('🔄 Auto-refreshing dashboard data...');
            this.loadOverviewData();
            this.loadRecentActivity();
        }, 5 * 60 * 1000);
    }

    /**
     * Show section
     */
    showSection(sectionName) {
        console.log('🔄 Switching to section:', sectionName);
        
        // Hide all sections
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.style.display = 'none';
        });

        // Show target section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.style.display = 'block';
            this.currentSection = sectionName;
        }

        // Update navigation
        document.querySelectorAll('[data-section]').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === sectionName) {
                link.classList.add('active');
            }
        });

        // Track section view
        enhancedDashboardDataService.trackActivity('section_view', { section: sectionName });
    }

    /**
     * Set loading state
     */
    setLoadingState(component, isLoading) {
        this.loadingStates[component] = isLoading;
        
        const loader = document.querySelector(`[data-loader="${component}"]`);
        if (loader) {
            loader.style.display = isLoading ? 'block' : 'none';
        }
    }

    /**
     * Refresh dashboard
     */
    async refreshDashboard() {
        console.log('🔄 Refreshing dashboard...');
        
        try {
            await enhancedDashboardDataService.refreshAllData();
            await this.loadAllData();
            
            // Show success message
            this.showSuccessMessage('Dashboard refreshed successfully');
            
        } catch (error) {
            console.error('❌ Error refreshing dashboard:', error);
            this.showError('Failed to refresh dashboard. Please try again.');
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        console.error('🚨 Dashboard Error:', message);
        // Implementation depends on notification system
    }

    /**
     * Show success message
     */
    showSuccessMessage(message) {
        console.log('✅ Dashboard Success:', message);
        // Implementation depends on notification system
    }

    /**
     * Show KPI error
     */
    showKPIError() {
        document.querySelectorAll('[data-kpi]').forEach(card => {
            const valueEl = card.querySelector('.kpi-value');
            if (valueEl) valueEl.textContent = '--';
        });
    }

    /**
     * Hide loading overlay
     */
    hideLoadingOverlay() {
        const overlay = document.getElementById('auth-loading') || document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
            console.log('✅ Loading overlay hidden');
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        console.log('🧹 Enhanced Dashboard cleaned up');
    }

    // Placeholder methods for specific data updates
    updateSavedListings(listings) {
        console.log('📋 Updating saved listings:', listings.length);
        // Implementation depends on UI structure
    }

    updateMatches(matches) {
        console.log('🎯 Updating matches:', matches.length);
        // Implementation depends on UI structure
    }

    updateActiveListings(listings) {
        console.log('📋 Updating active listings:', listings.length);
        // Implementation depends on UI structure
    }
}

// Create global instance
window.EnhancedDashboard = EnhancedDashboard;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOM ready, initializing Enhanced Dashboard...');
    window.enhancedDashboard = new EnhancedDashboard();
    window.enhancedDashboard.init();
});

console.log('✅ Enhanced Dashboard Core Module loaded');

export { EnhancedDashboard };
