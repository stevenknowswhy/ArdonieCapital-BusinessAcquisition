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
                    name: 'Admin User',
                    firstName: 'Admin',
                    lastName: 'User',
                    userTypes: ['admin'],
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
                }
            };

            const user = demoUsers[email.toLowerCase()];
            if (user && user.password === password) {
                console.log('✅ Login successful');
                return {
                    success: true,
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        userTypes: user.userTypes
                    },
                    redirectUrl: '/dashboard/'
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
