/**
 * Sidebar Navigation Integration for Buyer Dashboard
 * Handles navigation functionality, user context, and active states
 * Integrates with Supabase for user data and session management
 */

console.log('🧭 Loading Sidebar Navigation Integration...');

/**
 * Sidebar Navigation Integration Service
 * Manages sidebar navigation, user context, and page states
 */
const SidebarNavigationIntegration = {
    // Service instances
    supabaseClient: null,
    currentUser: null,
    userProfile: null,
    isInitialized: false,
    
    // Navigation state
    currentPage: null,
    sidebarOpen: false,
    
    // Mobile breakpoint
    mobileBreakpoint: 1024,

    /**
     * Initialize the sidebar navigation integration
     */
    async init() {
        try {
            console.log('🔄 Initializing Sidebar Navigation Integration...');
            
            // Get Supabase client from global or buyer dashboard integration
            if (window.BuyerDashboardSupabase && window.BuyerDashboardSupabase.supabaseClient) {
                this.supabaseClient = window.BuyerDashboardSupabase.supabaseClient;
                this.currentUser = window.BuyerDashboardSupabase.currentUser;
                this.userProfile = window.BuyerDashboardSupabase.userProfile;
            } else if (window.supabase) {
                this.supabaseClient = window.supabase;
                const { data: { user }, error } = await this.supabaseClient.auth.getUser();
                if (!error && user) {
                    this.currentUser = user;
                    await this.loadUserProfile();
                }
            }

            // Setup navigation functionality
            this.setupNavigationEvents();
            this.setupMobileToggle();
            this.detectCurrentPage();
            this.updateActiveStates();
            
            // Update user context in sidebar
            if (this.currentUser) {
                this.updateUserContext();
            }
            
            this.isInitialized = true;
            console.log('✅ Sidebar Navigation Integration initialized');
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Sidebar Navigation Integration:', error);
            return false;
        }
    },

    /**
     * Load user profile from database
     */
    async loadUserProfile() {
        try {
            const { data, error } = await this.supabaseClient
                .from('profiles')
                .select(`
                    *,
                    user_subscriptions (
                        status,
                        subscription_tiers (
                            name,
                            slug,
                            features,
                            limits
                        )
                    )
                `)
                .eq('user_id', this.currentUser.id)
                .single();

            if (error) throw error;
            this.userProfile = data;
        } catch (error) {
            console.error('❌ Error loading user profile for navigation:', error);
        }
    },

    /**
     * Setup navigation event listeners
     */
    setupNavigationEvents() {
        // Handle navigation clicks
        const navItems = document.querySelectorAll('.dashboard-nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                // Only handle hash-based navigation, let regular links work normally
                const href = item.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    this.navigateToSection(href.substring(1));
                }
            });
        });

        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            this.detectCurrentPage();
            this.updateActiveStates();
        });

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.updateActiveStates();
            }
        });
    },

    /**
     * Setup mobile sidebar toggle functionality
     */
    setupMobileToggle() {
        const toggleButton = document.getElementById('mobile-sidebar-toggle');
        const sidebar = document.getElementById('dashboard-sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        if (!toggleButton || !sidebar || !overlay) return;

        // Toggle sidebar on button click
        toggleButton.addEventListener('click', () => {
            this.toggleMobileSidebar();
        });

        // Close sidebar when clicking overlay
        overlay.addEventListener('click', () => {
            this.closeMobileSidebar();
        });

        // Close sidebar on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.sidebarOpen) {
                this.closeMobileSidebar();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth >= this.mobileBreakpoint) {
                this.closeMobileSidebar();
            }
        });
    },

    /**
     * Toggle mobile sidebar
     */
    toggleMobileSidebar() {
        if (this.sidebarOpen) {
            this.closeMobileSidebar();
        } else {
            this.openMobileSidebar();
        }
    },

    /**
     * Open mobile sidebar
     */
    openMobileSidebar() {
        const sidebar = document.getElementById('dashboard-sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        const toggleButton = document.getElementById('mobile-sidebar-toggle');

        if (sidebar) sidebar.classList.add('mobile-open');
        if (overlay) {
            overlay.classList.remove('hidden');
            overlay.classList.add('visible');
        }
        if (toggleButton) {
            toggleButton.classList.add('open');
            toggleButton.setAttribute('aria-expanded', 'true');
        }

        this.sidebarOpen = true;
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    },

    /**
     * Close mobile sidebar
     */
    closeMobileSidebar() {
        const sidebar = document.getElementById('dashboard-sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        const toggleButton = document.getElementById('mobile-sidebar-toggle');

        if (sidebar) sidebar.classList.remove('mobile-open');
        if (overlay) {
            overlay.classList.add('hidden');
            overlay.classList.remove('visible');
        }
        if (toggleButton) {
            toggleButton.classList.remove('open');
            toggleButton.setAttribute('aria-expanded', 'false');
        }

        this.sidebarOpen = false;
        document.body.style.overflow = ''; // Restore scrolling
    },

    /**
     * Detect current page from URL
     */
    detectCurrentPage() {
        const path = window.location.pathname;
        const hash = window.location.hash;

        // Determine current page/section
        if (path.includes('buyer-dashboard.html')) {
            this.currentPage = hash ? hash.substring(1) : 'overview';
        } else if (path.includes('buyer-profile.html')) {
            this.currentPage = 'profile';
        } else if (path.includes('buyer-settings.html')) {
            this.currentPage = 'settings';
        } else if (path.includes('listings.html')) {
            this.currentPage = 'express-listings';
        } else if (path.includes('chat')) {
            this.currentPage = 'chat';
        } else {
            this.currentPage = 'overview';
        }

        console.log('📍 Current page detected:', this.currentPage);
    },

    /**
     * Update active states for navigation items
     */
    updateActiveStates() {
        const navItems = document.querySelectorAll('.dashboard-nav-item');
        
        navItems.forEach(item => {
            item.classList.remove('active');
            
            const href = item.getAttribute('href');
            const dataSection = item.getAttribute('data-section');
            
            // Check if this nav item should be active
            let isActive = false;
            
            if (dataSection === this.currentPage) {
                isActive = true;
            } else if (href) {
                if (href.includes('buyer-dashboard.html') && this.currentPage === 'overview') {
                    isActive = true;
                } else if (href.includes('buyer-profile.html') && this.currentPage === 'profile') {
                    isActive = true;
                } else if (href.includes('buyer-settings.html') && this.currentPage === 'settings') {
                    isActive = true;
                } else if (href.includes('listings.html') && this.currentPage === 'express-listings') {
                    isActive = true;
                } else if (href.includes('chat') && this.currentPage === 'chat') {
                    isActive = true;
                }
            }
            
            if (isActive) {
                item.classList.add('active');
                item.setAttribute('aria-current', 'page');
            } else {
                item.removeAttribute('aria-current');
            }
        });
    },

    /**
     * Navigate to a specific section (for hash-based navigation)
     */
    navigateToSection(sectionId) {
        // Update URL hash
        window.history.pushState(null, null, `#${sectionId}`);
        
        // Update current page
        this.currentPage = sectionId;
        
        // Update active states
        this.updateActiveStates();
        
        // Close mobile sidebar if open
        if (this.sidebarOpen) {
            this.closeMobileSidebar();
        }
        
        // Trigger section change event for dashboard
        document.dispatchEvent(new CustomEvent('sectionChange', {
            detail: { section: sectionId }
        }));
        
        console.log('🧭 Navigated to section:', sectionId);
    },

    /**
     * Update user context in sidebar
     */
    updateUserContext() {
        try {
            // Update user name in sidebar
            const sidebarUserName = document.getElementById('sidebar-user-name');
            if (sidebarUserName && this.userProfile) {
                const fullName = `${this.userProfile.first_name || ''} ${this.userProfile.last_name || ''}`.trim();
                sidebarUserName.textContent = fullName || this.currentUser.email || 'User';
            }

            // Update subscription status if available
            const subscriptionElement = document.getElementById('subscription-tier');
            if (subscriptionElement && this.userProfile?.user_subscriptions?.[0]) {
                const subscription = this.userProfile.user_subscriptions[0];
                subscriptionElement.textContent = subscription.subscription_tiers?.name || 'Free';
            }

            // Update unread chat badge if available
            if (window.EnhancedChatIntegration) {
                this.updateUnreadChatBadge();
            }

            console.log('✅ User context updated in sidebar');
        } catch (error) {
            console.error('❌ Error updating user context:', error);
        }
    },

    /**
     * Update unread chat badge
     */
    async updateUnreadChatBadge() {
        try {
            if (!window.EnhancedChatIntegration || !window.EnhancedChatIntegration.isInitialized) {
                return;
            }

            const unreadCount = window.EnhancedChatIntegration.unreadCount || 0;
            const badge = document.getElementById('unread-chat-badge');
            
            if (badge) {
                badge.textContent = unreadCount;
                badge.style.display = unreadCount > 0 ? 'block' : 'none';
            }
        } catch (error) {
            console.error('❌ Error updating unread chat badge:', error);
        }
    },

    /**
     * Handle authentication state changes
     */
    handleAuthStateChange(user) {
        this.currentUser = user;
        
        if (user) {
            this.loadUserProfile().then(() => {
                this.updateUserContext();
            });
        } else {
            // Handle logout - redirect to login
            window.location.href = '../auth/login.html';
        }
    },

    /**
     * Get current user subscription tier
     */
    getCurrentSubscriptionTier() {
        if (!this.userProfile?.user_subscriptions?.[0]) {
            return 'free';
        }
        
        return this.userProfile.user_subscriptions[0].subscription_tiers?.slug || 'free';
    },

    /**
     * Check if user has access to a feature
     */
    hasFeatureAccess(feature) {
        const tier = this.getCurrentSubscriptionTier();
        
        // Define feature access by tier
        const featureAccess = {
            free: ['basic_messaging', 'limited_listings'],
            pro: ['basic_messaging', 'unlimited_listings', 'advanced_search', 'priority_support'],
            enterprise: ['all_features']
        };
        
        return featureAccess[tier]?.includes(feature) || featureAccess[tier]?.includes('all_features');
    },

    /**
     * Show upgrade prompt for premium features
     */
    showUpgradePrompt(feature) {
        // Create upgrade prompt modal or notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-primary text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-sm';
        notification.innerHTML = `
            <div class="flex items-start space-x-3">
                <svg class="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                <div>
                    <h4 class="font-medium">Upgrade Required</h4>
                    <p class="text-sm opacity-90 mt-1">This feature requires a Pro subscription.</p>
                    <div class="mt-3 flex space-x-2">
                        <button onclick="window.location.href='./buyer-settings.html#subscription'" class="bg-white text-primary px-3 py-1 rounded text-sm font-medium hover:bg-slate-100 transition-colors">
                            Upgrade Now
                        </button>
                        <button onclick="this.parentElement.parentElement.parentElement.remove()" class="text-white/70 hover:text-white text-sm">
                            Dismiss
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            notification.remove();
        }, 10000);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const initialized = await SidebarNavigationIntegration.init();
        if (initialized) {
            console.log('✅ Sidebar Navigation Integration ready');
        }
    } catch (error) {
        console.error('❌ Failed to initialize Sidebar Navigation Integration:', error);
    }
});

// Listen for authentication state changes
document.addEventListener('authenticationSuccess', (event) => {
    SidebarNavigationIntegration.handleAuthStateChange(event.detail.user);
});

document.addEventListener('authenticationFailed', () => {
    SidebarNavigationIntegration.handleAuthStateChange(null);
});

// Listen for chat updates to update badge
document.addEventListener('chatUnreadCountUpdated', (event) => {
    SidebarNavigationIntegration.updateUnreadChatBadge();
});

// Make available globally
window.SidebarNavigationIntegration = SidebarNavigationIntegration;
