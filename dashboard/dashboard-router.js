/**
 * Multi-Role Dashboard Router
 * Intelligent routing system for multi-role users
 * Handles role selection, dashboard redirection, and role switching
 */

import { enhancedAuthService } from '../src/features/authentication/services/enhanced-auth.service.js';

class DashboardRouter {
    constructor() {
        this.currentUser = null;
        this.isInitialized = false;
        this.routeMap = {
            // Primary role dashboards
            'buyer': '/dashboard/enhanced-buyer-dashboard.html',
            'seller': '/dashboard/seller-dashboard.html',
            'vendor': '/dashboard/vendor-dashboard.html',
            
            // Professional role dashboards
            'financial_professional': '/dashboard/vendor-dashboard.html',
            'legal_professional': '/dashboard/vendor-dashboard.html',
            
            // Administrative dashboards
            'super_admin': '/dashboard/super-admin-dashboard.html',
            'company_admin': '/dashboard/admin-dashboard.html',
            
            // Content management dashboards
            'blog_editor': '/dashboard/content-management.html',
            'blog_contributor': '/dashboard/content-management.html',
            
            // Legacy compatibility
            'admin': '/dashboard/super-admin-dashboard.html'
        };
        
        this.defaultRoute = '/dashboard/enhanced-buyer-dashboard.html';
        this.roleSelectionRoute = '/dashboard/enhanced-role-selection.html';
        this.loginRoute = '/auth/login.html';
    }

    /**
     * Initialize the router
     */
    async init() {
        try {
            console.log('🔄 Initializing Dashboard Router...');
            
            // Initialize auth service
            if (!enhancedAuthService.isInitialized) {
                await enhancedAuthService.init();
            }
            
            // Get current user
            this.currentUser = await enhancedAuthService.getCurrentUser();
            
            this.isInitialized = true;
            console.log('✅ Dashboard Router initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize Dashboard Router:', error);
            throw error;
        }
    }

    /**
     * Route user to appropriate dashboard
     */
    async route() {
        try {
            if (!this.isInitialized) {
                await this.init();
            }

            // Check if user is authenticated
            if (!this.currentUser) {
                console.log('❌ No authenticated user, redirecting to login');
                this.redirectTo(this.loginRoute);
                return;
            }

            console.log('🎯 Routing user:', this.currentUser.email);
            console.log('👤 User roles:', this.currentUser.roles?.length || 0);
            console.log('🎭 Selected role:', this.currentUser.selectedRole);

            // Determine routing strategy
            const routingDecision = this.determineRoutingStrategy();
            
            console.log('🔄 Routing decision:', routingDecision.strategy);
            
            switch (routingDecision.strategy) {
                case 'direct_redirect':
                    this.redirectToDashboard(routingDecision.role);
                    break;
                    
                case 'role_selection':
                    this.redirectTo(this.roleSelectionRoute);
                    break;
                    
                case 'no_roles':
                    this.handleNoRoles();
                    break;
                    
                case 'error':
                    this.handleError(routingDecision.message);
                    break;
                    
                default:
                    console.warn('⚠️ Unknown routing strategy, using default');
                    this.redirectTo(this.defaultRoute);
            }
            
        } catch (error) {
            console.error('❌ Routing error:', error);
            this.handleError('Failed to route to dashboard. Please try again.');
        }
    }

    /**
     * Determine the appropriate routing strategy
     */
    determineRoutingStrategy() {
        // Handle users with no roles
        if (!this.currentUser.roles || this.currentUser.roles.length === 0) {
            // Check for legacy role in profile
            if (this.currentUser.profile?.role) {
                return {
                    strategy: 'direct_redirect',
                    role: this.currentUser.profile.role,
                    reason: 'legacy_role'
                };
            }
            
            return {
                strategy: 'no_roles',
                reason: 'no_roles_assigned'
            };
        }

        // Single role - direct redirect
        if (this.currentUser.roles.length === 1) {
            const role = this.currentUser.roles[0];
            const roleSlug = role.roles?.slug || role.slug;
            
            return {
                strategy: 'direct_redirect',
                role: roleSlug,
                reason: 'single_role'
            };
        }

        // Multiple roles - check if user has already selected a role
        if (this.currentUser.selectedRole) {
            // Verify the selected role is still valid
            const hasSelectedRole = this.currentUser.roles.some(ur => {
                const role = ur.roles || ur;
                return role.slug === this.currentUser.selectedRole;
            });
            
            if (hasSelectedRole) {
                return {
                    strategy: 'direct_redirect',
                    role: this.currentUser.selectedRole,
                    reason: 'selected_role_valid'
                };
            } else {
                console.warn('⚠️ Selected role is no longer valid, requiring new selection');
                // Clear invalid selected role
                localStorage.removeItem('ardonie_active_role');
            }
        }

        // Multiple roles without selection - show role selection
        return {
            strategy: 'role_selection',
            roles: this.currentUser.roles,
            reason: 'multiple_roles_no_selection'
        };
    }

    /**
     * Redirect to specific dashboard based on role
     */
    redirectToDashboard(roleSlug) {
        const dashboardUrl = this.routeMap[roleSlug] || this.defaultRoute;
        
        console.log(`🔄 Redirecting to ${roleSlug} dashboard:`, dashboardUrl);
        
        // Set active role if not already set
        if (!this.currentUser.selectedRole) {
            enhancedAuthService.setActiveRole(this.currentUser.id, roleSlug);
        }
        
        this.redirectTo(dashboardUrl);
    }

