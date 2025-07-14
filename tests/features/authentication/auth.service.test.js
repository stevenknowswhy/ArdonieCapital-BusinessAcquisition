/**
 * Authentication Service Tests
 * Comprehensive tests for the authentication service
 */

import { authService } from '../../../src/features/authentication/services/auth.service.js';
import { TestUtils, TestAssertions } from '../../setup.js';

describe('AuthService', () => {
    let mockLocalStorage;
    let mockFetch;

    beforeEach(() => {
        TestUtils.resetMocks();
        mockLocalStorage = TestUtils.mockLocalStorage();
        mockFetch = jest.fn();
        
        // Mock global objects
        global.localStorage = mockLocalStorage;
        global.fetch = mockFetch;
        
        // Reset auth service state
        authService.currentUser = null;
        authService.isAuthenticated = false;
    });

    describe('Login', () => {
        test('should login successfully with valid credentials', async () => {
            const mockResponse = {
                success: true,
                user: TestUtils.createTestData('user'),
                token: 'mock-jwt-token',
                refreshToken: 'mock-refresh-token'
            };

            mockFetch.mockResolvedValue(TestUtils.mockFetch(mockResponse));

            const result = await authService.login('test@example.com', 'password123');

            expect(result.success).toBe(true);
            expect(result.user).toEqual(mockResponse.user);
            expect(authService.isAuthenticated).toBe(true);
            expect(authService.currentUser).toEqual(mockResponse.user);
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_token', mockResponse.token);
        });

        test('should fail login with invalid credentials', async () => {
            const mockResponse = {
                success: false,
                error: 'Invalid credentials'
            };

            mockFetch.mockResolvedValue(TestUtils.mockFetch(mockResponse, 401));

            const result = await authService.login('test@example.com', 'wrongpassword');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Invalid credentials');
            expect(authService.isAuthenticated).toBe(false);
            expect(authService.currentUser).toBeNull();
        });

        test('should handle network errors during login', async () => {
            mockFetch.mockRejectedValue(new Error('Network error'));

            const result = await authService.login('test@example.com', 'password123');

            expect(result.success).toBe(false);
            expect(result.error).toContain('Network error');
            expect(authService.isAuthenticated).toBe(false);
        });

        test('should validate email format before login', async () => {
            const result = await authService.login('invalid-email', 'password123');

            expect(result.success).toBe(false);
            expect(result.error).toContain('email');
            expect(mockFetch).not.toHaveBeenCalled();
        });

        test('should validate password requirements before login', async () => {
            const result = await authService.login('test@example.com', '123');

            expect(result.success).toBe(false);
            expect(result.error).toContain('password');
            expect(mockFetch).not.toHaveBeenCalled();
        });

        test('should handle remember me option', async () => {
            const mockResponse = {
                success: true,
                user: TestUtils.createTestData('user'),
                token: 'mock-jwt-token'
            };

            mockFetch.mockResolvedValue(TestUtils.mockFetch(mockResponse));

            await authService.login('test@example.com', 'password123', true);

            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('remember_me', 'true');
        });
    });

    describe('Register', () => {
        test('should register successfully with valid data', async () => {
            const userData = {
                email: 'newuser@example.com',
                password: 'password123',
                confirmPassword: 'password123',
                firstName: 'John',
                lastName: 'Doe',
                role: 'buyer'
            };

            const mockResponse = {
                success: true,
                user: TestUtils.createTestData('user', userData),
                token: 'mock-jwt-token'
            };

            mockFetch.mockResolvedValue(TestUtils.mockFetch(mockResponse));

            const result = await authService.register(userData);

            expect(result.success).toBe(true);
            expect(result.user.email).toBe(userData.email);
            expect(authService.isAuthenticated).toBe(true);
        });

        test('should fail registration with mismatched passwords', async () => {
            const userData = {
                email: 'newuser@example.com',
                password: 'password123',
                confirmPassword: 'different123',
                firstName: 'John',
                lastName: 'Doe'
            };

            const result = await authService.register(userData);

            expect(result.success).toBe(false);
            expect(result.error).toContain('password');
            expect(mockFetch).not.toHaveBeenCalled();
        });

        test('should fail registration with existing email', async () => {
            const userData = {
                email: 'existing@example.com',
                password: 'password123',
                confirmPassword: 'password123',
                firstName: 'John',
                lastName: 'Doe'
            };

            const mockResponse = {
                success: false,
                error: 'Email already exists'
            };

            mockFetch.mockResolvedValue(TestUtils.mockFetch(mockResponse, 409));

            const result = await authService.register(userData);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Email already exists');
        });

        test('should validate required fields during registration', async () => {
            const incompleteData = {
                email: 'test@example.com',
                password: 'password123'
                // Missing required fields
            };

            const result = await authService.register(incompleteData);

            expect(result.success).toBe(false);
            expect(result.error).toContain('required');
            expect(mockFetch).not.toHaveBeenCalled();
        });
    });

    describe('Logout', () => {
        test('should logout successfully', async () => {
            // Set up authenticated state
            authService.currentUser = TestUtils.createTestData('user');
            authService.isAuthenticated = true;
            mockLocalStorage.setItem('auth_token', 'mock-token');

            const mockResponse = { success: true };
            mockFetch.mockResolvedValue(TestUtils.mockFetch(mockResponse));

            const result = await authService.logout();

            expect(result.success).toBe(true);
            expect(authService.isAuthenticated).toBe(false);
            expect(authService.currentUser).toBeNull();
            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token');
        });

        test('should handle logout when not authenticated', async () => {
            const result = await authService.logout();

            expect(result.success).toBe(true);
            expect(authService.isAuthenticated).toBe(false);
        });

        test('should clear all auth-related storage on logout', async () => {
            mockLocalStorage.setItem('auth_token', 'token');
            mockLocalStorage.setItem('refresh_token', 'refresh');
            mockLocalStorage.setItem('remember_me', 'true');

            await authService.logout();

            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token');
            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refresh_token');
            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('remember_me');
        });
    });

    describe('Token Management', () => {
        test('should refresh token when expired', async () => {
            const mockResponse = {
                success: true,
                token: 'new-jwt-token',
                refreshToken: 'new-refresh-token'
            };

            mockFetch.mockResolvedValue(TestUtils.mockFetch(mockResponse));
            mockLocalStorage.getItem.mockReturnValue('old-refresh-token');

            const result = await authService.refreshToken();

            expect(result.success).toBe(true);
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_token', 'new-jwt-token');
        });

        test('should handle refresh token failure', async () => {
            const mockResponse = {
                success: false,
                error: 'Invalid refresh token'
            };

            mockFetch.mockResolvedValue(TestUtils.mockFetch(mockResponse, 401));

            const result = await authService.refreshToken();

            expect(result.success).toBe(false);
            expect(authService.isAuthenticated).toBe(false);
        });

        test('should validate token format', () => {
            expect(authService.isValidToken('valid.jwt.token')).toBe(true);
            expect(authService.isValidToken('invalid-token')).toBe(false);
            expect(authService.isValidToken('')).toBe(false);
            expect(authService.isValidToken(null)).toBe(false);
        });

        test('should check token expiration', () => {
            const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
            const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago

            const validToken = `header.${btoa(JSON.stringify({ exp: futureTime }))}.signature`;
            const expiredToken = `header.${btoa(JSON.stringify({ exp: pastTime }))}.signature`;

            expect(authService.isTokenExpired(validToken)).toBe(false);
            expect(authService.isTokenExpired(expiredToken)).toBe(true);
        });
    });

    describe('User Profile', () => {
        test('should get current user profile', async () => {
            const mockUser = TestUtils.createTestData('user');
            authService.currentUser = mockUser;
            authService.isAuthenticated = true;

            const user = authService.getCurrentUser();

            expect(user).toEqual(mockUser);
        });

        test('should update user profile', async () => {
            const updates = {
                firstName: 'Updated',
                lastName: 'Name'
            };

            const mockResponse = {
                success: true,
                user: { ...TestUtils.createTestData('user'), ...updates }
            };

            mockFetch.mockResolvedValue(TestUtils.mockFetch(mockResponse));

            const result = await authService.updateProfile(updates);

            expect(result.success).toBe(true);
            expect(result.user.firstName).toBe('Updated');
            expect(authService.currentUser.firstName).toBe('Updated');
        });

        test('should change password', async () => {
            const passwordData = {
                currentPassword: 'oldpassword',
                newPassword: 'newpassword123',
                confirmPassword: 'newpassword123'
            };

            const mockResponse = { success: true };
            mockFetch.mockResolvedValue(TestUtils.mockFetch(mockResponse));

            const result = await authService.changePassword(passwordData);

            expect(result.success).toBe(true);
        });

        test('should validate password change data', async () => {
            const invalidData = {
                currentPassword: 'oldpassword',
                newPassword: 'weak',
                confirmPassword: 'different'
            };

            const result = await authService.changePassword(invalidData);

            expect(result.success).toBe(false);
            expect(result.error).toBeTruthy();
            expect(mockFetch).not.toHaveBeenCalled();
        });
    });

    describe('Password Reset', () => {
        test('should request password reset', async () => {
            const mockResponse = { success: true, message: 'Reset email sent' };
            mockFetch.mockResolvedValue(TestUtils.mockFetch(mockResponse));

            const result = await authService.requestPasswordReset('test@example.com');

            expect(result.success).toBe(true);
            expect(result.message).toBe('Reset email sent');
        });

        test('should reset password with token', async () => {
            const resetData = {
                token: 'reset-token',
                newPassword: 'newpassword123',
                confirmPassword: 'newpassword123'
            };

            const mockResponse = { success: true };
            mockFetch.mockResolvedValue(TestUtils.mockFetch(mockResponse));

            const result = await authService.resetPassword(resetData);

            expect(result.success).toBe(true);
        });

        test('should validate reset password data', async () => {
            const invalidData = {
                token: 'reset-token',
                newPassword: 'weak',
                confirmPassword: 'different'
            };

            const result = await authService.resetPassword(invalidData);

            expect(result.success).toBe(false);
            expect(result.error).toBeTruthy();
        });
    });

    describe('Session Management', () => {
        test('should check authentication status', () => {
            authService.isAuthenticated = true;
            expect(authService.isLoggedIn()).toBe(true);

            authService.isAuthenticated = false;
            expect(authService.isLoggedIn()).toBe(false);
        });

        test('should initialize from stored token', async () => {
            const mockUser = TestUtils.createTestData('user');
            const validToken = 'valid.jwt.token';

            mockLocalStorage.getItem.mockReturnValue(validToken);
            mockFetch.mockResolvedValue(TestUtils.mockFetch({ success: true, user: mockUser }));

            await authService.initializeFromStorage();

            expect(authService.isAuthenticated).toBe(true);
            expect(authService.currentUser).toEqual(mockUser);
        });

        test('should handle invalid stored token', async () => {
            mockLocalStorage.getItem.mockReturnValue('invalid-token');

            await authService.initializeFromStorage();

            expect(authService.isAuthenticated).toBe(false);
            expect(authService.currentUser).toBeNull();
        });
    });

    describe('Error Handling', () => {
        test('should handle network errors gracefully', async () => {
            mockFetch.mockRejectedValue(new Error('Network error'));

            const result = await authService.login('test@example.com', 'password123');

            expect(result.success).toBe(false);
            expect(result.error).toContain('Network error');
        });

        test('should handle server errors', async () => {
            mockFetch.mockResolvedValue(TestUtils.mockFetch({ error: 'Server error' }, 500));

            const result = await authService.login('test@example.com', 'password123');

            expect(result.success).toBe(false);
            expect(result.error).toBeTruthy();
        });

        test('should handle malformed responses', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.reject(new Error('Invalid JSON'))
            });

            const result = await authService.login('test@example.com', 'password123');

            expect(result.success).toBe(false);
            expect(result.error).toBeTruthy();
        });
    });
});
