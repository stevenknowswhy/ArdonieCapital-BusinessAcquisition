/**
 * Seller Dashboard Component with Supabase Integration
 * Handles seller-specific functionality, listing management, and analytics
 */

class SellerDashboard {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.userProfile = null;
        this.listings = [];
        this.init();
    }

    async init() {
        console.log('🏪 Initializing Seller Dashboard...');

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

        console.log('✅ Seller Dashboard initialized successfully');
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

        // Check if user has seller role or admin privileges
        if (!window.roleBasedAuth.hasAnyRole(['seller', 'admin', 'super_admin'])) {
            console.warn('❌ Access denied: User does not have seller dashboard access');
            alert('Access denied: You do not have permission to access the seller dashboard.');
            window.location.href = window.roleBasedAuth.getAuthorizedDashboardUrl();
            return false;
        }

        console.log('✅ Role-based access check passed for seller dashboard');
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
        console.log('✅ Supabase client initialized for seller dashboard');
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
    }

    applyRoleBasedRestrictions() {
        console.log('🔐 Applying role-based restrictions to seller dashboard...');

        // Apply general role-based visibility
        window.roleBasedAuth.applyRoleBasedVisibility();

        // Check specific feature permissions
        this.checkFeaturePermissions();

        // Update navigation based on roles
        this.updateRoleBasedNavigation();

        console.log('✅ Role-based restrictions applied');
    }

    checkFeaturePermissions() {
        // Listing creation and management
        if (!window.roleBasedAuth.hasPermission('seller.listings.create')) {
            const listingElements = document.querySelectorAll('[data-feature="listing-management"]');
            listingElements.forEach(el => {
                el.style.display = 'none';
            });
        }

        // Deal pipeline access
        if (!window.roleBasedAuth.hasPermission('seller.deals.manage')) {
            const dealElements = document.querySelectorAll('[data-feature="deal-pipeline"]');
            dealElements.forEach(el => {
                el.style.display = 'none';
            });
        }

        // Analytics features
        if (!window.roleBasedAuth.hasPermission('seller.analytics.view')) {
            const analyticsElements = document.querySelectorAll('[data-feature="analytics"]');
            analyticsElements.forEach(el => {
                el.style.display = 'none';
            });
        }

        // Express Deal eligibility (Pro feature + seller role)
        const isProUser = this.userProfile?.subscription_status === 'active';
        if (!isProUser || !window.roleBasedAuth.hasPermission('seller.listings.create')) {
            const expressElements = document.querySelectorAll('[data-feature="express-deal"]');
            expressElements.forEach(el => {
                el.classList.add('opacity-50', 'pointer-events-none');
                el.title = 'Upgrade to Pro to access Express Deal features';
            });
        }

        // Document management
        if (!window.roleBasedAuth.hasPermission('seller.documents.manage')) {
            const docElements = document.querySelectorAll('[data-feature="document-management"]');
            docElements.forEach(el => {
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
        roleSwitcher.value = 'seller';

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
            // Load seller's listings
            await this.loadMyListings();
            
            // Load recent inquiries
            await this.loadRecentInquiries();
            
            // Load dashboard stats
            await this.loadDashboardStats();
            
            // Load deal pipeline
            await this.loadDealPipeline();

        } catch (error) {
            console.error('❌ Failed to load dashboard data:', error);
        }
    }

    async loadMyListings() {
        try {
            const { data: listings, error } = await this.supabase
                .from('listings')
                .select('*')
                .eq('seller_id', this.currentUser.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ Failed to load listings:', error);
                return;
            }

            this.listings = listings || [];
            console.log(`✅ Loaded ${this.listings.length} listings`);
            
            this.renderMyListings();

        } catch (error) {
            console.error('❌ Error loading listings:', error);
        }
    }

    async loadRecentInquiries() {
        try {
            const { data: inquiries, error } = await this.supabase
                .from('inquiries')
                .select(`
                    *,
                    profiles (
                        first_name,
                        last_name
                    ),
                    listings (
                        title
                    )
                `)
                .eq('seller_id', this.currentUser.id)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) {
                console.error('❌ Failed to load inquiries:', error);
                return;
            }

            this.renderRecentInquiries(inquiries || []);

        } catch (error) {
            console.error('❌ Error loading inquiries:', error);
        }
    }

    async loadDashboardStats() {
        try {
            const stats = {
                totalListings: this.listings.length,
                activeListings: 0,
                totalViews: 0,
                totalInquiries: 0,
                completedDeals: 0
            };

            // Count active listings
            stats.activeListings = this.listings.filter(l => l.status === 'active').length;

            // Get total inquiries
            const { count: inquiriesCount } = await this.supabase
                .from('inquiries')
                .select('*', { count: 'exact', head: true })
                .eq('seller_id', this.currentUser.id);

            stats.totalInquiries = inquiriesCount || 0;

            // Get completed deals
            const { count: dealsCount } = await this.supabase
                .from('deals')
                .select('*', { count: 'exact', head: true })
                .eq('seller_id', this.currentUser.id)
                .eq('status', 'completed');

            stats.completedDeals = dealsCount || 0;

            this.renderDashboardStats(stats);

        } catch (error) {
            console.error('❌ Error loading dashboard stats:', error);
        }
    }

    async loadDealPipeline() {
        try {
            const { data: deals, error } = await this.supabase
                .from('deals')
                .select(`
                    *,
                    profiles (
                        first_name,
                        last_name
                    ),
                    listings (
                        title,
                        price
                    )
                `)
                .eq('seller_id', this.currentUser.id)
                .neq('status', 'completed')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ Failed to load deal pipeline:', error);
                return;
            }

            this.renderDealPipeline(deals || []);

        } catch (error) {
            console.error('❌ Error loading deal pipeline:', error);
        }
    }

    renderMyListings() {
        const container = document.getElementById('my-listings-container');
        if (!container) return;

        if (this.listings.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <p>No listings yet</p>
                    <button onclick="sellerDashboard.createListing()" class="mt-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">Create Your First Listing</button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.listings.slice(0, 6).map(listing => `
            <div class="bg-white p-4 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="font-medium text-gray-900">${listing.title}</h4>
                    <span class="px-2 py-1 rounded text-xs ${
                        listing.status === 'active' ? 'bg-green-100 text-green-800' : 
                        listing.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                    }">${listing.status}</span>
                </div>
                <p class="text-sm text-gray-600 mb-3">$${listing.price?.toLocaleString()}</p>
                <div class="flex justify-between items-center">
                    <span class="text-xs text-gray-500">Created ${new Date(listing.created_at).toLocaleDateString()}</span>
                    <div class="space-x-2">
                        <button onclick="sellerDashboard.editListing('${listing.id}')" class="text-primary-600 hover:text-primary-700 text-sm">Edit</button>
                        <button onclick="sellerDashboard.viewListing('${listing.id}')" class="text-primary-600 hover:text-primary-700 text-sm">View</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderRecentInquiries(inquiries) {
        const container = document.getElementById('recent-inquiries-container');
        if (!container) return;

        if (inquiries.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <p>No inquiries yet</p>
                </div>
            `;
            return;
        }

        container.innerHTML = inquiries.map(inquiry => `
            <div class="flex items-center space-x-3 py-3 border-b border-gray-100 last:border-b-0">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span class="text-blue-600 text-sm">💬</span>
                    </div>
                </div>
                <div class="flex-1">
                    <p class="text-sm text-gray-900">${inquiry.profiles?.first_name} ${inquiry.profiles?.last_name} inquired about "${inquiry.listings?.title}"</p>
                    <p class="text-xs text-gray-500">${new Date(inquiry.created_at).toLocaleDateString()}</p>
                </div>
                <button onclick="sellerDashboard.viewInquiry('${inquiry.id}')" class="text-primary-600 hover:text-primary-700 text-sm">View</button>
            </div>
        `).join('');
    }

    renderDashboardStats(stats) {
        // Update stat cards
        const statElements = {
            'total-listings': stats.totalListings,
            'active-listings': stats.activeListings,
            'total-inquiries': stats.totalInquiries,
            'completed-deals': stats.completedDeals
        };

        Object.entries(statElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value.toLocaleString();
            }
        });
    }

    renderDealPipeline(deals) {
        const container = document.getElementById('deal-pipeline-container');
        if (!container) return;

        if (deals.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <p>No active deals</p>
                </div>
            `;
            return;
        }

        container.innerHTML = deals.map(deal => `
            <div class="bg-white p-4 rounded-lg border border-gray-200">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="font-medium text-gray-900">${deal.listings?.title}</h4>
                    <span class="px-2 py-1 rounded text-xs ${
                        deal.status === 'negotiating' ? 'bg-yellow-100 text-yellow-800' : 
                        deal.status === 'due_diligence' ? 'bg-blue-100 text-blue-800' : 
                        deal.status === 'closing' ? 'bg-green-100 text-green-800' : 
                        'bg-gray-100 text-gray-800'
                    }">${deal.status.replace('_', ' ')}</span>
                </div>
                <p class="text-sm text-gray-600 mb-2">Buyer: ${deal.profiles?.first_name} ${deal.profiles?.last_name}</p>
                <p class="text-sm text-gray-600 mb-3">$${deal.listings?.price?.toLocaleString()}</p>
                <button onclick="sellerDashboard.viewDeal('${deal.id}')" class="text-primary-600 hover:text-primary-700 text-sm">View Deal</button>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Create listing button
        const createListingButton = document.getElementById('create-listing-button');
        if (createListingButton) {
            createListingButton.addEventListener('click', () => this.createListing());
        }

        // Upgrade button
        const upgradeButtons = document.querySelectorAll('[data-upgrade-button]');
        upgradeButtons.forEach(button => {
            button.addEventListener('click', () => this.showUpgradePrompt());
        });
    }

    createListing() {
        window.location.href = '../listings/create.html';
    }

    editListing(listingId) {
        window.location.href = `../listings/edit.html?id=${listingId}`;
    }

    viewListing(listingId) {
        window.location.href = `../marketplace/listing.html?id=${listingId}`;
    }

    viewInquiry(inquiryId) {
        window.location.href = `../inquiries/view.html?id=${inquiryId}`;
    }

    viewDeal(dealId) {
        window.location.href = `../deals/view.html?id=${dealId}`;
    }

    showUpgradePrompt() {
        alert('Upgrade to Pro to access this feature!\n\nPro features include:\n- Unlimited listings\n- Advanced analytics\n- Priority support\n- Express Deal eligibility');
    }

    redirectToLogin() {
        window.location.href = '../auth/login.html';
    }
}

// Initialize seller dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.sellerDashboard = new SellerDashboard();
});
