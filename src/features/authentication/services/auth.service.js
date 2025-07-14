
// GDPR Compliance utilities
const GDPRCompliance = {
    requestConsent: (purpose) => {
        return new Promise((resolve) => {
            // Implementation for consent request
            const consent = confirm(`Do you consent to data processing for ${purpose}?`);
            resolve(consent);
        });
    },
    
    deleteUserData: (userId) => {
        // Implementation for right to erasure
        console.log(`Deleting data for user ${userId}`);
    },
    
    exportUserData: (userId) => {
        // Implementation for data portability
        console.log(`Exporting data for user ${userId}`);
    }
};


// Password strength requirements
const validatePassword = (password) => {
    const minLength = 12;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
};

/**
 * Core Authentication Service
 * Handles user authentication, registration, and session management
 */

import { passwordValidator } from './password-validator.service.js';
import { sessionManager } from './session-manager.service.js';
import { cryptoUtils } from '../utils/crypto.utils.js';
import { supabaseService } from '../../../shared/services/supabase/index.js';

export class AuthService {
    constructor() {
        this.apiBase = '/api/auth';
        this.tokenKey = 'ardonie_auth_token';
        this.userKey = 'ardonie_user_data';
        this.csrfToken = null;

        // Initialize CSRF protection
        this.initCSRF();
    }

    /**
     * Initialize CSRF protection
     */
    async initCSRF() {
        try {
            this.csrfToken = cryptoUtils.generateCSRFToken();
            this.addCSRFToForms();
        } catch (error) {
            console.error('Failed to initialize CSRF protection:', error);
        }
    }

