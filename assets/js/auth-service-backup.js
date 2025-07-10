/**
 * Secure Authentication Service for Ardonie Capital
 * Updated to use Supabase for database connectivity
 * Maintains backward compatibility with existing registration forms
 */

class AuthService {
    constructor() {
        this.apiBase = '/api/auth'; // Will be configured based on environment
        this.tokenKey = 'ardonie_auth_token';
        this.userKey = 'ardonie_user_data';
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.csrfToken = null;
        this.supabase = null;

        // Initialize Supabase
        this.initSupabase();

        // Initialize CSRF token
        this.initCSRF();

        // Set up session timeout monitoring (but not on auth pages)
        this.conditionallySetupSessionMonitoring();
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
     * Initialize CSRF protection
     */
    async initCSRF() {
        try {
            // In production, this would fetch from server
            // For now, generate a client-side token (temporary solution)
            this.csrfToken = this.generateCSRFToken();
            
            // Add CSRF token to all forms
            this.addCSRFToForms();
        } catch (error) {
            console.error('Failed to initialize CSRF protection:', error);
        }
    }

    /**
     * Generate CSRF token (temporary client-side solution)
     */
    generateCSRFToken() {
        return 'csrf_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    /**
     * Add CSRF tokens to all forms
     */
    addCSRFToForms() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            // Remove existing CSRF input if present
            const existingCSRF = form.querySelector('input[name="csrf_token"]');
            if (existingCSRF) {
                existingCSRF.remove();
            }

            // Add new CSRF input
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = 'csrf_token';
            csrfInput.value = this.csrfToken;
            form.appendChild(csrfInput);
        });
    }

    /**
     * Encrypt data before storing (simple XOR encryption for demo)
     */
    encryptData(data, key = 'ardonie_secret_key') {
        const jsonString = JSON.stringify(data);
        let encrypted = '';
        for (let i = 0; i < jsonString.length; i++) {
            encrypted += String.fromCharCode(
                jsonString.charCodeAt(i) ^ key.charCodeAt(i % key.length)
            );
        }
        return btoa(encrypted);
    }

    /**
     * Decrypt stored data
     */
    decryptData(encryptedData, key = 'ardonie_secret_key') {
        try {
            const encrypted = atob(encryptedData);
            let decrypted = '';
            for (let i = 0; i < encrypted.length; i++) {
                decrypted += String.fromCharCode(
                    encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length)
                );
            }
            return JSON.parse(decrypted);
        } catch (error) {
            console.error('Failed to decrypt data:', error);
            return null;
        }
    }

    /**
     * Secure storage wrapper
     */
    secureStore(key, data) {
        try {
            const encrypted = this.encryptData(data);
            localStorage.setItem(key, encrypted);
            return true;
        } catch (error) {
            console.error('Failed to store data securely:', error);
            return false;
        }
    }

    /**
     * Secure retrieval wrapper
     */
    secureRetrieve(key) {
        try {
            const encrypted = localStorage.getItem(key);
            if (!encrypted) return null;
            return this.decryptData(encrypted);
        } catch (error) {
            console.error('Failed to retrieve data securely:', error);
            return null;
        }
    }

    /**
     * Validate password strength
     */
    validatePassword(password) {
        const errors = [];

        // Lenient minimum length (6-8 characters)
        if (password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        }

        // Require at least 2 of the 4 character types (more flexible)
        let characterTypes = 0;
        let availableTypes = [];

        if (/[A-Z]/.test(password)) {
            characterTypes++;
            availableTypes.push('uppercase letter');
        }

        if (/[a-z]/.test(password)) {
            characterTypes++;
            availableTypes.push('lowercase letter');
        }

        if (/\d/.test(password)) {
            characterTypes++;
            availableTypes.push('number');
        }

        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            characterTypes++;
            availableTypes.push('special character');
        }

        // Require at least 2 character types
        if (characterTypes < 2) {
            const missingCount = 2 - characterTypes;
            const allTypes = ['uppercase letter', 'lowercase letter', 'number', 'special character'];
            const missingTypes = allTypes.filter(type => !availableTypes.includes(type));
            errors.push(`Password must contain at least 2 different character types (e.g., ${missingTypes.slice(0, 2).join(' and ')})`);
        }

        // Check for very common weak patterns only
        const weakPatterns = [
            /(.)\1{3,}/, // 4+ repeated characters (more lenient)
            /^.*123456.*$/i, // Contains full sequence 123456
            /^.*654321.*$/i, // Contains full sequence 654321
            /^.*qwerty.*$/i, // Contains qwerty
            /^.*password.*$/i, // Contains password
            /^.*admin.*$/i, // Contains admin
            /^.*letmein.*$/i, // Contains letmein
        ];

        for (const pattern of weakPatterns) {
            if (pattern.test(password)) {
                errors.push('Password contains common weak patterns');
                break;
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            strength: this.calculatePasswordStrength(password)
        };
    }

    /**
     * Calculate password strength score
     */
    calculatePasswordStrength(password) {
        let score = 0;

        // Length bonus (more generous, starting from 6 characters)
        if (password.length >= 6) score += 30;
        if (password.length >= 8) score += 20;
        if (password.length >= 10) score += 15;
        if (password.length >= 12) score += 10;

        // Character variety bonus (more generous)
        if (/[a-z]/.test(password)) score += 20;
        if (/[A-Z]/.test(password)) score += 20;
        if (/\d/.test(password)) score += 20;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 25;

        // Bonus for meeting minimum requirements (2 character types)
        let characterTypes = 0;
        if (/[a-z]/.test(password)) characterTypes++;
        if (/[A-Z]/.test(password)) characterTypes++;
        if (/\d/.test(password)) characterTypes++;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) characterTypes++;

        if (characterTypes >= 2) score += 15;

        return Math.min(score, 100);
    }

    /**
     * Generate secure session token
     */
    generateSessionToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Login user with Supabase authentication
     */
    async login(email, password, rememberMe = false) {
        try {
            console.log('🚀 Starting login process for:', email);

            // Input validation
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            if (!this.validateEmail(email)) {
                throw new Error('Please enter a valid email address');
            }

            // Use Supabase if available, otherwise fallback to localStorage
            if (this.supabase) {
                console.log('📡 Using Supabase for login');
                return await this.loginWithSupabase(email, password, rememberMe);
            } else {
                console.log('💾 Falling back to localStorage login');
                return await this.loginWithLocalStorage(email, password, rememberMe);
            }
        } catch (error) {
            console.error('❌ Login failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Login with Supabase
     */
    async loginWithSupabase(email, password, rememberMe = false) {
        try {
            console.log('🔐 Authenticating with Supabase...');

            const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (authError) {
                throw new Error(authError.message);
            }

            console.log('✅ Supabase authentication successful');

            // Get user profile from profiles table (FIXED QUERY)
            let profileData = null;
            if (authData.user) {
                console.log('👤 Fetching user profile...');

                const { data: profile, error: profileError } = await this.supabase
                    .from('profiles')
                    .select('*')
                    .eq('user_id', authData.user.id)
                    .single();

                if (profileError) {
                    if (profileError.code === 'PGRST116') {
                        console.warn('⚠️ No profile found for user - will create one');
                        // Create missing profile
                        const newProfile = {
                            user_id: authData.user.id,
                            first_name: authData.user.user_metadata?.first_name || '',
                            last_name: authData.user.user_metadata?.last_name || '',
                            role: 'buyer',
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        };

                        const { data: createdProfile, error: createError } = await this.supabase
                            .from('profiles')
                            .insert(newProfile)
                            .select()
                            .single();

                        if (createError) {
                            console.error('❌ Failed to create profile:', createError.message);
                        } else {
                            profileData = createdProfile;
                            console.log('✅ Profile created successfully');
                        }
                    } else {
                        console.warn('⚠️ Could not fetch profile:', profileError.message);
                    }
                } else {
                    profileData = profile;
                    console.log('✅ Profile fetched successfully');
                }
            }

            // Generate secure session token
            const sessionToken = this.generateSessionToken();
            const userData = {
                id: authData.user.id,
                email: authData.user.email,
                name: profileData ? `${profileData.first_name} ${profileData.last_name}` : authData.user.email,
                firstName: profileData?.first_name || authData.user.user_metadata?.first_name || '',
                lastName: profileData?.last_name || authData.user.user_metadata?.last_name || '',
                userTypes: profileData?.role ? [profileData.role] : ['buyer'],
                sessionToken: sessionToken,
                loginTime: Date.now(),
                lastActivity: Date.now(),
                supabaseUser: true,
                profile: profileData
            };

            // Store encrypted user data
            this.secureStore(this.tokenKey, sessionToken);
            this.secureStore(this.userKey, userData);

            // Set session expiry
            if (!rememberMe) {
                setTimeout(() => {
                    this.logout();
                }, this.sessionTimeout);
            }

            console.log('🎉 Login completed successfully!');

            return {
                success: true,
                user: userData,
                redirectUrl: this.getRedirectUrlForUserTypes(userData.userTypes)
            };
        } catch (error) {
            console.error('❌ Supabase login error:', error);
            throw error;
        }
    }

    /**
     * Fallback login with localStorage
     */
    async loginWithLocalStorage(email, password, rememberMe = false) {
        console.log('💾 Using localStorage fallback for login');

        // For demo purposes, simulate server authentication
        const loginData = await this.simulateServerLogin(email, password);

        if (loginData.success) {
            // Generate secure session token
            const sessionToken = this.generateSessionToken();
            const userData = {
                id: loginData.user.id,
                email: loginData.user.email,
                name: loginData.user.name,
                firstName: loginData.user.firstName,
                lastName: loginData.user.lastName,
                userTypes: loginData.user.userTypes || ['buyer'],
                sessionToken: sessionToken,
                loginTime: Date.now(),
                lastActivity: Date.now(),
                supabaseUser: false
            };

            // Store encrypted user data
            this.secureStore(this.tokenKey, sessionToken);
            this.secureStore(this.userKey, userData);

            // Set session expiry
            if (!rememberMe) {
                setTimeout(() => {
                    this.logout();
                }, this.sessionTimeout);
            }

            return {
                success: true,
                user: userData,
                redirectUrl: this.getRedirectUrlForUserTypes(userData.userTypes)
            };
        } else {
            throw new Error(loginData.message || 'Invalid credentials');
        }
    }

    /**
     * Simulate server login (replace with actual API call)
     */
    async simulateServerLogin(email, password) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check for registered user first
        const registeredUser = this.secureRetrieve(this.userKey);
        if (registeredUser && registeredUser.email.toLowerCase() === email.toLowerCase() && registeredUser.password === password) {
            return {
                success: true,
                user: {
                    id: registeredUser.id,
                    email: registeredUser.email,
                    name: registeredUser.name,
                    firstName: registeredUser.firstName,
                    lastName: registeredUser.lastName,
                    userTypes: registeredUser.userTypes || ['buyer']
                }
            };
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
            return {
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    userTypes: user.userTypes
                }
            };
        }

        return {
            success: false,
            message: 'Invalid email or password'
        };
    }

    /**
     * Get redirect URL based on user role
     */
    getRedirectUrl(role) {
        const redirectUrls = {
            'buyer': '/dashboard/buyer-dashboard.html',
            'seller': '/dashboard/seller-dashboard.html',
            'admin': '/dashboard/admin-dashboard.html',
            'accountant': '/portals/accountant-portal.html',
            'attorney': '/portals/attorney-portal.html',
            'lender': '/portals/lender-portal.html'
        };

        return redirectUrls[role] || '/dashboard/buyer-dashboard.html';
    }

    /**
     * Get redirect URL based on user types (prioritize seller over buyer)
     */
    getRedirectUrlForUserTypes(userTypes) {
        if (!userTypes || !Array.isArray(userTypes)) {
            return '/dashboard/buyer-dashboard.html';
        }

        // Priority order: seller > buyer > admin
        if (userTypes.includes('seller')) {
            return '/dashboard/seller-dashboard.html';
        } else if (userTypes.includes('buyer')) {
            return '/dashboard/buyer-dashboard.html';
        } else if (userTypes.includes('admin')) {
            return '/dashboard/admin-dashboard.html';
        }

        return '/dashboard/buyer-dashboard.html';
    }

    /**
     * Reset password using Supabase
     */
    async resetPassword(email) {
        try {
            console.log('🔄 Starting password reset for:', email);

            if (!this.validateEmail(email)) {
                throw new Error('Please enter a valid email address');
            }

            // Use Supabase if available, otherwise fallback to demo mode
            if (this.supabase) {
                console.log('📡 Using Supabase for password reset');
                return await this.resetPasswordWithSupabase(email);
            } else {
                console.log('💾 Falling back to demo password reset');
                return await this.resetPasswordDemo(email);
            }
        } catch (error) {
            console.error('❌ Password reset error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Reset password with Supabase
     */
    async resetPasswordWithSupabase(email) {
        try {
            const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password.html`
            });

            if (error) {
                throw new Error(error.message);
            }

            console.log('✅ Password reset email sent successfully');
            return {
                success: true,
                message: 'Password reset email sent! Please check your inbox and follow the instructions.'
            };
        } catch (error) {
            console.error('❌ Supabase password reset error:', error);
            throw error;
        }
    }

    /**
     * Demo password reset (for testing without email)
     */
    async resetPasswordDemo(email) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if email exists in demo users
        const demoEmails = [
            'buyer@ardonie.com',
            'seller@ardonie.com',
            'admin@ardonie.com',
            'reforiy538@iamtile.com'
        ];

        if (demoEmails.includes(email.toLowerCase())) {
            console.log('✅ Demo password reset successful');
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
    }

    /**
     * Validate email format
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        const token = this.secureRetrieve(this.tokenKey);
        const userData = this.secureRetrieve(this.userKey);

        if (!token || !userData) {
            return false;
        }

        // Check session timeout
        const now = Date.now();
        const lastActivity = userData.lastActivity || userData.loginTime;

        if (now - lastActivity > this.sessionTimeout) {
            // Clear expired session data but don't redirect
            // Let the session monitoring handle the redirect logic
            localStorage.removeItem(this.tokenKey);
            localStorage.removeItem(this.userKey);
            sessionStorage.clear();
            return false;
        }

        // Update last activity
        userData.lastActivity = now;
        this.secureStore(this.userKey, userData);

        return true;
    }

    /**
     * Get current user data
     */
    getCurrentUser() {
        if (!this.isAuthenticated()) {
            return null;
        }
        
        return this.secureRetrieve(this.userKey);
    }

    /**
     * Logout user
     */
    logout() {
        console.log('Logout called from:', new Error().stack);

        // Clear stored data
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);

        // Clear any other session data
        sessionStorage.clear();

        // Only redirect to login if not already on an auth page
        const authPages = ['/auth/login.html', '/auth/register.html'];
        const currentPath = window.location.pathname;
        const isOnAuthPage = authPages.some(page => currentPath.endsWith(page));

        console.log('Logout check:', {
            currentPath,
            isOnAuthPage,
            authPages,
            willRedirect: !isOnAuthPage
        });

        if (!isOnAuthPage) {
            console.log('Logout: Redirecting to login page');
            window.location.href = '/auth/login.html';
        } else {
            console.log('Logout: No redirect - already on auth page');
        }
    }

    /**
     * Conditionally setup session monitoring (skip on auth pages)
     */
    conditionallySetupSessionMonitoring() {
        // Check if we're on an auth page
        const authPages = ['/auth/login.html', '/auth/register.html'];
        const currentPath = window.location.pathname;
        const isOnAuthPage = authPages.some(page => currentPath.endsWith(page));

        if (isOnAuthPage) {
            console.log('AuthService: Skipping session monitoring setup on auth page:', currentPath);
            return;
        }

        console.log('AuthService: Setting up session monitoring on non-auth page:', currentPath);
        this.setupSessionMonitoring();
    }

    /**
     * Setup session monitoring
     */
    setupSessionMonitoring() {
        // Check session every minute
        setInterval(() => {
            // Don't redirect if user is on auth pages (login or register)
            const authPages = ['/auth/login.html', '/auth/register.html'];
            const currentPath = window.location.pathname;
            const isOnAuthPage = authPages.some(page => currentPath.endsWith(page));
            const isAuthenticated = this.isAuthenticated();

            // Debug logging
            console.log('Session Monitor Check:', {
                currentPath,
                isOnAuthPage,
                isAuthenticated,
                authPages,
                wouldRedirect: !isAuthenticated && !isOnAuthPage
            });

            if (!isAuthenticated && !isOnAuthPage) {
                console.log('Session Monitor: Redirecting to login due to no authentication');
                this.logout();
            } else {
                console.log('Session Monitor: No redirect needed');
            }
        }, 60000);

        // Update activity on user interaction
        ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
            document.addEventListener(event, () => {
                const userData = this.secureRetrieve(this.userKey);
                if (userData) {
                    userData.lastActivity = Date.now();
                    this.secureStore(this.userKey, userData);
                }
            }, { passive: true });
        });
    }

    /**
     * Register new user using Supabase
     */
    async register(userData) {
        try {
            console.log('🚀 Starting registration process for:', userData.email);

            // Validate required fields
            const required = ['firstName', 'lastName', 'email', 'password', 'confirmPassword'];
            for (const field of required) {
                if (!userData[field]) {
                    throw new Error(`${field} is required`);
                }
            }

            // Validate email
            if (!this.validateEmail(userData.email)) {
                throw new Error('Please enter a valid email address');
            }

            // Validate password
            const passwordValidation = this.validatePassword(userData.password);
            if (!passwordValidation.isValid) {
                throw new Error(passwordValidation.errors.join('. '));
            }

            // Check password confirmation
            if (userData.password !== userData.confirmPassword) {
                throw new Error('Passwords do not match');
            }

            // Use Supabase if available, otherwise fallback to localStorage
            if (this.supabase) {
                console.log('📡 Using Supabase for registration');
                return await this.registerWithSupabase(userData);
            } else {
                console.log('💾 Falling back to localStorage registration');
                return await this.registerWithLocalStorage(userData);
            }
        } catch (error) {
            console.error('❌ Registration failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Register user with Supabase
     */
    async registerWithSupabase(userData) {
        try {
            console.log('🔐 Creating Supabase auth user...');

            // Create auth user
            const { data: authData, error: authError } = await this.supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                    data: {
                        first_name: userData.firstName,
                        last_name: userData.lastName,
                        role: userData.userType || 'buyer'
                    }
                }
            });

            if (authError) {
                throw new Error(authError.message);
            }

            console.log('✅ Auth user created:', authData.user?.id);

            // Create user profile
            if (authData.user) {
                console.log('👤 Creating user profile...');

                const profileData = {
                    user_id: authData.user.id,
                    first_name: userData.firstName,
                    last_name: userData.lastName,
                    role: userData.userType || 'buyer',
                    phone: userData.phone || '',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };

                // Add business information if user is a seller
                if (userData.userTypes && userData.userTypes.includes('seller') && userData.businessInfo) {
                    profileData.company = userData.businessInfo.businessName || '';
                    profileData.location = userData.businessInfo.businessLocation || userData.location || '';
                    profileData.business_details = {
                        business_type: userData.businessInfo.businessType,
                        industry: userData.businessInfo.industry,
                        annual_revenue: userData.businessInfo.annualRevenue,
                        employee_count: userData.businessInfo.employeeCount,
                        description: userData.businessInfo.description
                    };
                } else {
                    profileData.company = userData.company || '';
                    profileData.location = userData.location || '';
                }

                const { data: profileResult, error: profileError } = await this.supabase
                    .from('profiles')
                    .insert(profileData)
                    .select();

                if (profileError) {
                    console.warn('⚠️ Profile creation failed:', profileError.message);
                    // Don't fail registration if profile creation fails
                } else {
                    console.log('✅ Profile created successfully');
                }
            }

            // Store session data locally for immediate use
            const userForStorage = {
                id: authData.user?.id,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                userTypes: userData.userTypes || ['buyer'],
                loginTime: Date.now(),
                lastActivity: Date.now(),
                supabaseUser: true
            };

            this.secureStore(this.userKey, userForStorage);
            this.secureStore(this.tokenKey, 'supabase_' + Date.now());

            console.log('🎉 Registration completed successfully!');

            return {
                success: true,
                message: 'Registration successful! Please check your email to verify your account.',
                user: userForStorage
            };
        } catch (error) {
            console.error('❌ Supabase registration error:', error);
            throw error;
        }
    }

    /**
     * Fallback registration with localStorage
     */
    async registerWithLocalStorage(userData) {
        console.log('💾 Using localStorage fallback for registration');

        // Simulate server registration
        const registrationResult = await this.simulateServerRegistration(userData);

        if (registrationResult.success) {
            // Store the user data for login
            const userForStorage = {
                ...registrationResult.user,
                firstName: userData.firstName,
                lastName: userData.lastName,
                userTypes: userData.userTypes || ['buyer'],
                password: userData.password, // Store password for demo login
                loginTime: Date.now(),
                lastActivity: Date.now(),
                supabaseUser: false
            };

            // Store user credentials for demo login
            this.secureStore(this.userKey, userForStorage);
            this.secureStore(this.tokenKey, 'demo_token_' + Date.now());

            return {
                success: true,
                message: 'Registration successful! You are now logged in.',
                user: userForStorage
            };
        } else {
            throw new Error(registrationResult.message || 'Registration failed');
        }
    }

    /**
     * Simulate server registration
     */
    async simulateServerRegistration(userData) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Check if email already exists (demo check)
        const existingEmails = ['existing@example.com', 'test@test.com'];
        if (existingEmails.includes(userData.email.toLowerCase())) {
            return {
                success: false,
                message: 'An account with this email already exists'
            };
        }

        return {
            success: true,
            user: {
                id: Date.now(), // Generate demo ID
                email: userData.email,
                name: `${userData.firstName} ${userData.lastName}`,
                userTypes: userData.userTypes || ['buyer'], // Store user types array
                businessInfo: userData.businessInfo || null
            }
        };
    }

    /**
     * Google OAuth Sign In
     */
    async signInWithGoogle(userType = 'buyer') {
        try {
            // Store user type for post-auth processing
            localStorage.setItem('pendingUserType', userType);

            // For now, simulate Google OAuth
            // In production, this would integrate with Supabase Google provider
            const mockGoogleUser = {
                email: 'demo@google.com',
                name: 'Google User',
                picture: 'https://via.placeholder.com/150',
                sub: 'google_' + Date.now()
            };

            // Create user profile
            const userData = {
                email: mockGoogleUser.email,
                firstName: mockGoogleUser.name.split(' ')[0],
                lastName: mockGoogleUser.name.split(' ')[1] || '',
                userType: userType,
                authProvider: 'google',
                avatar: mockGoogleUser.picture
            };

            // Register the user
            const result = await this.register(userData);

            if (result.success) {
                // Clean up pending user type
                localStorage.removeItem('pendingUserType');

                return {
                    success: true,
                    user: result.user,
                    isNewUser: true
                };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Google sign-in error:', error);
            return {
                success: false,
                error: error.message || 'Google sign-in failed'
            };
        }
    }

    /**
     * Handle OAuth callback
     */
    async handleOAuthCallback() {
        try {
            const pendingUserType = localStorage.getItem('pendingUserType') || 'buyer';

            // In production, this would handle the actual OAuth callback
            // For now, we'll simulate successful authentication

            const user = {
                id: Date.now(),
                email: 'oauth@example.com',
                name: 'OAuth User',
                role: pendingUserType
            };

            // Store session
            this.storeSession(user);

            // Clean up
            localStorage.removeItem('pendingUserType');

            return {
                success: true,
                user: user
            };
        } catch (error) {
            console.error('OAuth callback error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Ensure global scope access
console.log('📦 AuthService class defined, setting up global access...');

// Make sure we're in a browser environment
if (typeof window !== 'undefined') {
    console.log('🌐 Browser environment detected');

    // Make class available globally
    window.AuthService = AuthService;
    console.log('✅ AuthService class exposed globally');

    // Create global instance
    try {
        window.authService = new AuthService();
        console.log('✅ Global authService instance created successfully');
    } catch (error) {
        console.error('❌ Failed to create global AuthService instance:', error);
        // Try to provide more details about the error
        console.error('Error details:', error.stack);
    }
} else {
    console.log('📦 Node.js environment detected');
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthService;
}

console.log('🎉 AuthService setup completed');
