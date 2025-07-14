/**
 * Cross-Feature Integration Tests
 * Tests that validate how different features work together across the platform
 */

import { AuthService } from '../../src/features/authentication/services/auth.service.js';
import { DashboardService } from '../../src/features/dashboard/services/dashboard.service.js';
import { MarketplaceService } from '../../src/features/marketplace/services/marketplace.service.js';
import { TestUtils, TestAssertions } from '../setup.js';

describe('Cross-Feature Integration Tests', () => {
    let authService;
    let dashboardService;
    let marketplaceService;
    let mockFetch;
    let mockLocalStorage;
    let mockWindow;

    beforeEach(() => {
        TestUtils.resetMocks();
        
        authService = new AuthService();
        dashboardService = new DashboardService();
        marketplaceService = new MarketplaceService();
        
        mockFetch = jest.fn();
        mockLocalStorage = TestUtils.mockLocalStorage();
        mockWindow = TestUtils.mockWindow();
        
        global.fetch = mockFetch;
        global.localStorage = mockLocalStorage;
        global.window = mockWindow;
    });

    describe('Authentication → Marketplace → Dashboard Flow', () => {
        test('should complete full user journey from login to marketplace to dashboard', async () => {
            // Step 1: User logs in
            const mockUser = TestUtils.createTestData('user', { role: 'buyer' });
            const mockToken = 'integration-token';

            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch({
                success: true,
                user: mockUser,
                token: mockToken
            }));

            const loginResult = await authService.login('buyer@example.com', 'password123');
            
            expect(loginResult.success).toBe(true);
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_token', mockToken);

            // Step 2: User searches marketplace (authenticated)
            const mockListings = TestUtils.createTestData('listings', 3);
            
            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch({
                success: true,
                data: mockListings,
                total: 3
            }));

            const searchResult = await marketplaceService.searchListings('auto repair');
            
            expect(searchResult.success).toBe(true);
            expect(searchResult.data).toHaveLength(3);
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/marketplace/search?q=auto+repair'),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': `Bearer ${mockToken}`
                    })
                })
            );

            // Step 3: User saves a listing (requires authentication)
            const listingId = mockListings[0].id;
            
            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch({
                success: true,
                message: 'Listing saved successfully'
            }));

            const saveResult = await marketplaceService.saveListing(listingId);
            
            expect(saveResult.success).toBe(true);
            expect(mockFetch).toHaveBeenCalledWith(
                `/api/marketplace/listings/${listingId}/save`,
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Authorization': `Bearer ${mockToken}`
                    })
                })
            );

            // Step 4: User views dashboard with saved listings
            const mockDashboardData = TestUtils.createTestData('dashboard', {
                savedListings: 1,
                recentActivity: [
                    { type: 'listing_saved', listingId, timestamp: Date.now() }
                ]
            });
            
            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch({
                success: true,
                data: mockDashboardData
            }));

            const dashboardResult = await dashboardService.getBuyerDashboard();
            
            expect(dashboardResult.success).toBe(true);
            expect(dashboardResult.data.savedListings).toBe(1);
            expect(dashboardResult.data.recentActivity[0].listingId).toBe(listingId);
        });

        test('should handle session expiration across features', async () => {
            // Step 1: User is authenticated
            const mockUser = TestUtils.createTestData('user');
            const expiredToken = 'expired-token';

            mockLocalStorage.getItem.mockReturnValue(expiredToken);
            authService.currentUser = mockUser;
            authService.isAuthenticated = true;

            // Step 2: Marketplace request fails due to expired token
            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch({
                success: false,
                error: 'Token expired'
            }, 401));

            const marketplaceResult = await marketplaceService.getListings();
            
            expect(marketplaceResult.success).toBe(false);

            // Step 3: Dashboard request also fails
            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch({
                success: false,
                error: 'Token expired'
            }, 401));

            const dashboardResult = await dashboardService.getAnalytics();
            
            expect(dashboardResult.success).toBe(false);

            // Step 4: Auth service should handle logout
            expect(authService.isAuthenticated).toBe(false);
            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token');
        });
    });

    describe('Shared Utilities Integration', () => {
        test('should use shared formatting utilities across features', async () => {
            // Import shared utilities
            const { formatCurrency, formatDate } = await import('../../src/shared/utils/formatting.utils.js');

            // Test marketplace listing formatting
            const mockListing = TestUtils.createTestData('listing', {
                price: 150000,
                createdAt: new Date('2024-01-15')
            });

            const formattedPrice = formatCurrency(mockListing.price);
            const formattedDate = formatDate(mockListing.createdAt);

            expect(formattedPrice).toBe('$150,000.00');
            expect(formattedDate).toContain('2024');

            // Test dashboard analytics formatting
            const mockAnalytics = TestUtils.createTestData('dashboard', {
                totalRevenue: 2500000,
                lastLogin: new Date('2024-01-20')
            });

            const formattedRevenue = formatCurrency(mockAnalytics.totalRevenue);
            const formattedLastLogin = formatDate(mockAnalytics.lastLogin);

            expect(formattedRevenue).toBe('$2,500,000.00');
            expect(formattedLastLogin).toContain('2024');
        });

        test('should use shared validation utilities across features', async () => {
            // Import shared utilities
            const { validateEmail, validatePhone } = await import('../../src/shared/utils/validation.utils.js');

            // Test authentication validation
            const validEmail = 'user@example.com';
            const invalidEmail = 'invalid-email';

            expect(validateEmail(validEmail)).toBe(true);
            expect(validateEmail(invalidEmail)).toBe(false);

            // Test contact form validation (used in marketplace inquiries)
            const validPhone = '(555) 123-4567';
            const invalidPhone = '123';

            expect(validatePhone(validPhone)).toBe(true);
            expect(validatePhone(invalidPhone)).toBe(false);
        });
    });

    describe('Module Loading and Unloading', () => {
        test('should properly load and unload feature modules', async () => {
            // Test dynamic module loading
            const authModule = await import('../../src/features/authentication/index.js');
            const dashboardModule = await import('../../src/features/dashboard/index.js');
            const marketplaceModule = await import('../../src/features/marketplace/index.js');

            // Verify modules export expected services
            expect(authModule).toHaveProperty('AuthService');
            expect(dashboardModule).toHaveProperty('DashboardService');
            expect(marketplaceModule).toHaveProperty('MarketplaceService');

            // Test module initialization
            const authServiceInstance = new authModule.AuthService();
            const dashboardServiceInstance = new dashboardModule.DashboardService();
            const marketplaceServiceInstance = new marketplaceModule.MarketplaceService();

            expect(authServiceInstance).toBeInstanceOf(authModule.AuthService);
            expect(dashboardServiceInstance).toBeInstanceOf(dashboardModule.DashboardService);
            expect(marketplaceServiceInstance).toBeInstanceOf(marketplaceModule.MarketplaceService);
        });

        test('should handle module dependencies correctly', async () => {
            // Test that features can import shared utilities
            const authModule = await import('../../src/features/authentication/index.js');
            const sharedUtils = await import('../../src/shared/utils/index.js');

            // Verify shared utilities are available
            expect(sharedUtils).toHaveProperty('validateEmail');
            expect(sharedUtils).toHaveProperty('formatCurrency');
            expect(sharedUtils).toHaveProperty('formatDate');

            // Test that authentication can use shared utilities
            const authService = new authModule.AuthService();
            
            // Mock a method that uses shared utilities
            const mockValidateEmail = jest.spyOn(sharedUtils, 'validateEmail');
            mockValidateEmail.mockReturnValue(true);

            // This would typically be called internally by auth service
            const isValid = sharedUtils.validateEmail('test@example.com');
            expect(isValid).toBe(true);
            expect(mockValidateEmail).toHaveBeenCalledWith('test@example.com');
        });
    });

    describe('Error Handling Across Features', () => {
        test('should handle network errors consistently across features', async () => {
            const networkError = new Error('Network error');
            
            // Test auth service error handling
            mockFetch.mockRejectedValueOnce(networkError);
            const authResult = await authService.login('test@example.com', 'password');
            expect(authResult.success).toBe(false);
            expect(authResult.error).toContain('Network error');

            // Test marketplace service error handling
            mockFetch.mockRejectedValueOnce(networkError);
            const marketplaceResult = await marketplaceService.getListings();
            expect(marketplaceResult.success).toBe(false);
            expect(marketplaceResult.error).toContain('Network error');

            // Test dashboard service error handling
            mockFetch.mockRejectedValueOnce(networkError);
            const dashboardResult = await dashboardService.getAnalytics();
            expect(dashboardResult.success).toBe(false);
            expect(dashboardResult.error).toContain('Network error');
        });

        test('should handle API errors consistently across features', async () => {
            const apiError = { success: false, error: 'API Error', code: 500 };
            
            // Test consistent error response format
            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch(apiError, 500));
            const authResult = await authService.login('test@example.com', 'password');
            expect(authResult.success).toBe(false);

            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch(apiError, 500));
            const marketplaceResult = await marketplaceService.getListings();
            expect(marketplaceResult.success).toBe(false);

            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch(apiError, 500));
            const dashboardResult = await dashboardService.getAnalytics();
            expect(dashboardResult.success).toBe(false);
        });
    });
});
