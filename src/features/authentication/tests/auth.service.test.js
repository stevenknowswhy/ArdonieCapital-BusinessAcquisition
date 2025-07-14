
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
 * Authentication Service Tests
 * Unit tests for the core authentication functionality
 */

import { AuthService } from '../services/auth.service.js';
import { passwordValidator } from '../services/password-validator.service.js';
import { sessionManager } from '../services/session-manager.service.js';
import { cryptoUtils } from '../utils/crypto.utils.js';

// Mock dependencies
jest.mock('../services/password-validator.service.js');
jest.mock('../services/session-manager.service.js');
jest.mock('../utils/crypto.utils.js');

describe('AuthService', () => {
    let authService;
    let mockLocalStorage;

    beforeEach(() => {
        // Mock localStorage
        mockLocalStorage = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn()
        };
        Object.defineProperty(window, 'localStorage', {
            value: mockLocalStorage
        });

        // Mock window.location
        delete window.location;
        window.location = { href: '' };

        // Reset mocks
        jest.clearAllMocks();

        // Create fresh instance
        authService = new AuthService();
    });

    describe('Constructor', () => {
        test('should initialize with correct default values', () => {
            expect(authService.apiBase).toBe('/api/auth');
            expect(authService.tokenKey).toBe('ardonie_auth_token');
            expect(authService.userKey).toBe('ardonie_user_data');
        });

        test('should initialize CSRF protection', () => {
            expect(cryptoUtils.generateCSRFToken).toHaveBeenCalled();
        });
    });

    describe('Login', () => {
        test('should successfully login with valid credentials', async () => {
            // Mock password validator
            passwordValidator.validatePassword.mockReturnValue({
                isValid: true,
                errors: [],
                strength: 85
            });

            // Mock session manager
            sessionManager.startSession.mockImplementation(() => {});

            // Mock crypto utils
            cryptoUtils.encryptData.mockResolvedValue('encrypted_user_data');
            cryptoUtils.generateSecureToken.mockReturnValue('mock_token');

            const result = await authService.login('admin@ardoniecapital.com', 'SecurePass123!', false);

            expect(result.success).toBe(true);
            expect(result.user).toBeDefined();
            expect(result.token).toBeDefined();
            expect(sessionManager.startSession).toHaveBeenCalledWith(result.user, false);
        });

        test('should fail login with invalid email', async () => {
            await expect(authService.login('invalid-email', 'password123')).rejects.toThrow('Please enter a valid email address');
        });

        test('should fail login with missing credentials', async () => {
            await expect(authService.login('', '')).rejects.toThrow('Email and password are required');
        });

        test('should fail login with incorrect credentials', async () => {
            const result = await authService.login('wrong@example.com', 'wrongpassword');
            expect(result.success).toBe(false);
            expect(result.message).toBe('Invalid email or password');
        });
    });

    describe('Registration', () => {
        const validUserData = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: process.env.PASSWORD || '',
            confirmpassword: process.env.PASSWORD || '',
            userType: 'buyer'
        };

        test('should successfully register with valid data', async () => {
            // Mock password validator
            passwordValidator.validatePassword.mockReturnValue({
                isValid: true,
                errors: [],
                strength: 85
            });

            passwordValidator.validatePasswordConfirmation.mockReturnValue({
                isValid: true,
                errors: []
            });

            const result = await authService.register(validUserData);

            expect(result.success).toBe(true);
            expect(result.user).toBeDefined();
            expect(result.user.email).toBe(validUserData.email);
        });

        test('should fail registration with missing required fields', async () => {
            const incompleteData = { ...validUserData };
            delete incompleteData.firstName;

            await expect(authService.register(incompleteData)).rejects.toThrow('firstName is required');
        });

        test('should fail registration with invalid email', async () => {
            const invalidEmailData = { ...validUserData, email: 'invalid-email' };

            await expect(authService.register(invalidEmailData)).rejects.toThrow('Please enter a valid email address');
        });

        test('should fail registration with weak password', async () => {
            passwordValidator.validatePassword.mockReturnValue({
                isValid: false,
                errors: ['Password is too weak'],
                strength: 20
            });

            const weakPasswordData = { ...validUserData, password: process.env.PASSWORD || '', confirmpassword: process.env.PASSWORD || '' };

            await expect(authService.register(weakPasswordData)).rejects.toThrow('Password is too weak');
        });

        test('should fail registration with mismatched passwords', async () => {
            passwordValidator.validatePassword.mockReturnValue({
                isValid: true,
                errors: [],
                strength: 85
            });

            passwordValidator.validatePasswordConfirmation.mockReturnValue({
                isValid: false,
                errors: ['Passwords do not match']
            });

            const mismatchedData = { ...validUserData, confirmpassword: process.env.PASSWORD || '' };

            await expect(authService.register(mismatchedData)).rejects.toThrow('Passwords do not match');
        });

        test('should fail registration with existing email', async () => {
            passwordValidator.validatePassword.mockReturnValue({
                isValid: true,
                errors: [],
                strength: 85
            });

            passwordValidator.validatePasswordConfirmation.mockReturnValue({
                isValid: true,
                errors: []
            });

            const existingEmailData = { ...validUserData, email: 'existing@example.com' };

            const result = await authService.register(existingEmailData);
            expect(result.success).toBe(false);
            expect(result.message).toBe('An account with this email already exists');
        });
    });

    describe('Logout', () => {
        test('should clear session and redirect on logout', () => {
            sessionManager.endSession.mockImplementation(() => {});
            
            authService.logout();

            expect(sessionManager.endSession).toHaveBeenCalled();
            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('ardonie_auth_token');
            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('ardonie_user_data');
            expect(window.location.href).toBe('/');
        });

        test('should redirect even if cleanup fails', () => {
            sessionManager.endSession.mockImplementation(() => {
                throw new Error('Cleanup failed');
            });
            
            authService.logout();

            expect(window.location.href).toBe('/');
        });
    });

    describe('Authentication Status', () => {
        test('should return true when user is authenticated', () => {
            sessionManager.isSessionActive.mockReturnValue(true);
            mockLocalStorage.getItem.mockReturnValue('mock_token');

            expect(authService.isAuthenticated()).toBe(true);
        });

        test('should return false when session is inactive', () => {
            sessionManager.isSessionActive.mockReturnValue(false);
            mockLocalStorage.getItem.mockReturnValue('mock_token');

            expect(authService.isAuthenticated()).toBe(false);
        });

        test('should return false when no token exists', () => {
            sessionManager.isSessionActive.mockReturnValue(true);
            mockLocalStorage.getItem.mockReturnValue(null);

            expect(authService.isAuthenticated()).toBe(false);
        });
    });

    describe('Utility Methods', () => {
        test('should validate email correctly', () => {
            expect(authService.isValidEmail('test@example.com')).toBe(true);
            expect(authService.isValidEmail('invalid-email')).toBe(false);
            expect(authService.isValidEmail('')).toBe(false);
        });

        test('should get auth headers with token', () => {
            mockLocalStorage.getItem.mockReturnValue('mock_token');
            authService.csrftoken: process.env.TOKEN || '';

            const headers = authService.getAuthHeaders();

            expect(headers['Authorization']).toBe('Bearer mock_token');
            expect(headers['X-CSRF-Token']).toBe('mock_csrf');
            expect(headers['Content-Type']).toBe('application/json');
        });

        test('should get auth headers without token', () => {
            mockLocalStorage.getItem.mockReturnValue(null);
            authService.csrftoken: process.env.TOKEN || '';

            const headers = authService.getAuthHeaders();

            expect(headers['Authorization']).toBeUndefined();
            expect(headers['X-CSRF-Token']).toBe('mock_csrf');
            expect(headers['Content-Type']).toBe('application/json');
        });
    });

    describe('Password Reset', () => {
        test('should successfully request password reset', async () => {
            const result = await authService.requestPasswordReset('test@example.com');

            expect(result.success).toBe(true);
            expect(result.message).toContain('Password reset instructions');
        });

        test('should fail password reset with invalid email', async () => {
            await expect(authService.requestPasswordReset('invalid-email')).rejects.toThrow('Please enter a valid email address');
        });
    });

    describe('Email Verification', () => {
        test('should successfully verify email', async () => {
            const result = await authService.verifyEmail('valid_token');

            expect(result.success).toBe(true);
            expect(result.message).toBe('Email verified successfully');
        });

        test('should fail verification without token', async () => {
            await expect(authService.verifyEmail('')).rejects.toThrow('Verification token is required');
        });
    });
});
