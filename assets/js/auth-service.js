/**
 * Secure Authentication Service for Ardonie Capital
 * Implements client-side authentication with proper security measures
 */

class AuthService {
    constructor() {
        this.apiBase = '/api/auth'; // Will be configured based on environment
        this.tokenKey = 'ardonie_auth_token';
        this.userKey = 'ardonie_user_data';
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.csrfToken = null;
        
        // Initialize CSRF token
        this.initCSRF();
        
        // Set up session timeout monitoring
        this.setupSessionMonitoring();
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
        
        if (password.length < 12) {
            errors.push('Password must be at least 12 characters long');
        }
        
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        
        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }
        
        // Check for common weak patterns
        const weakPatterns = [
            /(.)\1{2,}/, // Repeated characters
            /123456|654321|qwerty|password|admin/i, // Common sequences
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
        
        // Length bonus
        score += Math.min(password.length * 2, 20);
        
        // Character variety bonus
        if (/[a-z]/.test(password)) score += 5;
        if (/[A-Z]/.test(password)) score += 5;
        if (/\d/.test(password)) score += 5;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 10;
        
        // Complexity bonus
        if (password.length >= 16) score += 10;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?].*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 5;
        
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
     * Login user with enhanced security
     */
    async login(email, password, rememberMe = false) {
        try {
            // Input validation
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            if (!this.validateEmail(email)) {
                throw new Error('Please enter a valid email address');
            }

            // For demo purposes, simulate server authentication
            // In production, this would make an actual API call
            const loginData = await this.simulateServerLogin(email, password);

            if (loginData.success) {
                // Generate secure session token
                const sessionToken = this.generateSessionToken();
                const userData = {
                    id: loginData.user.id,
                    email: loginData.user.email,
                    name: loginData.user.name,
                    role: loginData.user.role,
                    sessionToken: sessionToken,
                    loginTime: Date.now(),
                    lastActivity: Date.now()
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
                    redirectUrl: this.getRedirectUrl(userData.role)
                };
            } else {
                throw new Error(loginData.message || 'Invalid credentials');
            }
        } catch (error) {
            console.error('Login failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Simulate server login (replace with actual API call)
     */
    async simulateServerLogin(email, password) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Demo users for testing
        const demoUsers = {
            'buyer@ardonie.com': {
                id: 1,
                email: 'buyer@ardonie.com',
                name: 'Demo Buyer',
                role: 'buyer',
                password: 'SecurePass123!'
            },
            'seller@ardonie.com': {
                id: 2,
                email: 'seller@ardonie.com',
                name: 'Demo Seller',
                role: 'seller',
                password: 'SecurePass123!'
            },
            'admin@ardonie.com': {
                id: 3,
                email: 'admin@ardonie.com',
                name: 'Admin User',
                role: 'admin',
                password: 'AdminPass123!'
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
                    role: user.role
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
            this.logout();
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
        // Clear stored data
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        
        // Clear any other session data
        sessionStorage.clear();
        
        // Redirect to login
        window.location.href = '/auth/login.html';
    }

    /**
     * Setup session monitoring
     */
    setupSessionMonitoring() {
        // Check session every minute
        setInterval(() => {
            if (!this.isAuthenticated() && window.location.pathname !== '/auth/login.html') {
                this.logout();
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
     * Register new user
     */
    async register(userData) {
        try {
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

            // Simulate server registration
            const registrationResult = await this.simulateServerRegistration(userData);
            
            if (registrationResult.success) {
                return {
                    success: true,
                    message: 'Registration successful! Please check your email to verify your account.',
                    user: registrationResult.user
                };
            } else {
                throw new Error(registrationResult.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration failed:', error);
            return {
                success: false,
                error: error.message
            };
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
                role: 'buyer' // Default role
            }
        };
    }
}

// Initialize global auth service
window.AuthService = new AuthService();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthService;
}
