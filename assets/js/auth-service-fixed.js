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
     * Login user with email and password
     */
    async login(email, password, rememberMe = false) {
        try {
            console.log(`🔑 Attempting login for: ${email}`);
            
            // Demo users for testing (matching login.html credentials)
            const demoUsers = [
                {
                    id: 1,
                    email: 'buyer@ardonie.com',
                    password: 'SecurePass123!',
                    firstName: 'John',
                    lastName: 'Buyer',
                    userTypes: ['buyer']
                },
                {
                    id: 2,
                    email: 'seller@ardonie.com',
                    password: 'SecurePass123!',
                    firstName: 'Jane',
                    lastName: 'Seller',
                    userTypes: ['seller']
                },
                {
                    id: 3,
                    email: 'admin@ardonie.com',
                    password: 'AdminPass123!',
                    firstName: 'Admin',
                    lastName: 'User',
                    userTypes: ['admin']
                },
                {
                    id: 4,
                    email: 'reforiy538@iamtile.com',
                    password: 'gK9.t1|ROnQ52U[',
                    firstName: 'Test',
                    lastName: 'User',
                    userTypes: ['buyer']
                },
                {
                    id: 5,
                    email: 'multirole@ardonie.com',
                    password: 'MultiRole123!',
                    firstName: 'Multi',
                    lastName: 'Role',
                    userTypes: ['buyer', 'seller']
                },
                {
                    id: 6,
                    email: 'accountant@ardonie.com',
                    password: 'AccountPass123!',
                    firstName: 'Account',
                    lastName: 'Manager',
                    userTypes: ['accountant']
                },
                {
                    id: 7,
                    email: 'firmadmin@ardonie.com',
                    password: 'FirmAdmin123!',
                    firstName: 'Firm',
                    lastName: 'Admin',
                    userTypes: ['admin']
                }
            ];

            const user = demoUsers.find(u => u.email === email && u.password === password);
            
            if (user) {
                const sessionData = {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    userTypes: user.userTypes,
                    loginTime: new Date().toISOString(),
                    rememberMe: rememberMe,
                    isAuthenticated: true
                };

                // Store session data
                localStorage.setItem('ardonie_user_session', JSON.stringify(sessionData));
                sessionStorage.setItem('ardonie_current_user', JSON.stringify(sessionData));
                localStorage.setItem('ardonie_auth_status', 'authenticated');
                sessionStorage.setItem('ardonie_auth_status', 'authenticated');

                console.log('✅ Login successful');

                // Generate redirect URL based on user types
                const redirectUrl = this.getRedirectUrlForUserTypes(sessionData.userTypes);
                console.log('🔀 Generated redirect URL:', redirectUrl);

                return {
                    success: true,
                    user: sessionData,
                    redirectUrl: redirectUrl
                };
            } else {
                console.log('❌ Invalid credentials');
                return {
                    success: false,
                    error: 'Invalid email or password'
                };
            }
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
        
        // Also expose as AuthService for compatibility
        window.AuthService = SimpleAuthService;
        window.authService = window.simpleAuthService;
        console.log('✅ Compatibility aliases created');
        
        console.log('🎉 Fixed auth service initialization complete!');
    } else {
        console.log('📦 Node.js environment detected');
    }
} catch (error) {
    console.error('❌ Failed to initialize fixed auth service:', error);
    console.error('❌ Error stack:', error.stack);
}

console.log('✅ Fixed auth service script execution completed');
