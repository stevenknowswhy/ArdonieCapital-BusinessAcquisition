/**
 * Buyer Dashboard Component with Supabase Integration
 * Handles buyer-specific functionality, profile data, and dashboard features
 */

class BuyerDashboard {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.userProfile = null;
        this.init();
    }

    async init() {
        console.log('🏪 Initializing Buyer Dashboard...');

        // Wait for role-based auth to be available
        await this.waitForRoleBasedAuth();

        // Check authentication and role access
        if (!this.checkRoleBasedAccess()) {
            return;
        }

        // Wait for Supabase to be available
        await this.waitForSupabase();

        // Initialize Supabase client
        this.initializeSupabase();

        // Check authentication
        await this.checkAuthentication();

        // Load dashboard data
        await this.loadDashboardData();

        // Apply role-based UI restrictions
        this.applyRoleBasedRestrictions();

        // Setup event listeners
        this.setupEventListeners();

        console.log('✅ Buyer Dashboard initialized successfully');
    }

    async waitForRoleBasedAuth(maxWait = 10000) {
        const startTime = Date.now();
        while (!window.roleBasedAuth && (Date.now() - startTime) < maxWait) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        if (!window.roleBasedAuth) {
            throw new Error('Role-based authentication not available');
        }
    }

    checkRoleBasedAccess() {
        // Require authentication
        if (!window.roleBasedAuth.requireAuthentication()) {
            return false;
        }

        // Check if user has buyer role or admin privileges
        if (!window.roleBasedAuth.hasAnyRole(['buyer', 'admin', 'super_admin'])) {
            console.warn('❌ Access denied: User does not have buyer dashboard access');
            alert('Access denied: You do not have permission to access the buyer dashboard.');
            window.location.href = window.roleBasedAuth.getAuthorizedDashboardUrl();
            return false;
        }

        console.log('✅ Role-based access check passed for buyer dashboard');
        return true;
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
        console.log('✅ Supabase client initialized for buyer dashboard');
    }

    async checkAuthentication() {
        try {
            // Check if user is authenticated
            const { data: { session }, error } = await this.supabase.auth.getSession();
            
            if (error) {
                console.error('❌ Auth check error:', error);
                this.redirectToLogin();
                return;
            }

            if (!session) {
                console.log('❌ No active session - redirecting to login');
                this.redirectToLogin();
                return;
            }

            this.currentUser = session.user;
            console.log('✅ User authenticated:', this.currentUser.email);

            // Load user profile
            await this.loadUserProfile();

        } catch (error) {
            console.error('❌ Authentication check failed:', error);
            this.redirectToLogin();
        }
    }

    async loadUserProfile() {
        try {
            const { data: profile, error } = await this.supabase
                .from('profiles')
                .select(`
                    *,
                    subscription_tiers (
                        name,
                        slug,
                        features
                    )
                `)
                .eq('user_id', this.currentUser.id)
                .single();

            if (error) {
                console.error('❌ Profile load error:', error);
                return;
            }

            this.userProfile = profile;
            console.log('✅ User profile loaded:', profile);

            // Update UI with profile data
            this.updateProfileUI();

        } catch (error) {
            console.error('❌ Failed to load user profile:', error);
        }
    }

    updateProfileUI() {
        if (!this.userProfile) return;

        // Update user name
        const userNameElements = document.querySelectorAll('[data-user-name]');
        userNameElements.forEach(el => {
            el.textContent = `${this.userProfile.first_name} ${this.userProfile.last_name}`;
        });

        // Update subscription tier
        const tierElements = document.querySelectorAll('[data-subscription-tier]');
        tierElements.forEach(el => {
            el.textContent = this.userProfile.subscription_tiers?.name || 'Free';
        });

        // Update subscription status
        const statusElements = document.querySelectorAll('[data-subscription-status]');
        statusElements.forEach(el => {
            el.textContent = this.userProfile.subscription_status || 'free';
            el.className = `px-2 py-1 rounded text-xs ${
                this.userProfile.subscription_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`;
        });

        // Show/hide features based on subscription
        this.updateFeatureAccess();
    }

    updateFeatureAccess() {
        const isProUser = this.userProfile?.subscription_status === 'active' &&
                         this.userProfile?.subscription_tiers?.slug === 'pro';

        // Show/hide pro features
        const proFeatures = document.querySelectorAll('[data-pro-feature]');
        proFeatures.forEach(el => {
            if (isProUser) {
                el.style.display = 'block';
                el.classList.remove('opacity-50', 'pointer-events-none');
            } else {
                el.classList.add('opacity-50', 'pointer-events-none');
                // Add upgrade prompt
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showUpgradePrompt();
                });
            }
        });

        // Update free tier limitations
        const freeFeatures = document.querySelectorAll('[data-free-feature]');
        freeFeatures.forEach(el => {
            if (!isProUser) {
                el.style.display = 'block';
            } else {
                el.style.display = 'none';
            }
        });
    }

    applyRoleBasedRestrictions() {
        console.log('🔐 Applying role-based restrictions to buyer dashboard...');

        // Apply general role-based visibility
        window.roleBasedAuth.applyRoleBasedVisibility();

        // Check specific feature permissions
        this.checkFeaturePermissions();

        // Update navigation based on roles
        this.updateRoleBasedNavigation();

        console.log('✅ Role-based restrictions applied');
    }

    checkFeaturePermissions() {
        // Advanced search features
        if (!window.roleBasedAuth.hasPermission('buyer.search.advanced')) {
            const advancedSearchElements = document.querySelectorAll('[data-feature="advanced-search"]');
            advancedSearchElements.forEach(el => {
                el.style.display = 'none';
            });
        }

        // Express listings access
        if (!window.roleBasedAuth.canAccessFeature('express_listings')) {
            const expressElements = document.querySelectorAll('[data-feature="express-listings"]');
            expressElements.forEach(el => {
                el.style.display = 'none';
            });
        }

        // Deal management features
        if (!window.roleBasedAuth.hasPermission('buyer.deals.view')) {
            const dealElements = document.querySelectorAll('[data-feature="deal-management"]');
            dealElements.forEach(el => {
                el.style.display = 'none';
            });
        }

        // Analytics features (admin only)
        if (!window.roleBasedAuth.hasAnyPermission(['admin.analytics.view', 'buyer.analytics.view'])) {
            const analyticsElements = document.querySelectorAll('[data-feature="analytics"]');
            analyticsElements.forEach(el => {
                el.style.display = 'none';
            });
        }
    }

    updateRoleBasedNavigation() {
        // Show role switcher if user has multiple roles
        if (window.roleBasedAuth.isMultiRole()) {
            const roleSwitcher = document.getElementById('role-switcher');
            if (roleSwitcher) {
                roleSwitcher.style.display = 'block';
                this.populateRoleSwitcher();
            }
        }

        // Update dashboard links based on available roles
        const dashboardLinks = document.querySelectorAll('[data-dashboard-link]');
        dashboardLinks.forEach(link => {
            const requiredRole = link.dataset.dashboardLink;
            if (!window.roleBasedAuth.hasRole(requiredRole)) {
                link.style.display = 'none';
            }
        });
    }

    populateRoleSwitcher() {
        const roleSwitcher = document.getElementById('role-switcher-select');
        if (!roleSwitcher) return;

        const userRoles = window.roleBasedAuth.getUserRoles();
        roleSwitcher.innerHTML = userRoles.map(role => {
            const roleNames = {
                'buyer': 'Buyer Dashboard',
                'seller': 'Seller Dashboard',
                'vendor': 'Vendor Portal',
                'admin': 'Admin Dashboard',
                'super_admin': 'Super Admin'
            };
            return `<option value="${role}">${roleNames[role] || role}</option>`;
        }).join('');

        // Set current role as selected
        roleSwitcher.value = 'buyer';

        // Add change handler
        roleSwitcher.addEventListener('change', (e) => {
            this.switchToRole(e.target.value);
        });
    }

    switchToRole(role) {
        const dashboardUrls = {
            'buyer': '../portals/buyer-portal.html',
            'seller': '../portals/seller-portal.html',
            'vendor': '../portals/vendor-portal.html',
            'admin': '../dashboard/admin-dashboard.html',
            'super_admin': '../dashboard/super-admin-dashboard.html'
        };

        const url = dashboardUrls[role];
        if (url && window.roleBasedAuth.hasRole(role)) {
            window.location.href = url;
        } else {
            alert('Access denied: You do not have permission to access this dashboard.');
        }
    }

    async loadDashboardData() {
        try {
            // Load saved searches
            await this.loadSavedSearches();
            
            // Load recent activity
            await this.loadRecentActivity();
            
            // Load recommended listings
            await this.loadRecommendedListings();
            
            // Load dashboard stats
            await this.loadDashboardStats();

        } catch (error) {
            console.error('❌ Failed to load dashboard data:', error);
        }
    }

    async loadSavedSearches() {
        try {
            const { data: searches, error } = await this.supabase
                .from('saved_searches')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) {
                console.error('❌ Failed to load saved searches:', error);
                return;
            }

            this.renderSavedSearches(searches || []);

        } catch (error) {
            console.error('❌ Error loading saved searches:', error);
        }
    }

    async loadRecentActivity() {
        try {
            const { data: activity, error } = await this.supabase
                .from('user_activity')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) {
                console.error('❌ Failed to load recent activity:', error);
                return;
            }

            this.renderRecentActivity(activity || []);

        } catch (error) {
            console.error('❌ Error loading recent activity:', error);
        }
    }

    async loadRecommendedListings() {
        try {
            // For now, load recent listings
            // TODO: Implement recommendation algorithm
            const { data: listings, error } = await this.supabase
                .from('listings')
                .select(`
                    *,
                    profiles (
                        first_name,
                        last_name
                    )
                `)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(6);

            if (error) {
                console.error('❌ Failed to load recommended listings:', error);
                return;
            }

            this.renderRecommendedListings(listings || []);

        } catch (error) {
            console.error('❌ Error loading recommended listings:', error);
        }
    }

    async loadDashboardStats() {
        try {
            // Load various stats for the dashboard
            const stats = {
                totalViews: 0,
                savedListings: 0,
                activeInquiries: 0,
                completedDeals: 0
            };

            // Get saved listings count
            const { count: savedCount } = await this.supabase
                .from('saved_listings')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', this.currentUser.id);

            stats.savedListings = savedCount || 0;

            // Get active inquiries count
            const { count: inquiriesCount } = await this.supabase
                .from('inquiries')
                .select('*', { count: 'exact', head: true })
                .eq('buyer_id', this.currentUser.id)
                .eq('status', 'active');

            stats.activeInquiries = inquiriesCount || 0;

            this.renderDashboardStats(stats);

        } catch (error) {
            console.error('❌ Error loading dashboard stats:', error);
        }
    }

    renderSavedSearches(searches) {
        const container = document.getElementById('saved-searches-container');
        if (!container) return;

        if (searches.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <p>No saved searches yet</p>
                    <a href="../marketplace/listings.html" class="text-primary-600 hover:text-primary-700">Browse listings to save searches</a>
                </div>
            `;
            return;
        }

        container.innerHTML = searches.map(search => `
            <div class="bg-white p-4 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors">
                <h4 class="font-medium text-gray-900">${search.name}</h4>
                <p class="text-sm text-gray-600 mt-1">${search.criteria}</p>
                <div class="flex justify-between items-center mt-3">
                    <span class="text-xs text-gray-500">Saved ${new Date(search.created_at).toLocaleDateString()}</span>
                    <button onclick="buyerDashboard.runSearch('${search.id}')" class="text-primary-600 hover:text-primary-700 text-sm">Run Search</button>
                </div>
            </div>
        `).join('');
    }

    renderRecentActivity(activity) {
        const container = document.getElementById('recent-activity-container');
        if (!container) return;

        if (activity.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <p>No recent activity</p>
                </div>
            `;
            return;
        }

        container.innerHTML = activity.map(item => `
            <div class="flex items-center space-x-3 py-3 border-b border-gray-100 last:border-b-0">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span class="text-primary-600 text-sm">📋</span>
                    </div>
                </div>
                <div class="flex-1">
                    <p class="text-sm text-gray-900">${item.description}</p>
                    <p class="text-xs text-gray-500">${new Date(item.created_at).toLocaleDateString()}</p>
                </div>
            </div>
        `).join('');
    }

    renderRecommendedListings(listings) {
        const container = document.getElementById('recommended-listings-container');
        if (!container) return;

        if (listings.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <p>No listings available</p>
                    <a href="../marketplace/listings.html" class="text-primary-600 hover:text-primary-700">Browse all listings</a>
                </div>
            `;
            return;
        }

        container.innerHTML = listings.map(listing => `
            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-primary-300 transition-colors">
                <div class="p-4">
                    <h4 class="font-medium text-gray-900 mb-2">${listing.title}</h4>
                    <p class="text-sm text-gray-600 mb-3">${listing.description?.substring(0, 100)}...</p>
                    <div class="flex justify-between items-center">
                        <span class="text-lg font-semibold text-primary-600">$${listing.price?.toLocaleString()}</span>
                        <button onclick="buyerDashboard.viewListing('${listing.id}')" class="bg-primary-600 text-white px-3 py-1 rounded text-sm hover:bg-primary-700">View</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderDashboardStats(stats) {
        // Update stat cards
        const statElements = {
            'total-views': stats.totalViews,
            'saved-listings': stats.savedListings,
            'active-inquiries': stats.activeInquiries,
            'completed-deals': stats.completedDeals
        };

        Object.entries(statElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value.toLocaleString();
            }
        });
    }

    setupEventListeners() {
        // Upgrade button
        const upgradeButtons = document.querySelectorAll('[data-upgrade-button]');
        upgradeButtons.forEach(button => {
            button.addEventListener('click', () => this.showUpgradePrompt());
        });

        // Profile edit button
        const profileEditButton = document.getElementById('edit-profile-button');
        if (profileEditButton) {
            profileEditButton.addEventListener('click', () => this.editProfile());
        }
    }

    showUpgradePrompt() {
        alert('Upgrade to Pro to access this feature!\n\nPro features include:\n- Advanced search filters\n- Priority support\n- Unlimited saved searches\n- Deal analytics');
    }

    editProfile() {
        window.location.href = 'profile.html';
    }

    viewListing(listingId) {
        window.location.href = `../marketplace/listing.html?id=${listingId}`;
    }

    runSearch(searchId) {
        window.location.href = `../marketplace/listings.html?search=${searchId}`;
    }

    redirectToLogin() {
        window.location.href = '../auth/login.html';
    }
}

// Initialize buyer dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.buyerDashboard = new BuyerDashboard();
});
