/**
 * Role-Based Authentication and Access Control System
 * Extends the existing auth service with comprehensive role management
 */

class RoleBasedAuth {
    constructor() {
        this.authService = null;
        this.currentUser = null;
        this.userRoles = [];
        this.permissions = new Map();
        this.roleHierarchy = {
            'super_admin': 100,
            'company_admin': 90,
            'admin': 80,
            'vendor': 70,
            'seller': 60,
            'buyer': 50,
            'blog_editor': 40,
            'blog_contributor': 30,
            'user': 10
        };
        this.init();
    }

    async init() {
        console.log('🔐 Initializing Role-Based Authentication...');
        
        // Wait for auth service to be available
        await this.waitForAuthService();
        
        // Load current user and roles
        await this.loadCurrentUserRoles();
        
        // Initialize permissions
        this.initializePermissions();
        
        console.log('✅ Role-Based Authentication initialized');
    }

    async waitForAuthService(maxWait = 10000) {
        const startTime = Date.now();
        while (!window.simpleAuthService && (Date.now() - startTime) < maxWait) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        if (!window.simpleAuthService) {
            throw new Error('Auth service not available');
        }
        this.authService = window.simpleAuthService;
    }

    async loadCurrentUserRoles() {
        try {
            this.currentUser = this.authService.getCurrentUser();
            
            if (!this.currentUser) {
                console.log('❌ No authenticated user found');
                return;
            }

            // Get user roles from the current user data
            this.userRoles = this.currentUser.userTypes || [];
            console.log('🎭 User roles loaded:', this.userRoles);

            // If we have Supabase access, refresh roles from database
            if (this.authService.supabase) {
                await this.refreshRolesFromDatabase();
            }

        } catch (error) {
            console.error('❌ Failed to load user roles:', error);
        }
    }

    async refreshRolesFromDatabase() {
        try {
            if (!this.currentUser?.id || !this.authService.supabase) {
                return;
            }

            const { data: userRoles, error } = await this.authService.supabase
                .from('user_roles')
                .select(`
                    role_id,
                    is_active,
                    roles (
                        name,
                        slug,
                        permissions
                    )
                `)
                .eq('user_id', this.currentUser.id)
                .eq('is_active', true);

            if (error) {
                console.error('❌ Failed to refresh roles from database:', error);
                return;
            }

            // Update user roles
            this.userRoles = userRoles?.map(ur => ur.roles.slug) || [];
            
            // Update permissions
            this.updatePermissionsFromRoles(userRoles);
            
            console.log('✅ Roles refreshed from database:', this.userRoles);

        } catch (error) {
            console.error('❌ Error refreshing roles from database:', error);
        }
    }

    updatePermissionsFromRoles(userRoles) {
        this.permissions.clear();
        
        userRoles?.forEach(userRole => {
            const rolePermissions = userRole.roles.permissions || [];
            rolePermissions.forEach(permission => {
                this.permissions.set(permission, true);
            });
        });
    }

    initializePermissions() {
        // Define role-based permissions
        const rolePermissions = {
            'super_admin': [
                'admin.users.create', 'admin.users.read', 'admin.users.update', 'admin.users.delete',
                'admin.roles.manage', 'admin.system.configure', 'admin.analytics.view',
                'seller.listings.manage', 'buyer.search.advanced', 'vendor.services.manage'
            ],
            'company_admin': [
                'admin.users.read', 'admin.users.update', 'admin.analytics.view',
                'seller.listings.manage', 'buyer.search.advanced', 'vendor.services.manage'
            ],
            'admin': [
                'admin.users.read', 'admin.analytics.view',
                'seller.listings.manage', 'buyer.search.advanced'
            ],
            'vendor': [
                'vendor.services.manage', 'vendor.profile.manage', 'vendor.analytics.view',
                'vendor.clients.manage', 'vendor.documents.manage'
            ],
            'seller': [
                'seller.listings.create', 'seller.listings.update', 'seller.listings.delete',
                'seller.inquiries.manage', 'seller.deals.manage', 'seller.analytics.view',
                'seller.documents.manage', 'seller.profile.manage'
            ],
            'buyer': [
                'buyer.search.basic', 'buyer.listings.save', 'buyer.inquiries.create',
                'buyer.deals.view', 'buyer.profile.manage'
            ],
            'blog_editor': [
                'blog.posts.create', 'blog.posts.update', 'blog.posts.delete',
                'blog.posts.publish', 'blog.categories.manage'
            ],
            'blog_contributor': [
                'blog.posts.create', 'blog.posts.update'
            ]
        };

        // Apply permissions based on user roles
        this.userRoles.forEach(role => {
            const permissions = rolePermissions[role] || [];
            permissions.forEach(permission => {
                this.permissions.set(permission, true);
            });
        });
    }

    // Role checking methods
    hasRole(role) {
        return this.userRoles.includes(role);
    }

    hasAnyRole(roles) {
        return roles.some(role => this.hasRole(role));
    }

    hasAllRoles(roles) {
        return roles.every(role => this.hasRole(role));
    }

    // Permission checking methods
    hasPermission(permission) {
        return this.permissions.has(permission);
    }

    hasAnyPermission(permissions) {
        return permissions.some(permission => this.hasPermission(permission));
    }

