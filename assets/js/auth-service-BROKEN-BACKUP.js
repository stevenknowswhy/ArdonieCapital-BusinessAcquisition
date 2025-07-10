/**
 * Simplified Authentication Service for Testing
 * This is a minimal version to test the constructor issue
 */

console.log('🔄 Loading simplified auth service...');

class SimpleAuthService {
    constructor() {
        console.log('🏗️ SimpleAuthService constructor called');
        this.apiBase = '/api/auth';
        this.tokenKey = 'ardonie_auth_token';
        this.userKey = 'ardonie_user_data';
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.csrfToken = null;
        this.supabase = null;

        // Initialize Supabase
        this.initSupabase();
        console.log('✅ SimpleAuthService constructor completed');
    }

    /**
     * Initialize Supabase client
     */
    async initSupabase() {
        try {
            // Supabase configuration
            const SUPABASE_URL = 'https://pbydepsqcypwqbicnsco.supabase.co';
            const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieWRlcHNxY3lwd3FiaWNuc2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjAxOTQsImV4cCI6MjA2NzQ5NjE5NH0.5aF46QcNOFN_vwXcHxCsVx_8a4EsqE1bL4fy4K7UXI0';

            // Check if Supabase is available
            if (typeof window.supabase !== 'undefined') {
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
     * Determine redirect URL based on user roles
     */
    determineRedirectUrl(userTypes) {
        console.log('🔀 Determining redirect URL for roles:', userTypes);

        // If user has only one role, redirect directly to that dashboard
        if (userTypes.length === 1) {
            const role = userTypes[0];
            const dashboardMap = {
                'buyer': '../dashboard/buyer-dashboard.html',
                'seller': '../dashboard/seller-dashboard.html',
                'accountant': '../dashboard/accountant-dashboard.html',
                'accounting_firm_admin': '../dashboard/accounting-firm-admin-dashboard.html',
                'super_admin': '../dashboard/super-admin-dashboard.html',
                'admin': '../dashboard/super-admin-dashboard.html' // Legacy admin maps to super admin
            };

            const redirectUrl = dashboardMap[role] || '../dashboard/buyer-dashboard.html';
            console.log(`✅ Single role (${role}) → ${redirectUrl}`);
            return redirectUrl;
        }

        // If user has multiple roles, redirect to role selection page
        console.log('✅ Multiple roles → role selection page');
        return '../dashboard/role-selection.html';
    }

    /**
     * Store user session data
     */
    storeUserSession(user, rememberMe) {
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

        try {
            // Store in localStorage for persistence
            localStorage.setItem('ardonie_user_session', JSON.stringify(sessionData));

            // Also store in sessionStorage for current session
            sessionStorage.setItem('ardonie_current_user', JSON.stringify(sessionData));

            // Store a simple auth flag for quick checks
            localStorage.setItem('ardonie_auth_status', 'authenticated');
            sessionStorage.setItem('ardonie_auth_status', 'authenticated');

            console.log('💾 User session stored successfully');
            console.log('📊 Session data:', sessionData);
        } catch (error) {
            console.error('❌ Failed to store user session:', error);
        }
    }

    /**
     * Get current user session
     */
    getCurrentUser() {
        try {
            // Check auth status first for quick validation
            const authStatus = localStorage.getItem('ardonie_auth_status') ||
                              sessionStorage.getItem('ardonie_auth_status');

            if (authStatus !== 'authenticated') {
                console.log('🔍 No authentication status found');
                return null;
            }

            // Try localStorage first (persistent), then sessionStorage
            let sessionData = localStorage.getItem('ardonie_user_session');
            if (!sessionData) {
                sessionData = sessionStorage.getItem('ardonie_current_user');
            }

            if (sessionData) {
                const userData = JSON.parse(sessionData);
                console.log('✅ Current user found:', userData.email);
                return userData;
            } else {
                console.log('🔍 No user session data found');
                return null;
            }
        } catch (error) {
            console.error('❌ Error getting current user:', error);
            // Clear corrupted session data
            this.clearSession();
            return null;
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        const authStatus = localStorage.getItem('ardonie_auth_status') ||
                          sessionStorage.getItem('ardonie_auth_status');
        const currentUser = this.getCurrentUser();

        const isAuth = authStatus === 'authenticated' && currentUser !== null;
        console.log('🔐 Authentication check:', isAuth ? 'AUTHENTICATED' : 'NOT AUTHENTICATED');
        return isAuth;
    }

    /**
     * Clear session data
     */
    clearSession() {
        localStorage.removeItem('ardonie_user_session');
        localStorage.removeItem('ardonie_auth_status');
        localStorage.removeItem('ardonie_selected_role');
        sessionStorage.removeItem('ardonie_current_user');
        sessionStorage.removeItem('ardonie_auth_status');
        console.log('🧹 Session data cleared');
    }

    /**
     * Set selected role for multi-role users
     */
    setSelectedRole(role) {
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.userTypes.includes(role)) {
            currentUser.selectedRole = role;
            localStorage.setItem('ardonie_user_session', JSON.stringify(currentUser));
            sessionStorage.setItem('ardonie_current_user', JSON.stringify(currentUser));
            console.log('✅ Selected role set to:', role);
            return true;
        }
        return false;
    }

    /**
     * Get dashboard URL for a specific role
     */
    getDashboardUrl(role) {
        const dashboardMap = {
            'buyer': '../dashboard/buyer-dashboard.html',
            'seller': '../dashboard/seller-dashboard.html',
            'accountant': '../dashboard/accountant-dashboard.html',
            'accounting_firm_admin': '../dashboard/accounting-firm-admin-dashboard.html',
            'super_admin': '../dashboard/super-admin-dashboard.html',
            'admin': '../dashboard/super-admin-dashboard.html'
        };

        return dashboardMap[role] || '../dashboard/buyer-dashboard.html';
    }

    /**
     * Logout user and clear session
     */
    logout() {
        this.clearSession();
        console.log('✅ User logged out, session cleared');
        return { success: true };
    }

    /**
     * Validate email format
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Login user
     */
    async login(email, password, rememberMe = false) {
        try {
            console.log('🚀 Starting login process for:', email);

            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            if (!this.validateEmail(email)) {
                throw new Error('Please enter a valid email address');
            }

            // Demo users for testing
            const demoUsers = {
                'buyer@ardonie.com': {
                    id: 1,
                    email: 'buyer@ardonie.com',
                    name: 'Demo Buyer',
                    firstName: 'Demo',
                    lastName: 'Buyer',
                    userTypes: ['buyer'],
                    password: 'SecurePass123!'
                },
                'seller@ardonie.com': {
                    id: 2,
                    email: 'seller@ardonie.com',
                    name: 'Demo Seller',
                    firstName: 'Demo',
                    lastName: 'Seller',
                    userTypes: ['seller'],
                    password: 'SecurePass123!'
                },
                'admin@ardonie.com': {
                    id: 3,
                    email: 'admin@ardonie.com',
                    name: 'Super Admin',
                    firstName: 'Super',
                    lastName: 'Admin',
                    userTypes: ['super_admin'],
                    password: 'AdminPass123!'
                },
                'reforiy538@iamtile.com': {
                    id: 4,
                    email: 'reforiy538@iamtile.com',
                    name: 'Test User',
                    firstName: 'Test',
                    lastName: 'User',
                    userTypes: ['buyer'],
                    password: 'gK9.t1|ROnQ52U['
                },
                'multirole@ardonie.com': {
                    id: 5,
                    email: 'multirole@ardonie.com',
                    name: 'Multi Role User',
                    firstName: 'Multi',
                    lastName: 'Role',
                    userTypes: ['buyer', 'seller', 'accountant'],
                    password: 'MultiRole123!'
                },
                'accountant@ardonie.com': {
                    id: 6,
                    email: 'accountant@ardonie.com',
                    name: 'Demo Accountant',
                    firstName: 'Demo',
                    lastName: 'Accountant',
                    userTypes: ['accountant'],
                    password: 'AccountPass123!'
                },
                'firmadmin@ardonie.com': {
                    id: 7,
                    email: 'firmadmin@ardonie.com',
                    name: 'Firm Admin',
                    firstName: 'Firm',
                    lastName: 'Admin',
                    userTypes: ['accounting_firm_admin'],
                    password: 'FirmAdmin123!'
                }
            };

            const user = demoUsers[email.toLowerCase()];
            if (user && user.password === password) {
                console.log('✅ Login successful');

                // Determine redirect URL based on user roles
                const redirectUrl = this.determineRedirectUrl(user.userTypes);

                // Store user session data
                this.storeUserSession(user, rememberMe);

                return {
                    success: true,
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        userTypes: user.userTypes,
                        selectedRole: user.userTypes.length === 1 ? user.userTypes[0] : null
                    },
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
     * Reset password
     */
    async resetPassword(email) {
        try {
            console.log('🔄 Starting password reset for:', email);

            if (!this.validateEmail(email)) {
                throw new Error('Please enter a valid email address');
            }

            // Simulate password reset
            await new Promise(resolve => setTimeout(resolve, 1000));

            const demoEmails = [
                'buyer@ardonie.com',
                'seller@ardonie.com', 
                'admin@ardonie.com',
                'reforiy538@iamtile.com'
            ];

            if (demoEmails.includes(email.toLowerCase())) {
                console.log('✅ Password reset successful');
                return {
                    success: true,
                    message: 'Password reset email sent! (Demo mode - check console for reset link)'
                };
            } else {
                return {
                    success: false,
                    error: 'No account found with this email address'
                };
            }
        } catch (error) {
            console.error('❌ Password reset error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

console.log('📦 SimpleAuthService class defined');

// Make sure we're in a browser environment
if (typeof window !== 'undefined') {
    console.log('🌐 Browser environment detected');
    
    // Make class available globally
    window.SimpleAuthService = SimpleAuthService;
    console.log('✅ SimpleAuthService class exposed globally');
    
    // Create global instance
    try {
        window.simpleAuthService = new SimpleAuthService();
        console.log('✅ Global simpleAuthService instance created');
    } catch (error) {
        console.error('❌ Failed to create global instance:', error);
    }
    
    // Also expose as AuthService for compatibility
    window.AuthService = SimpleAuthService;
    window.authService = window.simpleAuthService;
    console.log('✅ Compatibility aliases created');
} else {
    console.log('📦 Node.js environment detected');
}

console.log('🎉 Simplified auth service loading completed');
