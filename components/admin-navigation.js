// Ardonie Capital - Admin Navigation Component
// Secondary navigation bar for privileged users (Company Admin, Super Admin)
// Appears below main navigation when admin users are authenticated

window.ArdonieAdminNavigation = {
    template: `
<nav class="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 shadow-lg" 
     role="navigation" 
     aria-label="Admin navigation"
     id="admin-navigation-bar"
     style="display: none;">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-12">
            <!-- Admin Badge -->
            <div class="flex items-center space-x-3">
                <div class="flex items-center space-x-2">
                    <svg class="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L3 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.734.99A.996.996 0 0118 6v2a1 1 0 11-2 0v-.277l-1.254.145a1 1 0 11-.992-1.736L14.984 6l-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.723V12a1 1 0 11-2 0v-1.277l-1.246-.855a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.277l1.246.855a1 1 0 11-.992 1.736l-1.75-1A1 1 0 012 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1 1 0 01-.504.868l-1.75 1a1 1 0 11-.992-1.736L16 13.277V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364-.372l.254.145V16a1 1 0 112 0v.277l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-1.022 0l-1.735-.992a1 1 0 01-.372-1.364z" clip-rule="evenodd"></path>
                    </svg>
                    <span class="text-amber-400 text-sm font-semibold">Admin Panel</span>
                </div>
                <div class="h-4 w-px bg-slate-600"></div>
                <span class="text-slate-300 text-xs" id="admin-role-display">Loading...</span>
            </div>

            <!-- Desktop Admin Navigation Links -->
            <div class="hidden lg:flex lg:items-center lg:space-x-1">
                <!-- User Management -->
                <a href="/dashboard/admin-dashboard.html" 
                   class="text-slate-300 hover:text-white hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                    </svg>
                    <span>User Management</span>
                </a>

                <!-- Content Management -->
                <a href="/dashboard/content-management.html" 
                   class="text-slate-300 hover:text-white hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    <span>CMS</span>
                </a>

                <!-- Analytics -->
                <a href="/dashboard/analytics-dashboard.html" 
                   class="text-slate-300 hover:text-white hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                    <span>Analytics</span>
                </a>

                <!-- System Settings -->
                <a href="/dashboard/system-settings.html" 
                   class="text-slate-300 hover:text-white hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span>Settings</span>
                </a>

                <!-- Reports -->
                <a href="/dashboard/reports-dashboard.html" 
                   class="text-slate-300 hover:text-white hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <span>Reports</span>
                </a>
            </div>

            <!-- Mobile Admin Menu Button -->
            <div class="lg:hidden">
                <button type="button" 
                        class="text-slate-300 hover:text-white hover:bg-slate-700 p-2 rounded-md transition-colors duration-200"
                        aria-controls="mobile-admin-menu" 
                        aria-expanded="false"
                        id="mobile-admin-menu-button">
                    <span class="sr-only">Open admin menu</span>
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
            </div>
        </div>

        <!-- Mobile Admin Menu -->
        <div class="lg:hidden hidden" id="mobile-admin-menu">
            <div class="px-2 pt-2 pb-3 space-y-1 border-t border-slate-700">
                <a href="/dashboard/admin-dashboard.html" 
                   class="text-slate-300 hover:text-white hover:bg-slate-700 block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                    👥 User Management
                </a>
                <a href="/dashboard/content-management.html" 
                   class="text-slate-300 hover:text-white hover:bg-slate-700 block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                    📝 Content Management
                </a>
                <a href="/dashboard/analytics-dashboard.html" 
                   class="text-slate-300 hover:text-white hover:bg-slate-700 block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                    📊 Analytics
                </a>
                <a href="/dashboard/system-settings.html" 
                   class="text-slate-300 hover:text-white hover:bg-slate-700 block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                    ⚙️ System Settings
                </a>
                <a href="/dashboard/reports-dashboard.html" 
                   class="text-slate-300 hover:text-white hover:bg-slate-700 block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                    📈 Reports
                </a>
            </div>
        </div>
    </div>
</nav>
    `,

    // Privileged roles that can see admin navigation
    // Note: Only 'admin' role exists in the database enum
    adminRoles: ['admin'],

    // Initialize admin navigation component
    init: function(containerId = 'admin-navigation-container') {
        console.log('🔧 Admin Navigation: Initializing...');
        
        // Create container if it doesn't exist
        let container = document.getElementById(containerId);
        if (!container) {
            // Create admin navigation container after main navigation
            const mainNav = document.querySelector('nav[role="navigation"]') || document.querySelector('#main-navigation-container');
            if (mainNav) {
                container = document.createElement('div');
                container.id = containerId;
                mainNav.parentNode.insertBefore(container, mainNav.nextSibling);
            } else {
                console.error('Admin Navigation: Main navigation not found, cannot position admin nav');
                return;
            }
        }

        if (container) {
            container.innerHTML = this.template;
            this.bindEvents();
            this.updateVisibility();
            this.setupAuthEventListeners();
        } else {
            console.error('Admin Navigation: Container could not be created');
        }
    },

    // Bind event handlers
    bindEvents: function() {
        // Mobile menu toggle
        const mobileMenuButton = document.getElementById('mobile-admin-menu-button');
        const mobileMenu = document.getElementById('mobile-admin-menu');

        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', () => {
                const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
                mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
                mobileMenu.classList.toggle('hidden');
            });
        }

        // Close mobile menu when clicking outside
        document.addEventListener('click', (event) => {
            if (mobileMenu && !mobileMenu.contains(event.target) && !mobileMenuButton.contains(event.target)) {
                mobileMenu.classList.add('hidden');
                mobileMenuButton.setAttribute('aria-expanded', 'false');
            }
        });
    },

    // Setup authentication event listeners
    setupAuthEventListeners: function() {
        console.log('🔗 Admin Navigation: Setting up auth event listeners...');

        // Listen for authentication state changes
        document.addEventListener('authenticationComplete', () => {
            console.log('✅ Admin Navigation: Received authenticationComplete event');
            setTimeout(() => {
                this.updateVisibility();
            }, 100);
        });

        document.addEventListener('authStateChanged', () => {
            console.log('🔄 Admin Navigation: Received authStateChanged event');
            this.updateVisibility();
        });

        // Listen for logout events
        document.addEventListener('userLoggedOut', () => {
            console.log('👋 Admin Navigation: User logged out');
            this.hideAdminNavigation();
        });
    },

    // Check if user has admin privileges
    isAdminUser: function() {
        try {
            const user = this.getCurrentUser();
            if (!user) return false;

            // Check user role
            const userRole = user.role || user.selectedRole;
            console.log('🔍 Admin Navigation: Checking role:', userRole);

            return this.adminRoles.includes(userRole);
        } catch (error) {
            console.error('Admin Navigation: Error checking admin status:', error);
            return false;
        }
    },

    // Get current user from storage
    getCurrentUser: function() {
        try {
            // Try multiple storage locations for compatibility
            const userSession = localStorage.getItem('ardonie_user_session') || sessionStorage.getItem('ardonie_current_user');
            const authStatus = localStorage.getItem('ardonie_auth_status') || sessionStorage.getItem('ardonie_auth_status');

            if (userSession && authStatus === 'authenticated') {
                return JSON.parse(userSession);
            }
            return null;
        } catch (error) {
            console.error('Admin Navigation: Error getting current user:', error);
            return null;
        }
    },

    // Update admin navigation visibility based on user role
    updateVisibility: function() {
        console.log('🔄 Admin Navigation: Updating visibility...');
        
        const adminNav = document.getElementById('admin-navigation-bar');
        if (!adminNav) {
            console.log('❌ Admin Navigation: Navigation bar not found');
            return;
        }

        if (this.isAdminUser()) {
            this.showAdminNavigation();
        } else {
            this.hideAdminNavigation();
        }
    },

    // Show admin navigation
    showAdminNavigation: function() {
        console.log('✅ Admin Navigation: Showing admin navigation');
        
        const adminNav = document.getElementById('admin-navigation-bar');
        const roleDisplay = document.getElementById('admin-role-display');
        
        if (adminNav) {
            adminNav.style.display = 'block';
            
            // Update role display
            if (roleDisplay) {
                const user = this.getCurrentUser();
                const role = user ? (user.role || user.selectedRole) : 'Admin';
                roleDisplay.textContent = role;
            }

            // Adjust main content padding to account for admin nav
            this.adjustMainContentPadding(true);
        }
    },

    // Hide admin navigation
    hideAdminNavigation: function() {
        console.log('❌ Admin Navigation: Hiding admin navigation');
        
        const adminNav = document.getElementById('admin-navigation-bar');
        if (adminNav) {
            adminNav.style.display = 'none';
            
            // Reset main content padding
            this.adjustMainContentPadding(false);
        }
    },

    // Adjust main content padding when admin nav is shown/hidden
    adjustMainContentPadding: function(showAdminNav) {
        const mainContent = document.querySelector('main') || document.querySelector('.main-content') || document.body;
        if (mainContent) {
            if (showAdminNav) {
                // Add extra padding for admin nav (12px height + some spacing)
                mainContent.style.paddingTop = 'calc(4rem + 3rem)'; // 64px main nav + 48px admin nav
            } else {
                // Reset to normal padding
                mainContent.style.paddingTop = '4rem'; // 64px main nav only
            }
        }
    }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Admin Navigation: DOM ready, initializing...');
    if (window.ArdonieAdminNavigation) {
        // Small delay to ensure main navigation is initialized first
        setTimeout(() => {
            window.ArdonieAdminNavigation.init();
        }, 500);
    }
});

// Export for global access
window.AdminNavigation = window.ArdonieAdminNavigation;
