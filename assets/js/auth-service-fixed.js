/**
 * Fixed Authentication Service for BuyMartV1
 * Minimal, working version to resolve initialization issues
 */

console.log('🔄 Loading FIXED auth service...');

class SimpleAuthService {
    constructor() {
        console.log('🏗️ SimpleAuthService constructor called');
        
        try {
            this.apiBase = '/api/auth';
            this.tokenKey = 'ardonie_auth_token';
            this.userKey = 'ardonie_user_data';
            this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
            this.csrfToken = null;
            this.supabase = null;

            console.log('✅ SimpleAuthService properties initialized');
            
            // Initialize Supabase asynchronously (don't block constructor)
            this.initSupabaseAsync();
            
            console.log('✅ SimpleAuthService constructor completed');
        } catch (error) {
            console.error('❌ Error in SimpleAuthService constructor:', error);
            throw error;
        }
    }

    /**
     * Initialize Supabase client asynchronously
     */
    async initSupabaseAsync() {
        try {
            console.log('🔄 Initializing Supabase asynchronously...');
            
            // Supabase configuration
            const SUPABASE_URL = 'https://pbydepsqcypwqbicnsco.supabase.co';
            const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieWRlcHNxY3lwd3FiaWNuc2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjAxOTQsImV4cCI6MjA2NzQ5NjE5NH0.5aF46QcNOFN_vwXcHxCsVx_8a4EsqE1bL4fy4K7UXI0';

            // Check if Supabase is available
            if (typeof window !== 'undefined' && typeof window.supabase !== 'undefined') {
                this.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                console.log('✅ Supabase client initialized successfully');
            } else {
                console.warn('⚠️ Supabase not available, falling back to localStorage');
            }
        } catch (error) {
            console.error('❌ Failed to initialize Supabase:', error);
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        try {
            console.log('🔍 DETAILED AUTH CHECK: Starting comprehensive validation...');
            console.log('📍 Current URL:', window.location.href);
            console.log('⏰ Timestamp:', new Date().toISOString());

            // Check localStorage first
            const localAuthStatus = localStorage.getItem('ardonie_auth_status');
            const localSessionData = localStorage.getItem('ardonie_user_session');
            console.log('💾 localStorage auth status:', localAuthStatus);
            console.log('💾 localStorage session data exists:', !!localSessionData);

            // Check sessionStorage
            const sessionAuthStatus = sessionStorage.getItem('ardonie_auth_status');
            const sessionSessionData = sessionStorage.getItem('ardonie_current_user');
            console.log('🗂️ sessionStorage auth status:', sessionAuthStatus);
            console.log('🗂️ sessionStorage session data exists:', !!sessionSessionData);

            // Use fallback logic
            const authStatus = localAuthStatus || sessionAuthStatus;
            const sessionData = localSessionData || sessionSessionData;

            console.log('📊 Final auth status:', authStatus);
            console.log('📊 Final session data exists:', !!sessionData);

            // Validate auth status
            if (authStatus !== 'authenticated') {
                console.error('❌ AUTH FAIL: Auth status validation failed');
                console.error('   Expected: "authenticated"');
                console.error('   Actual:', authStatus);
                console.error('   localStorage value:', localAuthStatus);
                console.error('   sessionStorage value:', sessionAuthStatus);
                return false;
            }

            // Validate session data exists
            if (!sessionData) {
                console.error('❌ AUTH FAIL: No session data found in either storage');
                console.error('   localStorage session:', !!localSessionData);
                console.error('   sessionStorage session:', !!sessionSessionData);
                return false;
            }

            // Parse and validate session data
            try {
                const userData = JSON.parse(sessionData);
                console.log('📊 Parsed user data successfully');
                console.log('   Email:', userData.email);
                console.log('   User Types:', userData.userTypes);
                console.log('   Login Time:', userData.loginTime);
                console.log('   isAuthenticated flag:', userData.isAuthenticated);
                console.log('   Remember Me:', userData.rememberMe);

                // Validate required fields
                if (!userData.email) {
                    console.error('❌ AUTH FAIL: Missing email in user data');
                    return false;
                }

                if (!userData.userTypes || !Array.isArray(userData.userTypes)) {
                    console.error('❌ AUTH FAIL: Missing or invalid userTypes in user data');
                    return false;
                }

                if (userData.isAuthenticated !== true) {
                    console.error('❌ AUTH FAIL: isAuthenticated flag is not true');
                    console.error('   Expected: true');
                    console.error('   Actual:', userData.isAuthenticated);
                    console.error('   Type:', typeof userData.isAuthenticated);
                    return false;
                }

                console.log('✅ AUTH SUCCESS: All validation checks passed');
                console.log('🎉 User is authenticated:', userData.email);
                return true;

            } catch (parseError) {
                console.error('❌ AUTH FAIL: Session data parse error');
                console.error('   Parse error:', parseError.message);
                console.error('   Session data length:', sessionData.length);
                console.error('   Session data preview:', sessionData.substring(0, 100) + '...');
                return false;
            }

        } catch (error) {
            console.error('❌ AUTH FAIL: Unexpected error in isAuthenticated');
            console.error('   Error:', error.message);
            console.error('   Stack:', error.stack);
            return false;
        }
    }

    /**
     * Get current user data
     */
    getCurrentUser() {
        try {
            console.log('👤 Getting current user...');
            
            if (!this.isAuthenticated()) {
                console.log('❌ User not authenticated');
                return null;
            }

            const sessionData = localStorage.getItem('ardonie_user_session') || sessionStorage.getItem('ardonie_current_user');
            
            if (sessionData) {
                try {
                    const userData = JSON.parse(sessionData);
                    console.log(`✅ User data found: ${userData.email}`);
                    return userData;
                } catch (parseError) {
                    console.error('❌ Failed to parse user data:', parseError);
                    return null;
                }
            }
            
            console.log('❌ No user data found');
            return null;
        } catch (error) {
            console.error('❌ Error in getCurrentUser:', error);
            return null;
        }
    }

    /**
     * Wait for Supabase to be initialized
     */
    async waitForSupabase(maxWait = 5000) {
        const startTime = Date.now();
        while (!this.supabase && (Date.now() - startTime) < maxWait) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        if (!this.supabase) {
            throw new Error('Supabase initialization timeout');
        }
    }

    /**
     * Login user with email and password using Supabase
     */
    async login(email, password, rememberMe = false) {
        try {
            console.log(`🔑 Attempting Supabase login for: ${email}`);

            // Wait for Supabase to be initialized
            if (!this.supabase) {
                console.log('⏳ Waiting for Supabase initialization...');
                await this.waitForSupabase();
            }

            // Attempt Supabase authentication
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                console.error('❌ Supabase auth error:', error);
                return {
                    success: false,
                    error: error.message
                };
            }

            console.log('✅ Supabase authentication successful');
            console.log('👤 User ID:', data.user.id);

            // Get user profile from database
            const { data: profile, error: profileError } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('user_id', data.user.id)
                .single();

            if (profileError) {
                console.error('❌ Profile fetch error:', profileError);
                return {
                    success: false,
                    error: 'Failed to load user profile'
                };
            }

            console.log('✅ User profile loaded:', profile);

            // Get user roles
            const { data: userRoles, error: rolesError } = await this.supabase
                .from('user_roles')
                .select(`
                    role_id,
                    roles (
                        name,
                        slug
                    )
                `)
                .eq('user_id', data.user.id)
                .eq('is_active', true);

            if (rolesError) {
                console.warn('⚠️ Roles fetch error:', rolesError);
            }

            // Determine user types from roles
            let userTypes = [];
            if (userRoles && userRoles.length > 0) {
                userTypes = userRoles.map(ur => ur.roles.slug);
            } else {
                // Fallback to legacy role
                userTypes = [profile.role || 'buyer'];
            }

            console.log('🎭 User roles:', userTypes);

            // Create session data
            const sessionData = {
                id: data.user.id,
                email: data.user.email,
                firstName: profile.first_name,
                lastName: profile.last_name,
                userTypes: userTypes,
                loginTime: new Date().toISOString(),
                rememberMe: rememberMe,
                isAuthenticated: true,
                profile: profile,
                supabaseUser: data.user
            };

            // Store session data
            localStorage.setItem('ardonie_user_session', JSON.stringify(sessionData));
            sessionStorage.setItem('ardonie_current_user', JSON.stringify(sessionData));
            localStorage.setItem('ardonie_auth_status', 'authenticated');
            sessionStorage.setItem('ardonie_auth_status', 'authenticated');

            console.log('✅ Login successful with Supabase');

            // Generate redirect URL based on user types
            const redirectUrl = this.getRedirectUrlForUserTypes(sessionData.userTypes);
            console.log('🔀 Generated redirect URL:', redirectUrl);

            return {
                success: true,
                user: sessionData,
                redirectUrl: redirectUrl
            };
        } catch (error) {
            console.error('❌ Login error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Logout user
     */
    logout() {
        try {
            console.log('🚪 Logging out user...');
            
            // Clear session data
            localStorage.removeItem('ardonie_user_session');
            localStorage.removeItem('ardonie_auth_status');
            sessionStorage.removeItem('ardonie_current_user');
            sessionStorage.removeItem('ardonie_auth_status');
            
            console.log('✅ Logout successful');
            return { success: true };
        } catch (error) {
            console.error('❌ Logout error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Clear session data
     */
    clearSession() {
        return this.logout();
    }

    /**
     * Get redirect URL based on user types (prioritize seller over buyer)
     */
    getRedirectUrlForUserTypes(userTypes) {
        console.log('🔀 Determining redirect URL for user types:', userTypes);

        if (!userTypes || !Array.isArray(userTypes)) {
            console.log('🔀 No user types provided, defaulting to buyer dashboard');
            return '../dashboard/buyer-dashboard.html';
        }

        // Priority order: seller > buyer > admin
        if (userTypes.includes('seller')) {
            console.log('🔀 User is seller, redirecting to seller dashboard');
            return '../dashboard/seller-dashboard.html';
        } else if (userTypes.includes('buyer')) {
            console.log('🔀 User is buyer, redirecting to buyer dashboard');
            return '../dashboard/buyer-dashboard.html';
        } else if (userTypes.includes('admin')) {
            console.log('🔀 User is admin, redirecting to super admin dashboard');
            return '../dashboard/super-admin-dashboard.html';
        }

        console.log('🔀 No matching user type, defaulting to buyer dashboard');
        return '../dashboard/buyer-dashboard.html';
    }

    /**
     * Get dashboard URL for a specific user type (helper method)
     */
    getDashboardUrl(userType) {
        const dashboardMap = {
            'buyer': '../dashboard/buyer-dashboard.html',
            'seller': '../dashboard/seller-dashboard.html',
            'admin': '../dashboard/super-admin-dashboard.html',
            'accountant': '../portals/accountant-portal.html',
            'attorney': '../portals/attorney-portal.html',
            'lender': '../portals/lender-portal.html'
        };

        return dashboardMap[userType] || '../dashboard/buyer-dashboard.html';
    }

    /**
     * Sign in with Google OAuth
     */
    async signInWithGoogle(userType = 'buyer') {
        try {
            console.log(`🔑 Attempting Google OAuth sign-in for user type: ${userType}`);

            // Wait for Supabase to be initialized
            if (!this.supabase) {
                console.log('⏳ Waiting for Supabase initialization...');
                await this.waitForSupabase();
            }

            // Attempt Google OAuth with Supabase
            const { data, error } = await this.supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/oauth-callback.html`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                        user_type: userType
                    }
                }
            });

            if (error) {
                console.error('❌ Google OAuth error:', error);
                return {
                    success: false,
                    error: error.message
                };
            }

            console.log('✅ Google OAuth initiated successfully');
            return {
                success: true,
                data: data
            };

        } catch (error) {
            console.error('❌ Google sign-in error:', error);
            return {
                success: false,
                error: error.message || 'Google sign-in failed'
            };
        }
    }

    /**
     * Handle OAuth callback (for use in oauth-callback.html)
     */
    async handleOAuthCallback() {
        try {
            console.log('🔄 Handling OAuth callback...');

            // Wait for Supabase to be initialized
            if (!this.supabase) {
                console.log('⏳ Waiting for Supabase initialization...');
                await this.waitForSupabase();
            }

            // Get session from URL hash or current session
            let sessionData, sessionError;

            // First try to get session from URL (for OAuth callback)
            try {
                const urlSessionResult = await this.supabase.auth.getSessionFromUrl();
                sessionData = urlSessionResult.data;
                sessionError = urlSessionResult.error;
                console.log('🔄 Attempted to get session from URL:', !!sessionData.session);
            } catch (urlError) {
                console.log('⚠️ Could not get session from URL, trying current session:', urlError.message);
                // Fallback to current session
                const currentSessionResult = await this.supabase.auth.getSession();
                sessionData = currentSessionResult.data;
                sessionError = currentSessionResult.error;
            }

            if (sessionError) {
                console.error('❌ OAuth callback error:', sessionError);
                return {
                    success: false,
                    error: sessionError.message
                };
            }

            if (!sessionData.session) {
                console.error('❌ No session found in OAuth callback');
                console.log('🔍 URL params:', window.location.href);
                console.log('🔍 Hash:', window.location.hash);
                return {
                    success: false,
                    error: 'No session found'
                };
            }

            const user = sessionData.session.user;
            console.log('✅ OAuth session retrieved:', user.email);

            // Get or create user profile
            let { data: profile, error: profileError } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (profileError && profileError.code !== 'PGRST116') {
                console.error('❌ Profile fetch error:', profileError);
                return {
                    success: false,
                    error: 'Failed to load user profile'
                };
            }

            // Create profile if it doesn't exist
            if (!profile) {
                console.log('🔄 Creating new profile for OAuth user...');

                // Extract user type from URL params if available
                const urlParams = new URLSearchParams(window.location.search);
                const userType = urlParams.get('user_type') || 'buyer';

                // Prepare profile data with proper field mapping
                const firstName = user.user_metadata.full_name?.split(' ')[0] || user.user_metadata.name?.split(' ')[0] || 'User';
                const lastName = user.user_metadata.full_name?.split(' ').slice(1).join(' ') || user.user_metadata.name?.split(' ').slice(1).join(' ') || '';

                console.log('🔄 Profile data being inserted:', {
                    user_id: user.id,
                    first_name: firstName,
                    last_name: lastName,
                    role: userType,
                    avatar_url: user.user_metadata.avatar_url
                });

                const { data: newProfile, error: createError } = await this.supabase
                    .from('profiles')
                    .insert([{
                        user_id: user.id,
                        first_name: firstName,
                        last_name: lastName,
                        role: userType,
                        avatar_url: user.user_metadata.avatar_url
                        // Note: email is in auth.users, not profiles
                        // Note: created_at is auto-generated by the database
                    }])
                    .select()
                    .single();

                if (createError) {
                    console.error('❌ Profile creation error:', createError);
                    return {
                        success: false,
                        error: 'Failed to create user profile'
                    };
                }

                profile = newProfile;
                console.log('✅ New profile created for OAuth user');
            }

            // Create session data
            const userSessionData = {
                id: user.id,
                email: user.email,
                firstName: profile.first_name || user.user_metadata.full_name?.split(' ')[0] || '',
                lastName: profile.last_name || user.user_metadata.full_name?.split(' ').slice(1).join(' ') || '',
                userTypes: [profile.role || 'buyer'],
                isAuthenticated: true,
                loginTime: new Date().toISOString(),
                rememberMe: true,
                authMethod: 'google_oauth'
            };

            // Store session data
            localStorage.setItem('ardonie_user_session', JSON.stringify(userSessionData));
            localStorage.setItem('ardonie_auth_status', 'authenticated');

            console.log('✅ OAuth callback completed successfully');
            return {
                success: true,
                user: userSessionData,
                redirectUrl: this.getRedirectUrlForUserTypes(userSessionData.userTypes)
            };

        } catch (error) {
            console.error('❌ OAuth callback error:', error);
            return {
                success: false,
                error: error.message || 'OAuth callback failed'
            };
        }
    }
}

// Global initialization
try {
    console.log('🌐 Browser environment check...');
    
    if (typeof window !== 'undefined') {
        console.log('✅ Browser environment detected');
        
        // Make class available globally
        window.SimpleAuthService = SimpleAuthService;
        console.log('✅ SimpleAuthService class exposed globally');
        
        // Create global instance
        console.log('🏗️ Creating global instance...');
        window.simpleAuthService = new SimpleAuthService();
        console.log('✅ Global simpleAuthService instance created');

        // Verify instance has signInWithGoogle method
        if (typeof window.simpleAuthService.signInWithGoogle === 'function') {
            console.log('✅ signInWithGoogle method verified on instance');
        } else {
            console.error('❌ CRITICAL: signInWithGoogle method missing on instance');
        }

        // Also expose as AuthService for compatibility (must be instance, not class)
        window.AuthService = window.simpleAuthService;
        window.authService = window.simpleAuthService;
        console.log('✅ Compatibility aliases created');

        // Verify the fix worked
        console.log('🔍 Verifying AuthService setup...');
        console.log(`   window.AuthService type: ${typeof window.AuthService}`);
        console.log(`   window.AuthService.signInWithGoogle type: ${typeof window.AuthService?.signInWithGoogle}`);
        console.log(`   window.AuthService === window.authService: ${window.AuthService === window.authService}`);

        if (typeof window.AuthService.signInWithGoogle === 'function') {
            console.log('🎉 SUCCESS: window.AuthService.signInWithGoogle is accessible!');
        } else {
            console.error('❌ CRITICAL FAILURE: window.AuthService.signInWithGoogle is not accessible');
            console.error('   Attempting emergency fix...');

            // Emergency fallback fix
            try {
                window.AuthService = window.simpleAuthService;
                window.authService = window.simpleAuthService;

                if (typeof window.AuthService.signInWithGoogle === 'function') {
                    console.log('✅ Emergency fix successful');
                } else {
                    console.error('❌ Emergency fix failed');
                }
            } catch (emergencyError) {
                console.error('❌ Emergency fix error:', emergencyError);
            }
        }

        console.log('🎉 Fixed auth service initialization complete!');
    } else {
        console.log('📦 Node.js environment detected');
    }
} catch (error) {
    console.error('❌ Failed to initialize fixed auth service:', error);
    console.error('❌ Error stack:', error.stack);
}

console.log('✅ Fixed auth service script execution completed');

// Post-load verification and correction (runs after DOM is ready)
if (typeof window !== 'undefined') {
    // Use setTimeout to ensure this runs after all synchronous code
    setTimeout(() => {
        console.log('🔍 Post-load AuthService verification...');

        // Check if the fix worked
        if (typeof window.AuthService?.signInWithGoogle !== 'function') {
            console.warn('⚠️ Post-load fix required for AuthService');

            // Apply corrective fix
            if (window.simpleAuthService && typeof window.simpleAuthService.signInWithGoogle === 'function') {
                console.log('🔧 Applying post-load corrective fix...');
                window.AuthService = window.simpleAuthService;
                window.authService = window.simpleAuthService;

                if (typeof window.AuthService.signInWithGoogle === 'function') {
                    console.log('✅ Post-load fix successful!');
                } else {
                    console.error('❌ Post-load fix failed');
                }
            } else {
                console.error('❌ Cannot apply post-load fix - simpleAuthService unavailable');
            }
        } else {
            console.log('✅ AuthService verification passed - no post-load fix needed');
        }
    }, 100);
}