    /**
     * Handle users with no roles
     */
    handleNoRoles() {
        console.log('⚠️ User has no roles assigned');
        
        // Create a simple page to inform user
        document.body.innerHTML = `
            <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div class="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                    <div class="text-6xl mb-4">🚫</div>
                    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Roles Assigned</h1>
                    <p class="text-gray-600 dark:text-gray-400 mb-6">
                        Your account doesn't have any roles assigned. Please contact your administrator to assign appropriate roles.
                    </p>
                    <div class="space-y-3">
                        <button onclick="location.href='mailto:admin@ardoniecapital.com'" 
                                class="w-full bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors">
                            Contact Administrator
                        </button>
                        <button onclick="location.href='/auth/login.html'" 
                                class="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors">
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Handle routing errors
     */
    handleError(message) {
        console.error('🚨 Dashboard routing error:', message);
        
        document.body.innerHTML = `
            <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div class="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                    <div class="text-6xl mb-4">⚠️</div>
                    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Dashboard Error</h1>
                    <p class="text-gray-600 dark:text-gray-400 mb-6">${message}</p>
                    <div class="space-y-3">
                        <button onclick="location.reload()" 
                                class="w-full bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors">
                            Try Again
                        </button>
                        <button onclick="location.href='/auth/login.html'" 
                                class="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors">
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Redirect to URL
     */
    redirectTo(url) {
        console.log('🔄 Redirecting to:', url);
        
        // Add a small delay to ensure any pending operations complete
        setTimeout(() => {
            window.location.href = url;
        }, 100);
    }

    /**
     * Switch user role
     */
    async switchRole(newRoleSlug) {
        try {
            console.log('🔄 Switching to role:', newRoleSlug);
            
            // Verify user has this role
            const hasRole = this.currentUser.roles.some(ur => {
                const role = ur.roles || ur;
                return role.slug === newRoleSlug;
            });
            
            if (!hasRole) {
                throw new Error('User does not have access to this role');
            }
            
            // Set active role
            await enhancedAuthService.setActiveRole(this.currentUser.id, newRoleSlug);
            
            // Redirect to appropriate dashboard
            this.redirectToDashboard(newRoleSlug);
            
        } catch (error) {
            console.error('❌ Error switching role:', error);
            throw error;
        }
    }

    /**
     * Get available roles for current user
     */
    getAvailableRoles() {
        if (!this.currentUser || !this.currentUser.roles) {
            return [];
        }
        
        return this.currentUser.roles.map(ur => {
            const role = ur.roles || ur;
            return {
                slug: role.slug,
                name: role.name,
                description: role.description,
                category: role.category,
                dashboardUrl: this.routeMap[role.slug] || this.defaultRoute
            };
        });
    }

    /**
     * Check if current page matches user's role
     */
    validateCurrentPage() {
        const currentPath = window.location.pathname;
        const selectedRole = this.currentUser?.selectedRole;
        
        if (!selectedRole) {
            return false;
        }
        
        const expectedPath = this.routeMap[selectedRole];
        return currentPath === expectedPath;
    }

    /**
     * Get role display information
     */
    getRoleInfo(roleSlug) {
        const roleInfoMap = {
            'buyer': {
                name: 'Buyer',
                icon: '🏢',
                color: 'blue',
                description: 'Browse and purchase auto repair businesses'
            },
            'seller': {
                name: 'Seller',
                icon: '💼',
                color: 'green',
                description: 'List and sell your auto repair business'
            },
            'vendor': {
                name: 'Vendor',
                icon: '🤝',
                color: 'purple',
                description: 'Provide professional services'
            },
            'financial_professional': {
                name: 'Financial Professional',
                icon: '📊',
                color: 'yellow',
                description: 'Business brokers, CPAs, financial advisors'
            },
            'legal_professional': {
                name: 'Legal Professional',
                icon: '⚖️',
                color: 'red',
                description: 'Business attorneys, tax professionals'
            },
            'super_admin': {
                name: 'Super Admin',
                icon: '👑',
                color: 'indigo',
                description: 'Full platform access and management'
            },
            'company_admin': {
                name: 'Company Admin',
                icon: '🏛️',
                color: 'gray',
                description: 'Manage company users and settings'
            },
            'blog_editor': {
                name: 'Blog Editor',
                icon: '✍️',
                color: 'pink',
                description: 'Create and publish blog content'
            },
            'blog_contributor': {
                name: 'Blog Contributor',
                icon: '📝',
                color: 'orange',
                description: 'Write and edit blog content'
            }
        };

        return roleInfoMap[roleSlug] || {
            name: roleSlug,
            icon: '👤',
            color: 'gray',
            description: 'Platform access'
        };
    }
}

// Create and export singleton instance
export const dashboardRouter = new DashboardRouter();

// Auto-route when script loads (for direct dashboard access)
if (window.location.pathname.includes('/dashboard/') && !window.location.pathname.includes('role-selection')) {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🎯 Auto-routing from dashboard page...');
        dashboardRouter.route();
    });
}

// Global access for debugging
window.dashboardRouter = dashboardRouter;

console.log('✅ Dashboard Router loaded');
