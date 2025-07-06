/**
 * Route Protection System for Ardonie Capital
 * Protects sensitive pages and enforces authentication
 */

class RouteGuard {
    constructor() {
        this.protectedRoutes = [
            '/dashboard/',
            '/portals/',
            '/admin/',
            '/profile/',
            '/settings/'
        ];
        
        this.publicRoutes = [
            '/auth/',
            '/index.html',
            '/about.html',
            '/contact.html',
            '/how-it-works.html',
            '/for-buyers.html',
            '/for-sellers.html',
            '/partner-with-us.html',
            '/documents/',
            '/tools/',
            '/funding/',
            '/education/',
            '/marketplace/',
            '/matchmaking/',
            '/privacy-policy.html',
            '/terms-of-service.html',
            '/cookie-policy.html'
        ];

        this.roleBasedAccess = {
            'buyer': [
                '/dashboard/buyer-dashboard.html',
                '/portals/buyer-portal.html',
                '/marketplace/',
                '/funding/',
                '/tools/'
            ],
            'seller': [
                '/dashboard/seller-dashboard.html',
                '/portals/seller-portal.html',
                '/marketplace/',
                '/tools/'
            ],
            'accountant': [
                '/portals/accountant-portal.html',
                '/dashboard/accountant-dashboard.html'
            ],
            'attorney': [
                '/portals/attorney-portal.html',
                '/dashboard/attorney-dashboard.html'
            ],
            'lender': [
                '/portals/lender-portal.html',
                '/dashboard/lender-dashboard.html'
            ],
            'admin': [
                '/dashboard/',
                '/portals/',
                '/admin/'
            ]
        };

        this.init();
    }

    /**
     * Initialize route protection
     */
    init() {
        // Check current route on page load
        this.checkCurrentRoute();
        
        // Monitor navigation changes
        this.setupNavigationMonitoring();
        
        // Add click handlers to protected links
        this.protectLinks();
    }

    /**
     * Check if current route requires authentication
     */
    checkCurrentRoute() {
        const currentPath = window.location.pathname;
        
        if (this.isProtectedRoute(currentPath)) {
            if (!window.AuthService.isAuthenticated()) {
                this.redirectToLogin(currentPath);
                return false;
            }
            
            // Check role-based access
            const user = window.AuthService.getCurrentUser();
            if (!this.hasRoleAccess(user.role, currentPath)) {
                this.redirectToUnauthorized();
                return false;
            }
        }
        
        return true;
    }

    /**
     * Check if route is protected
     */
    isProtectedRoute(path) {
        return this.protectedRoutes.some(route => path.startsWith(route));
    }

    /**
     * Check if route is public
     */
    isPublicRoute(path) {
        // Root path is public
        if (path === '/' || path === '') {
            return true;
        }
        
        return this.publicRoutes.some(route => {
            if (route.endsWith('/')) {
                return path.startsWith(route);
            }
            return path === route || path.startsWith(route + '?') || path.startsWith(route + '#');
        });
    }

    /**
     * Check role-based access
     */
    hasRoleAccess(userRole, path) {
        if (!userRole) return false;
        
        // Admin has access to everything
        if (userRole === 'admin') return true;
        
        const allowedPaths = this.roleBasedAccess[userRole] || [];
        return allowedPaths.some(allowedPath => {
            if (allowedPath.endsWith('/')) {
                return path.startsWith(allowedPath);
            }
            return path === allowedPath;
        });
    }

    /**
     * Redirect to login with return URL
     */
    redirectToLogin(returnUrl = null) {
        const loginUrl = '/auth/login.html';
        const redirectUrl = returnUrl || window.location.pathname + window.location.search;
        
        // Store return URL for post-login redirect
        sessionStorage.setItem('returnUrl', redirectUrl);
        
        // Show user-friendly message
        this.showAccessMessage('Please log in to access this page.');
        
        // Redirect after short delay
        setTimeout(() => {
            window.location.href = loginUrl;
        }, 1500);
    }

