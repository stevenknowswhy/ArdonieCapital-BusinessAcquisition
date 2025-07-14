/**
 * Authentication-Dashboard Integration Tests
 * Tests the integration between authentication and dashboard features
 */

import { AuthService } from '../../src/features/authentication/services/auth.service.js';
import { DashboardService } from '../../src/features/dashboard/services/dashboard.service.js';
import { TestUtils, TestAssertions } from '../setup.js';

describe('Authentication-Dashboard Integration', () => {
    let authService;
    let dashboardService;
    let mockFetch;
    let mockLocalStorage;

    beforeEach(() => {
        TestUtils.resetMocks();
        
        authService = new AuthService();
        dashboardService = new DashboardService();
        mockFetch = jest.fn();
        mockLocalStorage = TestUtils.mockLocalStorage();
        
        global.fetch = mockFetch;
        global.localStorage = mockLocalStorage;
    });

    describe('Authenticated Dashboard Access', () => {
        test('should allow dashboard access when authenticated', async () => {
            // Setup authenticated user
            const mockUser = TestUtils.createTestData('user');
            const mockToken = 'valid-jwt-token';
            
            mockFetch
                .mockResolvedValueOnce(TestUtils.mockFetch({
                    success: true,
                    user: mockUser,
                    token: mockToken
                }))
                .mockResolvedValueOnce(TestUtils.mockFetch({
                    success: true,
                    data: TestUtils.createTestData('dashboard').analytics
                }));

            // Login user
            const loginResult = await authService.login('test@example.com', 'password123');
            expect(loginResult.success).toBe(true);
            expect(authService.isAuthenticated).toBe(true);

            // Access dashboard
            const dashboardResult = await dashboardService.getAnalytics();
            expect(dashboardResult.success).toBe(true);
            
            // Verify auth token was sent with dashboard request
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/dashboard/analytics',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': `Bearer ${mockToken}`
                    })
                })
            );
        });

        test('should deny dashboard access when not authenticated', async () => {
            // Attempt to access dashboard without authentication
            mockFetch.mockResolvedValue(TestUtils.mockFetch({
                success: false,
                error: 'Unauthorized'
            }, 401));

            const result = await dashboardService.getAnalytics();
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('Unauthorized');
        });

        test('should redirect to login when token expires', async () => {
            // Setup expired token scenario
            const expiredToken = 'expired-jwt-token';
            mockLocalStorage.getItem.mockReturnValue(expiredToken);
            
            mockFetch.mockResolvedValue(TestUtils.mockFetch({
                success: false,
                error: 'Token expired'
            }, 401));

            const result = await dashboardService.getAnalytics();
            
            expect(result.success).toBe(false);
            expect(authService.isAuthenticated).toBe(false);
        });
    });

    describe('User Role-Based Dashboard Content', () => {
        test('should show buyer-specific dashboard content', async () => {
            const buyerUser = TestUtils.createTestData('user', { role: 'buyer' });
            
            mockFetch
                .mockResolvedValueOnce(TestUtils.mockFetch({
                    success: true,
                    user: buyerUser,
                    token: 'buyer-token'
                }))
                .mockResolvedValueOnce(TestUtils.mockFetch({
                    success: true,
                    data: {
                        savedListings: 5,
                        inquiriesSent: 12,
                        viewedListings: 45
                    }
                }));

            await authService.login('buyer@example.com', 'password123');
            const dashboardData = await dashboardService.getBuyerDashboard();
            
            expect(dashboardData.success).toBe(true);
            expect(dashboardData.data).toHaveProperty('savedListings');
            expect(dashboardData.data).toHaveProperty('inquiriesSent');
        });

        test('should show seller-specific dashboard content', async () => {
            const sellerUser = TestUtils.createTestData('user', { role: 'seller' });
            
            mockFetch
                .mockResolvedValueOnce(TestUtils.mockFetch({
                    success: true,
                    user: sellerUser,
                    token: 'seller-token'
                }))
                .mockResolvedValueOnce(TestUtils.mockFetch({
                    success: true,
                    data: {
                        activeListings: 3,
                        inquiriesReceived: 8,
                        totalViews: 234
                    }
                }));

            await authService.login('seller@example.com', 'password123');
            const dashboardData = await dashboardService.getSellerDashboard();
            
            expect(dashboardData.success).toBe(true);
            expect(dashboardData.data).toHaveProperty('activeListings');
            expect(dashboardData.data).toHaveProperty('inquiriesReceived');
        });

        test('should deny access to unauthorized role content', async () => {
            const buyerUser = TestUtils.createTestData('user', { role: 'buyer' });
            
            mockFetch
                .mockResolvedValueOnce(TestUtils.mockFetch({
                    success: true,
                    user: buyerUser,
                    token: 'buyer-token'
                }))
                .mockResolvedValueOnce(TestUtils.mockFetch({
                    success: false,
                    error: 'Insufficient permissions'
                }, 403));

            await authService.login('buyer@example.com', 'password123');
            const result = await dashboardService.getSellerDashboard();
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('Insufficient permissions');
        });
    });

    describe('Session Management Integration', () => {
        test('should maintain session across dashboard operations', async () => {
            const mockUser = TestUtils.createTestData('user');
            const mockToken = 'session-token';
            
            // Initial login
            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch({
                success: true,
                user: mockUser,
                token: mockToken
            }));

            await authService.login('test@example.com', 'password123');
            
            // Multiple dashboard operations should use same token
            mockFetch
                .mockResolvedValueOnce(TestUtils.mockFetch({
                    success: true,
                    data: TestUtils.createTestData('dashboard').analytics
                }))
                .mockResolvedValueOnce(TestUtils.mockFetch({
                    success: true,
                    data: TestUtils.createTestData('dashboard').notifications
                }));

            await dashboardService.getAnalytics();
            await dashboardService.getNotifications();
            
            // Verify same token used for both requests
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/dashboard/analytics',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': `Bearer ${mockToken}`
                    })
                })
            );
            
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/dashboard/notifications',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': `Bearer ${mockToken}`
                    })
                })
            );
        });

        test('should handle token refresh during dashboard session', async () => {
            const oldToken = 'old-token';
            const newToken = 'new-token';
            const mockUser = TestUtils.createTestData('user');
            
            // Initial login
            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch({
                success: true,
                user: mockUser,
                token: oldToken
            }));

            await authService.login('test@example.com', 'password123');
            
            // Dashboard request fails with expired token
            mockFetch
                .mockResolvedValueOnce(TestUtils.mockFetch({
                    success: false,
                    error: 'Token expired'
                }, 401))
                // Token refresh succeeds
                .mockResolvedValueOnce(TestUtils.mockFetch({
                    success: true,
                    token: newToken
                }))
                // Retry dashboard request with new token
                .mockResolvedValueOnce(TestUtils.mockFetch({
                    success: true,
                    data: TestUtils.createTestData('dashboard').analytics
                }));

            const result = await dashboardService.getAnalyticsWithRetry();
            
            expect(result.success).toBe(true);
            expect(authService.getToken()).toBe(newToken);
        });

        test('should logout user when refresh token is invalid', async () => {
            const expiredToken = 'expired-token';
            
            mockFetch
                .mockResolvedValueOnce(TestUtils.mockFetch({
                    success: false,
                    error: 'Token expired'
                }, 401))
                .mockResolvedValueOnce(TestUtils.mockFetch({
                    success: false,
                    error: 'Invalid refresh token'
                }, 401));

            authService.isAuthenticated = true;
            authService.currentUser = TestUtils.createTestData('user');
            
            const result = await dashboardService.getAnalytics();
            
            expect(result.success).toBe(false);
            expect(authService.isAuthenticated).toBe(false);
            expect(authService.currentUser).toBeNull();
        });
    });

    describe('Real-time Updates Integration', () => {
        test('should receive real-time updates when authenticated', async () => {
            const mockUser = TestUtils.createTestData('user');
            const mockCallback = jest.fn();
            
            // Login user
            mockFetch.mockResolvedValue(TestUtils.mockFetch({
                success: true,
                user: mockUser,
                token: 'valid-token'
            }));

            await authService.login('test@example.com', 'password123');
            
            // Start real-time updates
            dashboardService.startRealTimeUpdates(mockCallback);
            
            // Simulate real-time update
            const updateData = { totalViews: 1100 };
            dashboardService.handleRealTimeUpdate(updateData);
            
            expect(mockCallback).toHaveBeenCalledWith(updateData);
            expect(dashboardService.isRealTimeActive).toBe(true);
        });

        test('should stop real-time updates on logout', async () => {
            const mockUser = TestUtils.createTestData('user');
            
            // Setup authenticated session with real-time updates
            authService.isAuthenticated = true;
            authService.currentUser = mockUser;
            dashboardService.startRealTimeUpdates(jest.fn());
            
            // Logout
            mockFetch.mockResolvedValue(TestUtils.mockFetch({ success: true }));
            await authService.logout();
            
            expect(dashboardService.isRealTimeActive).toBe(false);
        });
    });

    describe('Error Handling Integration', () => {
        test('should handle network errors gracefully', async () => {
            mockFetch.mockRejectedValue(new Error('Network error'));
            
            const loginResult = await authService.login('test@example.com', 'password123');
            expect(loginResult.success).toBe(false);
            
            const dashboardResult = await dashboardService.getAnalytics();
            expect(dashboardResult.success).toBe(false);
        });

        test('should handle server errors consistently', async () => {
            mockFetch.mockResolvedValue(TestUtils.mockFetch({
                error: 'Internal server error'
            }, 500));
            
            const loginResult = await authService.login('test@example.com', 'password123');
            const dashboardResult = await dashboardService.getAnalytics();
            
            expect(loginResult.success).toBe(false);
            expect(dashboardResult.success).toBe(false);
            expect(loginResult.error).toBeTruthy();
            expect(dashboardResult.error).toBeTruthy();
        });
    });

    describe('Data Synchronization', () => {
        test('should sync user profile changes to dashboard', async () => {
            const mockUser = TestUtils.createTestData('user');
            const updatedUser = { ...mockUser, firstName: 'Updated' };
            
            // Login and get initial dashboard
            mockFetch
                .mockResolvedValueOnce(TestUtils.mockFetch({
                    success: true,
                    user: mockUser,
                    token: 'token'
                }))
                .mockResolvedValueOnce(TestUtils.mockFetch({
                    success: true,
                    data: TestUtils.createTestData('dashboard').analytics
                }));

            await authService.login('test@example.com', 'password123');
            await dashboardService.getAnalytics();
            
            // Update profile
            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch({
                success: true,
                user: updatedUser
            }));

            const updateResult = await authService.updateProfile({ firstName: 'Updated' });
            
            expect(updateResult.success).toBe(true);
            expect(authService.currentUser.firstName).toBe('Updated');
            
            // Dashboard should reflect updated user info
            expect(dashboardService.getCurrentUser().firstName).toBe('Updated');
        });
    });
});