    /**
     * Add CSRF tokens to all forms
     */
    addCSRFToForms() {
        // Skip in test environment or when document is not available
        if (typeof document === 'undefined') {
            return;
        }

        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            // Remove existing CSRF input if present
            const existingInput = form.querySelector('input[name="csrf_token"]');
            if (existingInput) {
                existingInput.remove();
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
     * Login user with enhanced security
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {boolean} rememberMe - Whether to remember the user
     * @returns {Promise<Object>} Login result
     */
    async login(email, password, rememberMe = false) {
        try {
            // Input validation
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            if (!this.isValidEmail(email)) {
                throw new Error('Please enter a valid email address');
            }

            // Prepare login data
            const loginData = {
                email: email.toLowerCase().trim(),
                password: password,
                rememberMe: rememberMe,
                csrf_token: this.csrfToken
            };

            // Use Supabase authentication
            const response = await supabaseService.signIn(email, password);

            if (response.success) {
                // Extract user data from Supabase response
                const user = response.data.user;
                const session = response.data.session;

                // Get user profile from profiles table
                const profileResponse = await supabaseService.select('profiles', {
                    eq: { user_id: user.id }
                });

                let userProfile = null;
                if (profileResponse.success && profileResponse.data.length > 0) {
                    userProfile = profileResponse.data[0];
                }

                // Create user object compatible with existing system
                const userData = {
                    id: user.id,
                    email: user.email,
                    firstName: userProfile?.first_name || '',
                    lastName: userProfile?.last_name || '',
                    role: userProfile?.role || 'buyer',
                    verified: user.email_confirmed_at !== null,
                    createdAt: user.created_at
                };

                // Start session
                sessionManager.startSession(userData, rememberMe);

                // Store authentication data securely
                await this.storeAuthData(session.access_token, userData);

                // Determine redirect URL based on user role
                const redirectUrl = this.getRedirectUrlForRole(userData.role);

                console.log('Login successful for:', email, 'Role:', userData.role);
                return {
                    success: true,
                    user: userData,
                    token: session.access_token,
                    message: 'Login successful',
                    redirectUrl: redirectUrl
                };
            } else {
                throw new Error(response.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    /**
     * Register new user with validation
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} Registration result
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

            // Validate email format
            if (!this.isValidEmail(userData.email)) {
                throw new Error('Please enter a valid email address');
            }

            // Validate password strength
            const passwordValidation = passwordValidator.validatePassword(userData.password);
            if (!passwordValidation.isValid) {
                throw new Error(passwordValidation.errors[0]);
            }

            // Validate password confirmation
            const confirmValidation = passwordValidator.validatePasswordConfirmation(
                userData.password,
                userData.confirmPassword
            );
            if (!confirmValidation.isValid) {
                throw new Error(confirmValidation.errors[0]);
            }

            // Validate seller-specific fields if user is registering as seller
            if (userData.userType === 'seller' && userData.businessInfo) {
                const sellerRequired = ['businessName', 'businessType', 'businessLocation'];
                for (const field of sellerRequired) {
                    if (!userData.businessInfo[field]) {
                        throw new Error(`${field} is required for sellers`);
                    }
                }
            }

            // Prepare registration data
            const registrationData = {
                ...userData,
                email: userData.email.toLowerCase().trim(),
                csrf_token: this.csrfToken
            };

            // Use Supabase authentication
            const response = await supabaseService.signUp(
                userData.email,
                userData.password,
                {
                    first_name: userData.firstName,
                    last_name: userData.lastName,
                    role: userData.userType || 'buyer',
                    company: userData.company || '',
                    phone: userData.phone || ''
                }
            );

            if (response.success) {
                // Create user profile in profiles table
                if (response.data.user) {
                    const profileData = {
                        user_id: response.data.user.id,
                        first_name: userData.firstName,
                        last_name: userData.lastName,
                        role: userData.userType || 'buyer',
                        phone: userData.phone || '',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };

                    // Add seller-specific business information
                    if (userData.userType === 'seller' && userData.businessInfo) {
                        profileData.company = userData.businessInfo.businessName;
                        profileData.location = userData.businessInfo.businessLocation;
                        // Store additional business info in a JSON field if available
                        profileData.business_details = {
                            business_type: userData.businessInfo.businessType,
                            years_in_business: userData.businessInfo.yearsInBusiness,
                            annual_revenue: userData.businessInfo.annualRevenue,
                            employee_count: userData.businessInfo.employeeCount,
                            reason_for_selling: userData.businessInfo.reasonForSelling
                        };
                    } else {
                        profileData.company = userData.company || '';
                    }

                    await supabaseService.insert('profiles', profileData);
                }

                console.log('Registration successful for:', userData.email);
                return {
                    success: true,
                    message: 'Registration successful. Please check your email to verify your account.',
                    user: {
                        id: response.data.user?.id,
                        email: userData.email,
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        role: userData.userType || 'buyer',
                        verified: false
                    }
                };
            } else {
                throw new Error(response.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    /**
     * Logout user and clean up session
     */
    async logout() {
        try {
            // Sign out from Supabase
            await supabaseService.signOut();

            // End session
            sessionManager.endSession();

            // Clear stored data
            this.clearAuthData();

            // Redirect to home page
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
            // Force redirect even if cleanup fails
            window.location.href = '/';
        }
    }

    /**
     * Get redirect URL based on user role
     * @param {string} role - User role (buyer, seller, admin, etc.)
     * @returns {string} Redirect URL
     */
    getRedirectUrlForRole(role) {
        const roleRedirects = {
            'seller': '../dashboard/seller-dashboard.html',
            'buyer': '../dashboard/buyer-dashboard.html',
            'admin': '../dashboard/admin-dashboard.html',
            'vendor': '../portals/vendor-portal.html'
        };

        return roleRedirects[role] || '../dashboard/buyer-dashboard.html';
    }

    /**
     * Check if user is authenticated
     * @returns {Promise<boolean>} True if user is authenticated
     */
    async isAuthenticated() {
        try {
            const sessionResponse = await supabaseService.getCurrentSession();
            return sessionResponse.success && !!sessionResponse.session;
        } catch (error) {
            console.error('Authentication check error:', error);
            return false;
        }
    }

    /**
     * Get current authenticated user with role information
     * @returns {Promise<Object|null>} User object with role or null if not authenticated
     */
    async getCurrentUser() {
        try {
            const sessionResponse = await supabaseService.getCurrentSession();
            if (!sessionResponse.success || !sessionResponse.session) {
                return null;
            }

            const user = sessionResponse.session.user;

            // Get user profile from profiles table
            const profileResponse = await supabaseService.select('profiles', {
                eq: { user_id: user.id }
            });

            let userProfile = null;
            if (profileResponse.success && profileResponse.data.length > 0) {
                userProfile = profileResponse.data[0];
            }

            return {
                id: user.id,
                email: user.email,
                firstName: userProfile?.first_name || '',
                lastName: userProfile?.last_name || '',
                role: userProfile?.role || 'buyer',
                verified: user.email_confirmed_at !== null,
                createdAt: user.created_at
            };
        } catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    }

    /**
     * Get current user data
     * @returns {Promise<Object|null>} User data or null
     */
    async getCurrentUser() {
        try {
            const userResponse = await supabaseService.getCurrentUser();
            if (!userResponse.success || !userResponse.user) {
                return null;
            }

            const user = userResponse.user;

            // Get user profile from profiles table
            const profileResponse = await supabaseService.select('profiles', {
                eq: { user_id: user.id }
            });

            let userProfile = null;
            if (profileResponse.success && profileResponse.data.length > 0) {
                userProfile = profileResponse.data[0];
            }

            // Return user object compatible with existing system
            return {
                id: user.id,
                email: user.email,
                firstName: userProfile?.first_name || '',
                lastName: userProfile?.last_name || '',
                role: userProfile?.role || 'buyer',
                verified: user.email_confirmed_at !== null,
                createdAt: user.created_at
            };
        } catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    }

    /**
     * Get stored authentication token
     * @returns {string|null} Auth token or null
     */
    getToken() {
        try {
            return localStorage.getItem(this.tokenKey);
        } catch (error) {
            console.error('Failed to retrieve token:', error);
            return null;
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        if (this.csrfToken) {
            headers['X-CSRF-Token'] = this.csrfToken;
        }

        return headers;
    }

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} True if email is valid
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Store authentication data securely
     * @param {string} token - Auth token
     * @param {Object} user - User data
     */
    async storeAuthData(token, user) {
        try {
            // Store token
            localStorage.setItem(this.tokenKey, token);

            // Store user data (encrypted)
            const encryptedUser = await cryptoUtils.encryptData(JSON.stringify(user));
            localStorage.setItem(this.userKey, encryptedUser);
        } catch (error) {
            console.error('Failed to store auth data:', error);
            throw new Error('Failed to store authentication data');
        }
    }

    /**
     * Clear all authentication data
     */
    clearAuthData() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
    }

    /**
     * Simulate server login (replace with actual API call)
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} Login response
     */
    async simulateServerLogin(email, password) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Demo users for testing - browser environment defaults
        const demoUsers = {
            'admin@ardoniecapital.com': {
                password: 'demo123',
                user: {
                    id: 1,
                    email: 'admin@ardoniecapital.com',
                    firstName: 'Admin',
                    lastName: 'User',
                    role: 'admin',
                    verified: true
                }
            },
            'buyer@example.com': {
                password: 'demo123',
                user: {
                    id: 2,
                    email: 'buyer@example.com',
                    firstName: 'John',
                    lastName: 'Buyer',
                    role: 'buyer',
                    verified: true
                }
            },
            'seller@example.com': {
                password: 'demo123',
                user: {
                    id: 3,
                    email: 'seller@example.com',
                    firstName: 'Jane',
                    lastName: 'Seller',
                    role: 'seller',
                    verified: true
                }
            }
        };

        const demoUser = demoUsers[email.toLowerCase()];

        if (demoUser && demoUser.password === password) {
            return {
                success: true,
                user: demoUser.user,
                token: cryptoUtils.generateSecureToken(),
                message: 'Login successful'
            };
        } else {
            return {
                success: false,
                message: 'Invalid email or password'
            };
        }
    }

    /**
     * Simulate server registration (replace with actual API call)
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} Registration response
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

        // Simulate successful registration
        const newUser = {
            id: Date.now(), // Simple ID generation for demo
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.userType || 'buyer',
            verified: false,
            createdAt: new Date().toISOString()
        };

        return {
            success: true,
            user: newUser,
            message: 'Registration successful'
        };
    }

    /**
     * Request password reset
     * @param {string} email - User email
     * @returns {Promise<Object>} Reset request result
     */
    async requestPasswordReset(email) {
        try {
            if (!email || !this.isValidEmail(email)) {
                throw new Error('Please enter a valid email address');
            }

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            return {
                success: true,
                message: 'Password reset instructions have been sent to your email'
            };
        } catch (error) {
            console.error('Password reset request error:', error);
            throw error;
        }
    }

    /**
     * Verify email address
     * @param {string} token - Verification token
     * @returns {Promise<Object>} Verification result
     */
    async verifyEmail(token) {
        try {
            if (!token) {
                throw new Error('Verification token is required');
            }

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            return {
                success: true,
                message: 'Email verified successfully'
            };
        } catch (error) {
            console.error('Email verification error:', error);
            throw error;
        }
    }

    /**
     * Change user password
     * @param {string} currentPassword - Current password
     * @param {string} newPassword - New password
     * @returns {Promise<Object>} Password change result
     */
    async changePassword(currentPassword, newPassword) {
        try {
            if (!currentPassword || !newPassword) {
                throw new Error('Current and new passwords are required');
            }

            // Validate new password strength
            const passwordValidation = passwordValidator.validatePassword(newPassword);
            if (!passwordValidation.isValid) {
                throw new Error(passwordValidation.errors[0]);
            }

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            return {
                success: true,
                message: 'Password changed successfully'
            };
        } catch (error) {
            console.error('Password change error:', error);
            throw error;
        }
    }

    /**
     * Update user profile
     * @param {Object} profileData - Profile data to update
     * @returns {Promise<Object>} Update result
     */
    async updateProfile(profileData) {
        try {
            if (!profileData) {
                throw new Error('Profile data is required');
            }

            // Validate email if provided
            if (profileData.email && !this.isValidEmail(profileData.email)) {
                throw new Error('Please enter a valid email address');
            }

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            return {
                success: true,
                message: 'Profile updated successfully',
                user: { ...this.getCurrentUser(), ...profileData }
            };
        } catch (error) {
            console.error('Profile update error:', error);
            throw error;
        }
    }
}

// Export singleton instance
export const authService = new AuthService();