    /**
     * Redirect to unauthorized page
     */
    redirectToUnauthorized() {
        this.showAccessMessage('You do not have permission to access this page.');
        
        // Redirect to appropriate dashboard based on user role
        const user = window.AuthService.getCurrentUser();
        if (user) {
            const redirectUrl = window.AuthService.getRedirectUrl(user.role);
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 2000);
        } else {
            this.redirectToLogin();
        }
    }

    /**
     * Show access message to user
     */
    showAccessMessage(message, type = 'warning') {
        // Create message overlay
        const overlay = document.createElement('div');
        overlay.className = `fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`;
        overlay.innerHTML = `
            <div class="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 max-w-md mx-4">
                <div class="text-center">
                    <div class="mb-4">
                        ${type === 'warning' ? 
                            '<div class="text-yellow-500 text-6xl">⚠️</div>' : 
                            '<div class="text-red-500 text-6xl">🚫</div>'
                        }
                    </div>
                    <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-4">Access Restricted</h3>
                    <p class="text-slate-600 dark:text-slate-300 mb-6">${message}</p>
                    <div class="flex justify-center">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-dark"></div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Remove overlay after redirect
        setTimeout(() => {
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
        }, 3000);
    }

    /**
     * Setup navigation monitoring
     */
    setupNavigationMonitoring() {
        // Monitor popstate events (back/forward navigation)
        window.addEventListener('popstate', () => {
            this.checkCurrentRoute();
        });

        // Monitor pushstate/replacestate (programmatic navigation)
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;
        
        history.pushState = function(...args) {
            originalPushState.apply(history, args);
            setTimeout(() => window.RouteGuard.checkCurrentRoute(), 0);
        };
        
        history.replaceState = function(...args) {
            originalReplaceState.apply(history, args);
            setTimeout(() => window.RouteGuard.checkCurrentRoute(), 0);
        };
    }

    /**
     * Protect links with click handlers
     */
    protectLinks() {
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a');
            if (!link) return;
            
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
                return;
            }
            
            // Check if it's an internal link
            if (href.startsWith('/') || href.startsWith('./') || href.startsWith('../')) {
                const targetPath = this.resolvePath(href);
                
                if (this.isProtectedRoute(targetPath)) {
                    event.preventDefault();
                    
                    if (!window.AuthService.isAuthenticated()) {
                        this.redirectToLogin(targetPath);
                        return;
                    }
                    
                    const user = window.AuthService.getCurrentUser();
                    if (!this.hasRoleAccess(user.role, targetPath)) {
                        this.redirectToUnauthorized();
                        return;
                    }
                    
                    // Allow navigation
                    window.location.href = href;
                }
            }
        });
    }

    /**
     * Resolve relative paths to absolute paths
     */
    resolvePath(href) {
        if (href.startsWith('/')) {
            return href;
        }
        
        const currentPath = window.location.pathname;
        const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
        
        if (href.startsWith('./')) {
            return currentDir + href.substring(2);
        }
        
        if (href.startsWith('../')) {
            const parts = currentDir.split('/').filter(part => part);
            const upLevels = (href.match(/\.\.\//g) || []).length;
            const remainingPath = href.replace(/\.\.\//g, '');
            
            const newParts = parts.slice(0, -upLevels);
            return '/' + newParts.join('/') + (newParts.length > 0 ? '/' : '') + remainingPath;
        }
        
        return currentDir + href;
    }

    /**
     * Add route protection to specific element
     */
    protectElement(element, requiredRole = null) {
        if (!element) return;
        
        const checkAccess = () => {
            if (!window.AuthService.isAuthenticated()) {
                element.style.display = 'none';
                return;
            }
            
            if (requiredRole) {
                const user = window.AuthService.getCurrentUser();
                if (user.role !== requiredRole && user.role !== 'admin') {
                    element.style.display = 'none';
                    return;
                }
            }
            
            element.style.display = '';
        };
        
        checkAccess();
        
        // Re-check on auth state changes
        document.addEventListener('authStateChanged', checkAccess);
    }

    /**
     * Get user's accessible routes
     */
    getAccessibleRoutes(userRole) {
        if (!userRole) return this.publicRoutes;
        
        const accessible = [...this.publicRoutes];
        
        if (this.roleBasedAccess[userRole]) {
            accessible.push(...this.roleBasedAccess[userRole]);
        }
        
        return accessible;
    }

    /**
     * Check if user can access specific feature
     */
    canAccessFeature(feature, userRole = null) {
        if (!userRole) {
            const user = window.AuthService.getCurrentUser();
            userRole = user ? user.role : null;
        }
        
        if (!userRole) return false;
        if (userRole === 'admin') return true;
        
        const featureAccess = {
            'financial-tools': ['buyer', 'seller', 'lender'],
            'marketplace': ['buyer', 'seller'],
            'vendor-portal': ['accountant', 'attorney', 'lender'],
            'admin-panel': ['admin'],
            'user-management': ['admin'],
            'financial-reports': ['admin', 'accountant'],
            'legal-documents': ['admin', 'attorney'],
            'loan-processing': ['admin', 'lender']
        };
        
        return featureAccess[feature] ? featureAccess[feature].includes(userRole) : false;
    }
}

// Initialize global route guard
window.RouteGuard = new RouteGuard();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RouteGuard;
}
