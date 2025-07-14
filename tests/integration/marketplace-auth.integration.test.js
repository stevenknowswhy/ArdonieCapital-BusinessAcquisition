/**
 * Marketplace-Authentication Integration Tests
 * Tests the integration between marketplace features and authentication
 */

import { AuthService } from '../../src/features/authentication/services/auth.service.js';
import { MarketplaceService } from '../../src/features/marketplace/services/marketplace.service.js';
import { TestUtils, TestAssertions } from '../setup.js';

describe('Marketplace-Authentication Integration', () => {
    let authService;
    let marketplaceService;
    let mockFetch;
    let mockLocalStorage;

    beforeEach(() => {
        TestUtils.resetMocks();
        
        authService = new AuthService();
        marketplaceService = new MarketplaceService();
        mockFetch = jest.fn();
        mockLocalStorage = TestUtils.mockLocalStorage();
        
        global.fetch = mockFetch;
        global.localStorage = mockLocalStorage;
    });

    describe('Authenticated Marketplace Operations', () => {
        test('should allow authenticated users to save listings', async () => {
            // Step 1: Authenticate user
            const mockUser = TestUtils.createTestData('user', { role: 'buyer' });
            const mockToken = 'auth-token';

            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch({
                success: true,
                user: mockUser,
                token: mockToken
            }));

            await authService.login('buyer@example.com', 'password123');
            
            expect(authService.isAuthenticated).toBe(true);
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_token', mockToken);

            // Step 2: Save a listing (requires authentication)
            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch({
                success: true,
                message: 'Listing saved successfully'
            }));

            const saveResult = await marketplaceService.saveListing('listing-123');
            
            expect(saveResult.success).toBe(true);
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/marketplace/listings/listing-123/save',
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Authorization': `Bearer ${mockToken}`
                    })
                })
            );
        });

        test('should allow authenticated sellers to create listings', async () => {
            // Step 1: Authenticate seller
            const mockSeller = TestUtils.createTestData('user', { role: 'seller' });
            const mockToken = 'seller-token';

            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch({
                success: true,
                user: mockSeller,
                token: mockToken
            }));

            await authService.login('seller@example.com', 'password123');

            // Step 2: Create a new listing
            const listingData = TestUtils.createTestData('listing', {
                title: 'Auto Repair Shop for Sale',
                price: 250000,
                location: 'Dallas, TX'
            });

            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch({
                success: true,
                data: { ...listingData, id: 'new-listing-456' }
            }));

            const createResult = await marketplaceService.createListing(listingData);
            
            expect(createResult.success).toBe(true);
            expect(createResult.data.id).toBe('new-listing-456');
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/marketplace/listings',
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Authorization': `Bearer ${mockToken}`
                    }),
                    body: JSON.stringify(listingData)
                })
            );
        });

        test('should prevent unauthenticated users from protected operations', async () => {
            // Ensure user is not authenticated
            authService.isAuthenticated = false;
            mockLocalStorage.getItem.mockReturnValue(null);

            // Attempt to save listing without authentication
            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch({
                success: false,
                error: 'Authentication required'
            }, 401));

            const saveResult = await marketplaceService.saveListing('listing-123');
            
            expect(saveResult.success).toBe(false);
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/marketplace/listings/listing-123/save',
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.not.objectContaining({
                        'Authorization': expect.any(String)
                    })
                })
            );
        });
    });

    describe('Role-Based Marketplace Access', () => {
        test('should show buyer-specific marketplace features', async () => {
            // Authenticate as buyer
            const mockBuyer = TestUtils.createTestData('user', { role: 'buyer' });
            const mockToken = 'buyer-token';

            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch({
                success: true,
                user: mockBuyer,
                token: mockToken
            }));

            await authService.login('buyer@example.com', 'password123');

            // Get saved listings (buyer-specific feature)
            const mockSavedListings = TestUtils.createTestData('listings', 3);
            
            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch({
                success: true,
                data: mockSavedListings
            }));

            const savedResult = await marketplaceService.getSavedListings();
            
            expect(savedResult.success).toBe(true);
            expect(savedResult.data).toHaveLength(3);
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/marketplace/saved',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': `Bearer ${mockToken}`
                    })
                })
            );
        });

        test('should show seller-specific marketplace features', async () => {
            // Authenticate as seller
            const mockSeller = TestUtils.createTestData('user', { role: 'seller' });
            const mockToken = 'seller-token';

            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch({
                success: true,
                user: mockSeller,
                token: mockToken
            }));

            await authService.login('seller@example.com', 'password123');

            // Get seller's own listings
            const mockSellerListings = TestUtils.createTestData('listings', 2);
            
            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch({
                success: true,
                data: mockSellerListings
            }));

            const sellerListingsResult = await marketplaceService.getSellerListings();
            
            expect(sellerListingsResult.success).toBe(true);
            expect(sellerListingsResult.data).toHaveLength(2);
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/marketplace/seller/listings',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': `Bearer ${mockToken}`
                    })
                })
            );
        });
    });

    describe('Session Management in Marketplace', () => {
        test('should handle token refresh during marketplace operations', async () => {
            // Initial authentication
            const mockUser = TestUtils.createTestData('user');
            const initialToken = 'initial-token';
            const refreshedToken = 'refreshed-token';

            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch({
                success: true,
                user: mockUser,
                token: initialToken
            }));

            await authService.login('user@example.com', 'password123');

            // First marketplace request succeeds
            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch({
                success: true,
                data: TestUtils.createTestData('listings', 5)
            }));

            const firstResult = await marketplaceService.getListings();
            expect(firstResult.success).toBe(true);

            // Second request fails with token expiration
            mockFetch
                .mockResolvedValueOnce(TestUtils.mockFetch({
                    success: false,
                    error: 'Token expired'
                }, 401))
                .mockResolvedValueOnce(TestUtils.mockFetch({
                    success: true,
                    token: refreshedToken
                }))
                .mockResolvedValueOnce(TestUtils.mockFetch({
                    success: true,
                    data: TestUtils.createTestData('listings', 5)
                }));

            // This should trigger token refresh and retry
            const secondResult = await marketplaceService.getListings();
            expect(secondResult.success).toBe(true);
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_token', refreshedToken);
        });

        test('should redirect to login when session cannot be refreshed', async () => {
            // Setup authenticated user
            const mockUser = TestUtils.createTestData('user');
            const expiredToken = 'expired-token';

            authService.currentUser = mockUser;
            authService.isAuthenticated = true;
            mockLocalStorage.getItem.mockReturnValue(expiredToken);

            // Marketplace request fails and token refresh also fails
            mockFetch
                .mockResolvedValueOnce(TestUtils.mockFetch({
                    success: false,
                    error: 'Token expired'
                }, 401))
                .mockResolvedValueOnce(TestUtils.mockFetch({
                    success: false,
                    error: 'Refresh token expired'
                }, 401));

            const result = await marketplaceService.getListings();
            
            expect(result.success).toBe(false);
            expect(authService.isAuthenticated).toBe(false);
            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token');
        });
    });

    describe('Marketplace Search with User Context', () => {
        test('should personalize search results for authenticated users', async () => {
            // Authenticate user with preferences
            const mockUser = TestUtils.createTestData('user', {
                preferences: {
                    location: 'Dallas, TX',
                    businessType: 'auto-repair',
                    priceRange: { min: 100000, max: 500000 }
                }
            });
            const mockToken = 'user-token';

            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch({
                success: true,
                user: mockUser,
                token: mockToken
            }));

            await authService.login('user@example.com', 'password123');

            // Search with user context
            const mockPersonalizedResults = TestUtils.createTestData('listings', 3);
            
            mockFetch.mockResolvedValueOnce(TestUtils.mockFetch({
                success: true,
                data: mockPersonalizedResults,
                personalized: true
            }));

            const searchResult = await marketplaceService.searchListings('auto repair', {
                useUserPreferences: true
            });
            
            expect(searchResult.success).toBe(true);
            expect(searchResult.data).toHaveLength(3);
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/marketplace/search'),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': `Bearer ${mockToken}`
                    })
                })
            );
        });
    });
});
