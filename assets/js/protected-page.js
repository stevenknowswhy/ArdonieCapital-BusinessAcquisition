/**
 * Protected Page Template for Ardonie Capital
 * Include this script on any page that requires authentication
 */

(function() {
    'use strict';
    
    // Configuration
    const config = {
        authServicePath: '/assets/js/auth-service.js',
        routeGuardPath: '/assets/js/route-guard.js',
        loginPath: '/auth/login.html',
        unauthorizedRedirectDelay: 2000,
        sessionCheckInterval: 60000 // Check session every minute
    };
    
    // State management
    let scriptsLoaded = false;
    let authCheckComplete = false;
    let currentUser = null;
    
    /**
     * Initialize protected page
     */
    function initProtectedPage() {
        // Show loading state
        showLoadingState();
        
        // Load required scripts
        loadSecurityScripts()
            .then(() => {
                scriptsLoaded = true;
                return checkAuthentication();
            })
            .then((user) => {
                currentUser = user;
                authCheckComplete = true;
                hideLoadingState();
                initializePageFeatures();
                setupSessionMonitoring();
                
                // Dispatch custom event for page-specific initialization
                document.dispatchEvent(new CustomEvent('authenticationComplete', {
                    detail: { user: currentUser }
                }));
            })
            .catch((error) => {
                console.error('Authentication failed:', error);
                handleAuthenticationFailure(error);
            });
    }
    
    /**
     * Load security scripts dynamically
     */
    function loadSecurityScripts() {
        return new Promise((resolve, reject) => {
            const scripts = [
                { src: config.authServicePath, global: 'AuthService' },
                { src: config.routeGuardPath, global: 'RouteGuard' }
            ];
            
            let loadedCount = 0;
            const totalScripts = scripts.length;
            
            scripts.forEach(({ src, global }) => {
                // Check if script is already loaded
                if (window[global]) {
                    loadedCount++;
                    if (loadedCount === totalScripts) {
                        resolve();
                    }
                    return;
                }
                
                const script = document.createElement('script');
                script.src = src;
                script.onload = () => {
                    loadedCount++;
                    if (loadedCount === totalScripts) {
                        resolve();
                    }
                };
                script.onerror = () => {
                    reject(new Error(`Failed to load script: ${src}`));
                };
                document.head.appendChild(script);
            });
        });
    }
    
    /**
     * Check user authentication
     */
    function checkAuthentication() {
        return new Promise((resolve, reject) => {
            try {
                if (!window.AuthService) {
                    throw new Error('AuthService not available');
                }
                
                if (!window.AuthService.isAuthenticated()) {
                    throw new Error('User not authenticated');
                }
                
                const user = window.AuthService.getCurrentUser();
                if (!user) {
                    throw new Error('User data not available');
                }
                
                // Check role-based access if specified
                const requiredRole = document.body.getAttribute('data-required-role');
                if (requiredRole && !checkRoleAccess(user.role, requiredRole)) {
                    throw new Error(`Insufficient permissions. Required role: ${requiredRole}`);
                }
                
                resolve(user);
            } catch (error) {
                reject(error);
            }
        });
    }
    
    /**
     * Check role-based access
     */
    function checkRoleAccess(userRole, requiredRole) {
        if (!userRole) return false;
        if (userRole === 'admin') return true; // Admin has access to everything
        
        // Handle multiple required roles (comma-separated)
        const requiredRoles = requiredRole.split(',').map(role => role.trim());
        return requiredRoles.includes(userRole);
    }
    
    /**
     * Handle authentication failure
     */
    function handleAuthenticationFailure(error) {
        console.error('Authentication error:', error);
        
        hideLoadingState();
        
        // Show appropriate error message
        if (error.message.includes('not authenticated')) {
            showAuthError('Please log in to access this page.', 'login');
        } else if (error.message.includes('Insufficient permissions')) {
            showAuthError('You do not have permission to access this page.', 'unauthorized');
        } else {
            showAuthError('An error occurred while verifying your access.', 'error');
        }
    }
    
    /**
     * Show authentication error
     */
    function showAuthError(message, type) {
        const errorOverlay = document.createElement('div');
        errorOverlay.id = 'auth-error-overlay';
        errorOverlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        const iconMap = {
            login: '🔐',
            unauthorized: '🚫',
            error: '⚠️'
        };
        
        errorOverlay.innerHTML = `
            <div class="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 max-w-md mx-4">
                <div class="text-center">
                    <div class="text-6xl mb-4">${iconMap[type] || '⚠️'}</div>
                    <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-4">
                        ${type === 'login' ? 'Authentication Required' : 
                          type === 'unauthorized' ? 'Access Denied' : 'Access Error'}
                    </h3>
                    <p class="text-slate-600 dark:text-slate-300 mb-6">${message}</p>
                    <div class="flex justify-center">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-dark"></div>
                    </div>
                    <p class="text-sm text-slate-500 mt-4">Redirecting...</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(errorOverlay);
        
        // Redirect after delay
        setTimeout(() => {
            if (type === 'login') {
                // Store current URL for return after login
                sessionStorage.setItem('returnUrl', window.location.pathname + window.location.search);
                window.location.href = config.loginPath;
            } else if (type === 'unauthorized' && currentUser) {
                // Redirect to user's appropriate dashboard
                const redirectUrl = window.AuthService.getRedirectUrl(currentUser.role);
                window.location.href = redirectUrl;
            } else {
                window.location.href = config.loginPath;
            }
        }, config.unauthorizedRedirectDelay);
    }
    
    /**
     * Show loading state
     */
    function showLoadingState() {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'auth-loading-overlay';
        loadingOverlay.className = 'fixed inset-0 bg-white dark:bg-slate-900 flex items-center justify-center z-50';
        loadingOverlay.innerHTML = `
            <div class="text-center">
                <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-dark mx-auto mb-4"></div>
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">Verifying Access</h3>
                <p class="text-slate-600 dark:text-slate-300">Please wait while we authenticate your session...</p>
            </div>
        `;
        document.body.appendChild(loadingOverlay);
    }
    
    /**
     * Hide loading state
     */
    function hideLoadingState() {
        const loadingOverlay = document.getElementById('auth-loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
    }
    
    /**
     * Initialize page features after authentication
     */
    function initializePageFeatures() {
        // Update user interface elements
        updateUserInterface();
        
        // Setup logout functionality
        setupLogoutHandlers();
        
        // Setup role-based element visibility
        setupRoleBasedVisibility();
        
        // Setup CSRF protection for forms
        setupCSRFProtection();
    }
    
    /**
     * Update user interface with user data
     */
    function updateUserInterface() {
        if (!currentUser) return;
        
        // Update user name displays
        const userNameElements = document.querySelectorAll('[data-user-name]');
        userNameElements.forEach(element => {
            element.textContent = currentUser.name || currentUser.email;
        });
        
        // Update user email displays
        const userEmailElements = document.querySelectorAll('[data-user-email]');
        userEmailElements.forEach(element => {
            element.textContent = currentUser.email;
        });
        
        // Update user role displays
        const userRoleElements = document.querySelectorAll('[data-user-role]');
        userRoleElements.forEach(element => {
            element.textContent = currentUser.role;
        });
        
        // Update user avatar/initials
        const userAvatarElements = document.querySelectorAll('[data-user-avatar]');
        userAvatarElements.forEach(element => {
            const initials = currentUser.name ? 
                currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase() :
                currentUser.email[0].toUpperCase();
            element.textContent = initials;
        });
    }
    
    /**
     * Setup logout handlers
     */
    function setupLogoutHandlers() {
        const logoutElements = document.querySelectorAll('[data-logout]');
        logoutElements.forEach(element => {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (confirm('Are you sure you want to log out?')) {
                    window.AuthService.logout();
                }
            });
        });
    }
    
    /**
     * Setup role-based element visibility
     */
    function setupRoleBasedVisibility() {
        if (!currentUser) return;
        
        const roleElements = document.querySelectorAll('[data-required-role]');
        roleElements.forEach(element => {
            const requiredRole = element.getAttribute('data-required-role');
            if (!checkRoleAccess(currentUser.role, requiredRole)) {
                element.style.display = 'none';
            }
        });
        
        // Show elements for current user role
        const userRoleElements = document.querySelectorAll(`[data-show-for-role="${currentUser.role}"]`);
        userRoleElements.forEach(element => {
            element.style.display = '';
        });
    }
    
    /**
     * Setup CSRF protection for forms
     */
    function setupCSRFProtection() {
        if (!window.AuthService) return;
        
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            // Skip forms that already have CSRF tokens
            if (form.querySelector('input[name="csrf_token"]')) return;
            
            // Add CSRF token
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = 'csrf_token';
            csrfInput.value = window.AuthService.csrfToken || 'temp_token';
            form.appendChild(csrfInput);
        });
    }
    
    /**
     * Setup session monitoring
     */
    function setupSessionMonitoring() {
        // Check session periodically
        setInterval(() => {
            if (window.AuthService && !window.AuthService.isAuthenticated()) {
                showAuthError('Your session has expired. Please log in again.', 'login');
            }
        }, config.sessionCheckInterval);
        
        // Update activity on user interaction
        ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
            document.addEventListener(event, () => {
                if (window.AuthService && currentUser) {
                    // Update last activity timestamp
                    const userData = window.AuthService.getCurrentUser();
                    if (userData) {
                        userData.lastActivity = Date.now();
                        window.AuthService.secureStore(window.AuthService.userKey, userData);
                    }
                }
            }, { passive: true });
        });
    }
    
    /**
     * Public API
     */
    window.ProtectedPage = {
        getCurrentUser: () => currentUser,
        isAuthComplete: () => authCheckComplete,
        checkRoleAccess: checkRoleAccess,
        updateUserInterface: updateUserInterface
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProtectedPage);
    } else {
        initProtectedPage();
    }
})();