    hasAllPermissions(permissions) {
        return permissions.every(permission => this.hasPermission(permission));
    }

    // Role hierarchy methods
    getRoleLevel(role) {
        return this.roleHierarchy[role] || 0;
    }

    hasRoleLevel(minimumLevel) {
        const userLevel = Math.max(...this.userRoles.map(role => this.getRoleLevel(role)));
        return userLevel >= minimumLevel;
    }

    // Access control methods
    canAccessDashboard(dashboardType) {
        const dashboardPermissions = {
            'buyer': ['buyer.search.basic'],
            'seller': ['seller.listings.create'],
            'vendor': ['vendor.services.manage'],
            'admin': ['admin.users.read'],
            'super_admin': ['admin.system.configure']
        };

        const requiredPermissions = dashboardPermissions[dashboardType] || [];
        return this.hasAnyPermission(requiredPermissions);
    }

    canAccessFeature(feature) {
        const featurePermissions = {
            'express_listings': ['seller.listings.create', 'buyer.search.basic'],
            'advanced_search': ['buyer.search.advanced'],
            'listing_management': ['seller.listings.create'],
            'deal_pipeline': ['seller.deals.manage', 'buyer.deals.view'],
            'user_management': ['admin.users.read'],
            'analytics': ['seller.analytics.view', 'vendor.analytics.view', 'admin.analytics.view'],
            'blog_management': ['blog.posts.create'],
            'vendor_services': ['vendor.services.manage']
        };

        const requiredPermissions = featurePermissions[feature] || [];
        return this.hasAnyPermission(requiredPermissions);
    }

    // UI helper methods
    showElementsForRole(role) {
        const elements = document.querySelectorAll(`[data-role="${role}"]`);
        elements.forEach(el => {
            el.style.display = this.hasRole(role) ? 'block' : 'none';
        });
    }

    showElementsForPermission(permission) {
        const elements = document.querySelectorAll(`[data-permission="${permission}"]`);
        elements.forEach(el => {
            el.style.display = this.hasPermission(permission) ? 'block' : 'none';
        });
    }

    hideElementsForRole(role) {
        const elements = document.querySelectorAll(`[data-hide-role="${role}"]`);
        elements.forEach(el => {
            el.style.display = this.hasRole(role) ? 'none' : 'block';
        });
    }

    applyRoleBasedVisibility() {
        // Show/hide elements based on roles
        Object.keys(this.roleHierarchy).forEach(role => {
            this.showElementsForRole(role);
            this.hideElementsForRole(role);
        });

        // Show/hide elements based on permissions
        this.permissions.forEach((hasPermission, permission) => {
            this.showElementsForPermission(permission);
        });

        // Handle pro features
        const isProUser = this.hasRole('seller') && this.currentUser?.profile?.subscription_status === 'active';
        const proElements = document.querySelectorAll('[data-pro-feature]');
        proElements.forEach(el => {
            if (isProUser) {
                el.classList.remove('opacity-50', 'pointer-events-none');
            } else {
                el.classList.add('opacity-50', 'pointer-events-none');
            }
        });
    }

    // Navigation and routing
    getAuthorizedDashboardUrl() {
        if (this.hasRole('super_admin')) {
            return '../dashboard/super-admin-dashboard.html';
        } else if (this.hasRole('company_admin')) {
            return '../dashboard/admin-dashboard.html';
        } else if (this.hasRole('seller')) {
            return '../portals/seller-portal.html';
        } else if (this.hasRole('buyer')) {
            return '../portals/buyer-portal.html';
        } else if (this.hasRole('vendor')) {
            return '../portals/vendor-portal.html';
        } else if (this.hasRole('blog_editor')) {
            return '../blog/admin/dashboard.html';
        }
        
        // Default to buyer portal
        return '../portals/buyer-portal.html';
    }

    // Security methods
    requireRole(role, redirectUrl = '../auth/login.html') {
        if (!this.hasRole(role)) {
            console.warn(`❌ Access denied: Required role '${role}' not found`);
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }

    requirePermission(permission, redirectUrl = '../auth/login.html') {
        if (!this.hasPermission(permission)) {
            console.warn(`❌ Access denied: Required permission '${permission}' not found`);
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }

    requireAuthentication(redirectUrl = '../auth/login.html') {
        if (!this.authService.isAuthenticated()) {
            console.warn('❌ Access denied: User not authenticated');
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }

    // Utility methods
    getUserRoles() {
        return [...this.userRoles];
    }

    getUserPermissions() {
        return Array.from(this.permissions.keys());
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isMultiRole() {
        return this.userRoles.length > 1;
    }

    getPrimaryRole() {
        if (this.userRoles.length === 0) return null;
        if (this.userRoles.length === 1) return this.userRoles[0];
        
        // Return highest priority role
        return this.userRoles.reduce((highest, current) => {
            return this.getRoleLevel(current) > this.getRoleLevel(highest) ? current : highest;
        });
    }
}

// Initialize role-based auth when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        window.roleBasedAuth = new RoleBasedAuth();
        console.log('✅ Role-based authentication system initialized');
    } catch (error) {
        console.error('❌ Failed to initialize role-based authentication:', error);
    }
});
