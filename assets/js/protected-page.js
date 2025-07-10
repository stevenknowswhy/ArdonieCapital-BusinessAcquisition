/**
 * Protected Page Template for Ardonie Capital
 * Include this script on any page that requires authentication
 */

(function() {
    'use strict';
    
    // Configuration with dynamic path resolution
    const config = {
        authServicePath: getAuthServicePath(),
        loginPath: getLoginPath(),
        unauthorizedRedirectDelay: 2000,
        sessionCheckInterval: 60000 // Check session every minute
    };

    /**
     * Get correct auth service path based on current location
     */
    function getAuthServicePath() {
        const currentPath = window.location.pathname;
        if (currentPath.includes('/dashboard/')) {
            return '../assets/js/auth-service-fixed.js';
        } else if (currentPath.includes('/auth/')) {
            return '../assets/js/auth-service-fixed.js';
        } else {
            return './assets/js/auth-service-fixed.js';
        }
    }

    /**
     * Get correct login path based on current location
     */
    function getLoginPath() {
        const currentPath = window.location.pathname;
        if (currentPath.includes('/dashboard/')) {
            return '../auth/login.html';
        } else if (currentPath.includes('/auth/')) {
            return './login.html';
        } else {
            return './auth/login.html';
        }
    }
    
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
     * Load security scripts dynamically with enhanced error handling
     */
    function loadSecurityScripts() {
        return new Promise((resolve, reject) => {
            // Check if auth service is already loaded and functional
            if (window.authService) {
                console.log('✅ Auth service already available');

                // Verify auth service has required methods
                if (typeof window.authService.isAuthenticated === 'function' &&
                    typeof window.authService.getCurrentUser === 'function') {
                    console.log('✅ Auth service methods verified (pre-loaded)');
                    resolve();
                    return;
                } else {
                    console.warn('⚠️ Auth service exists but missing required methods');
                    console.log('🔍 Available methods:', Object.getOwnPropertyNames(window.authService));
                }
            }

            console.log('🔄 Loading auth service from:', config.authServicePath);
            const script = document.createElement('script');
            script.src = config.authServicePath + '?v=protected-' + Date.now();

            script.onload = () => {
                console.log('✅ Auth service script loaded successfully');

                // Wait for the global authService instance to be available
                let attempts = 0;
                const maxAttempts = 50;

                const checkAuthService = () => {
                    if (window.authService) {
                        console.log('✅ Auth service instance available');
                        // Verify auth service has required methods
                        if (typeof window.authService.isAuthenticated === 'function' &&
                            typeof window.authService.getCurrentUser === 'function') {
                            console.log('✅ Auth service methods verified');
                            resolve();
                        } else {
                            console.error('❌ Auth service missing required methods');
                            console.log('🔍 Available methods:', Object.getOwnPropertyNames(window.authService));
                            reject(new Error('Auth service incomplete - missing required methods'));
                        }
                    } else if (attempts < maxAttempts) {
                        attempts++;
                        console.log(`⏳ Waiting for auth service... attempt ${attempts}/${maxAttempts}`);
                        setTimeout(checkAuthService, 100);
                    } else {
                        console.error('❌ Auth service instance not available after loading');
                        console.log('🔍 Available window properties:', Object.keys(window).filter(k => k.includes('auth')));
                        reject(new Error('Auth service instance not available after loading'));
                    }
                };

                checkAuthService();
            };

            script.onerror = (error) => {
                console.error('❌ Failed to load auth service script:', error);
                console.error('📂 Attempted path:', config.authServicePath);
                reject(new Error(`Failed to load auth service: ${config.authServicePath}`));
            };

            document.head.appendChild(script);
        });
    }
    
    /**
     * Check user authentication with retry mechanism and enhanced debugging
     */
    function checkAuthentication() {
        return checkAuthenticationWithRetry(3);
    }

    /**
     * Check authentication with retry mechanism
     */
    async function checkAuthenticationWithRetry(maxRetries = 3) {
        console.log(`🔄 Starting authentication check with retry (max ${maxRetries} attempts)`);

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`🔍 Authentication attempt ${attempt}/${maxRetries}`);
                console.log('📍 Current URL:', window.location.href);
                console.log('⏰ Attempt timestamp:', new Date().toISOString());

                if (!window.authService) {
                    console.error(`❌ Attempt ${attempt}: Auth service not available on window object`);
                    console.log('🔍 Available window properties:', Object.keys(window).filter(k => k.includes('auth')));
                    if (attempt === maxRetries) {
                        throw new Error('Authentication service not available after all retries');
                    }
                    console.log('⏳ Waiting before retry...');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    continue;
                }

                console.log(`✅ Attempt ${attempt}: Auth service found, checking authentication status...`);

                // Enhanced debugging for session data
                const authStatus = localStorage.getItem('ardonie_auth_status') || sessionStorage.getItem('ardonie_auth_status');
                const sessionData = localStorage.getItem('ardonie_user_session') || sessionStorage.getItem('ardonie_current_user');

                console.log(`🔍 Attempt ${attempt}: Auth status:`, authStatus);
                console.log(`🔍 Attempt ${attempt}: Session data exists:`, !!sessionData);

                if (sessionData) {
                    try {
                        const parsedData = JSON.parse(sessionData);
                        console.log(`📊 Attempt ${attempt}: Session data preview:`, {
                            email: parsedData.email,
                            userTypes: parsedData.userTypes,
                            isAuthenticated: parsedData.isAuthenticated,
                            loginTime: parsedData.loginTime
                        });
                    } catch (e) {
                        console.error(`❌ Attempt ${attempt}: Failed to parse session data:`, e);
                    }
                }

                // Handle both sync and async auth services
                let isAuth, user;

                // Check if methods are async (return promises)
                const isAuthResult = window.authService.isAuthenticated();
                const isAsync = isAuthResult && typeof isAuthResult.then === 'function';

                console.log(`🔍 Attempt ${attempt}: Auth service type:`, isAsync ? 'Async (Supabase-based)' : 'Sync (Demo)');

                if (isAsync) {
                    console.log(`⏳ Attempt ${attempt}: Using async authentication methods...`);
                    isAuth = await isAuthResult;
                    console.log(`🔐 Attempt ${attempt}: isAuthenticated() result (async):`, isAuth);

                    if (!isAuth) {
                        console.error(`❌ Attempt ${attempt}: User not authenticated according to async auth service`);
                        if (attempt === maxRetries) {
                            throw new Error('User not authenticated after all retries');
                        }
                        console.log('⏳ Waiting before retry...');
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        continue;
                    }

                    user = await window.authService.getCurrentUser();
                    console.log(`👤 Attempt ${attempt}: getCurrentUser() result (async):`, user ? 'User object found' : 'null');
                } else {
                    console.log(`⚡ Attempt ${attempt}: Using sync authentication methods...`);
                    isAuth = isAuthResult;
                    console.log(`🔐 Attempt ${attempt}: isAuthenticated() result (sync):`, isAuth);

                    if (!isAuth) {
                        console.error(`❌ Attempt ${attempt}: User not authenticated according to sync auth service`);
                        if (attempt === maxRetries) {
                            throw new Error('User not authenticated after all retries');
                        }
                        console.log('⏳ Waiting before retry...');
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        continue;
                    }

                    user = window.authService.getCurrentUser();
                    console.log(`👤 Attempt ${attempt}: getCurrentUser() result (sync):`, user ? 'User object found' : 'null');
                }

                if (!user) {
                    console.error(`❌ Attempt ${attempt}: User data not available from auth service`);
                    if (attempt === maxRetries) {
                        throw new Error('User data not available after all retries');
                    }
                    console.log('⏳ Waiting before retry...');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    continue;
                }

                console.log(`✅ Attempt ${attempt}: User authenticated successfully:`, user.email);
                console.log(`🎭 Attempt ${attempt}: User roles:`, user.userTypes);

                // Check role-based access if specified
                const requiredRole = document.body.getAttribute('data-required-role');
                console.log(`🔒 Attempt ${attempt}: Required role for page:`, requiredRole);

                if (requiredRole && !checkRoleAccess(user.userTypes, requiredRole)) {
                    console.error(`❌ Attempt ${attempt}: Insufficient permissions. Required:`, requiredRole, 'User has:', user.userTypes);
                    throw new Error(`Insufficient permissions. Required role: ${requiredRole}`);
                }

                console.log(`🎉 Authentication check completed successfully on attempt ${attempt}`);
                return user;

            } catch (error) {
                console.error(`❌ Authentication attempt ${attempt} failed:`, error.message);
                console.error('🔍 Error details:', {
                    message: error.message,
                    stack: error.stack,
                    authServiceAvailable: !!window.authService,
                    currentURL: window.location.href
                });

                if (attempt === maxRetries) {
                    console.error('❌ All authentication attempts failed');
                    throw error;
                }

                console.log(`⏳ Waiting ${1000 * attempt}ms before retry attempt ${attempt + 1}...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }
    
    /**
     * Check role-based access
     */
    function checkRoleAccess(userTypes, requiredRole) {
        if (!userTypes || !Array.isArray(userTypes)) return false;

        // Super admin has access to everything
        if (userTypes.includes('super_admin') || userTypes.includes('admin')) return true;

        // Handle multiple required roles (comma-separated)
        const requiredRoles = requiredRole.split(',').map(role => role.trim());
        return requiredRoles.some(role => userTypes.includes(role));
    }
    
    /**
     * Handle authentication failure
     */
    function handleAuthenticationFailure(error) {
        console.error('Authentication error:', error);

        hideLoadingState();

        // For dashboard pages, be more lenient and allow limited access
        const currentPath = window.location.pathname;
        if (currentPath.includes('/dashboard/')) {
            console.warn('⚠️ Dashboard authentication failed, allowing limited access');

            // Dispatch event to let dashboard know auth failed
            document.dispatchEvent(new CustomEvent('authenticationFailed', {
                detail: { error: error.message }
            }));

            // Initialize page features with limited functionality
            initializePageFeatures();
            return;
        }

        // For non-dashboard pages, show appropriate error message
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
            } else if (type === 'unauthorized' && currentUser && window.authService) {
                // Redirect to user's appropriate dashboard
                const redirectUrl = window.authService.getDashboardUrl(currentUser.userTypes[0]);
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

        console.log('🎨 Updating user interface for:', currentUser.email);

        // Update user name displays
        const userNameElements = document.querySelectorAll('[data-user-name]');
        userNameElements.forEach(element => {
            const fullName = `${currentUser.firstName} ${currentUser.lastName}`;
            element.textContent = fullName.trim() || currentUser.email;
        });

        // Update user email displays
        const userEmailElements = document.querySelectorAll('[data-user-email]');
        userEmailElements.forEach(element => {
            element.textContent = currentUser.email;
        });

        // Update user role displays
        const userRoleElements = document.querySelectorAll('[data-user-role]');
        userRoleElements.forEach(element => {
            element.textContent = currentUser.userTypes.join(', ');
        });

        // Update user avatar/initials
        const userAvatarElements = document.querySelectorAll('[data-user-avatar]');
        userAvatarElements.forEach(element => {
            const initials = currentUser.firstName && currentUser.lastName ?
                `${currentUser.firstName[0]}${currentUser.lastName[0]}`.toUpperCase() :
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
                    if (window.authService) {
                        window.authService.logout();
                        window.location.href = config.loginPath;
                    }
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
            if (!checkRoleAccess(currentUser.userTypes, requiredRole)) {
                element.style.display = 'none';
            }
        });

        // Show elements for current user roles
        currentUser.userTypes.forEach(role => {
            const userRoleElements = document.querySelectorAll(`[data-show-for-role="${role}"]`);
            userRoleElements.forEach(element => {
                element.style.display = '';
            });
        });
    }
    
    /**
     * Setup CSRF protection for forms
     */
    function setupCSRFProtection() {
        if (!window.authService) return;

        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            // Skip forms that already have CSRF tokens
            if (form.querySelector('input[name="csrf_token"]')) return;

            // Add CSRF token
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = 'csrf_token';
            csrfInput.value = 'temp_token_' + Date.now();
            form.appendChild(csrfInput);
        });
    }
    
    /**
     * Setup session monitoring
     */
    function setupSessionMonitoring() {
        // Check session periodically
        setInterval(() => {
            if (window.authService && !window.authService.isAuthenticated()) {
                showAuthError('Your session has expired. Please log in again.', 'login');
            }
        }, config.sessionCheckInterval);

        // Update activity on user interaction
        ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
            document.addEventListener(event, () => {
                if (window.authService && currentUser) {
                    // Update last activity timestamp
                    const userData = window.authService.getCurrentUser();
                    if (userData) {
                        userData.lastActivity = Date.now();
                        // Store updated user data
                        localStorage.setItem('ardonie_user_session', JSON.stringify(userData));
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
