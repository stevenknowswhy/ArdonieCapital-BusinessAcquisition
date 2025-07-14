/**
 * Marketplace Service Tests
 * Comprehensive tests for the marketplace service functionality
 */

import { MarketplaceService } from '../../../src/features/marketplace/services/marketplace.service.js';
import { TestUtils, TestAssertions } from '../../setup.js';

describe('MarketplaceService', () => {
    let marketplaceService;
    let mockFetch;
    let mockLocalStorage;

    beforeEach(() => {
        TestUtils.resetMocks();
        marketplaceService = new MarketplaceService();
        mockFetch = jest.fn();
        mockLocalStorage = TestUtils.mockLocalStorage();
        
        global.fetch = mockFetch;
        global.localStorage = mockLocalStorage;
    });

    describe('Listings Management', () => {
        test('should fetch listings successfully', async () => {
            const mockListings = [
                TestUtils.createTestData('listing'),
                TestUtils.createTestData('listing', { id: '789', title: 'Another Business' })
            ];

            mockFetch.mockResolvedValue(TestUtils.mockFetch({ 
                success: true, 
                data: mockListings,
                total: 2,
                page: 1
            }));

            const result = await marketplaceService.getListings();

            expect(result.data).toHaveLength(2);
            expect(result.total).toBe(2);
            expect(mockFetch).toHaveBeenCalledWith('/api/marketplace/listings?');
        });

        test('should fetch listings with filters', async () => {
            const filters = {
                category: 'technology',
                priceMin: 50000,
                priceMax: 200000,
                location: 'New York'
            };

            mockFetch.mockResolvedValue(TestUtils.mockFetch({ 
                success: true, 
                data: [],
                total: 0
            }));

            await marketplaceService.getListings(filters);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/marketplace/listings?category=technology&priceMin=50000&priceMax=200000&location=New+York')
            );
        });

        test('should fetch single listing by ID', async () => {
            const mockListing = TestUtils.createTestData('listing');
            mockFetch.mockResolvedValue(TestUtils.mockFetch({ 
                success: true, 
                data: mockListing 
            }));

            const result = await marketplaceService.getListing('456');

            expect(result.data).toEqual(mockListing);
            expect(mockFetch).toHaveBeenCalledWith('/api/marketplace/listings/456');
        });

        test('should handle listing not found', async () => {
            mockFetch.mockResolvedValue(TestUtils.mockFetch({ 
                success: false, 
                error: 'Listing not found' 
            }, 404));

            const result = await marketplaceService.getListing('nonexistent');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Listing not found');
        });

        test('should create new listing', async () => {
            const newListing = {
                title: 'New Business',
                description: 'A new business for sale',
                price: 150000,
                category: 'retail'
            };

            const mockResponse = {
                success: true,
                data: { ...newListing, id: 'new-123' }
            };

            mockFetch.mockResolvedValue(TestUtils.mockFetch(mockResponse));

            const result = await marketplaceService.createListing(newListing);

            expect(result.success).toBe(true);
            expect(result.data.id).toBe('new-123');
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/marketplace/listings',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(newListing)
                })
            );
        });

        test('should update existing listing', async () => {
            const updates = {
                title: 'Updated Business Title',
                price: 175000
            };

            mockFetch.mockResolvedValue(TestUtils.mockFetch({ 
                success: true,
                data: { ...TestUtils.createTestData('listing'), ...updates }
            }));

            const result = await marketplaceService.updateListing('456', updates);

            expect(result.success).toBe(true);
            expect(result.data.title).toBe('Updated Business Title');
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/marketplace/listings/456',
                expect.objectContaining({
                    method: 'PATCH',
                    body: JSON.stringify(updates)
                })
            );
        });

        test('should delete listing', async () => {
            mockFetch.mockResolvedValue(TestUtils.mockFetch({ success: true }));

            const result = await marketplaceService.deleteListing('456');

            expect(result.success).toBe(true);
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/marketplace/listings/456',
                expect.objectContaining({ method: 'DELETE' })
            );
        });
    });

    describe('Search Functionality', () => {
        test('should search listings by query', async () => {
            const searchQuery = 'technology business';
            const mockResults = [TestUtils.createTestData('listing')];

            mockFetch.mockResolvedValue(TestUtils.mockFetch({ 
                success: true, 
                data: mockResults,
                total: 1
            }));

            const result = await marketplaceService.searchListings(searchQuery);

            expect(result.data).toHaveLength(1);
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/marketplace/search?q=technology+business')
            );
        });

        test('should handle empty search results', async () => {
            mockFetch.mockResolvedValue(TestUtils.mockFetch({ 
                success: true, 
                data: [],
                total: 0
            }));

            const result = await marketplaceService.searchListings('nonexistent');

            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(0);
            expect(result.total).toBe(0);
        });

        test('should search with advanced filters', async () => {
            const searchParams = {
                query: 'restaurant',
                category: 'food-service',
                priceRange: [50000, 200000],
                location: 'California',
                sortBy: 'price',
                sortOrder: 'asc'
            };

            mockFetch.mockResolvedValue(TestUtils.mockFetch({ 
                success: true, 
                data: [],
                total: 0
            }));

            await marketplaceService.searchListings(searchParams.query, searchParams);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/marketplace/search'),
                expect.any(Object)
            );
        });
    });

    describe('Categories Management', () => {
        test('should fetch all categories', async () => {
            const mockCategories = [
                { id: 'tech', name: 'Technology', count: 25 },
                { id: 'retail', name: 'Retail', count: 15 },
                { id: 'food', name: 'Food Service', count: 10 }
            ];

            mockFetch.mockResolvedValue(TestUtils.mockFetch({ 
                success: true, 
                data: mockCategories 
            }));

            const result = await marketplaceService.getCategories();

            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(3);
            expect(result.data[0]).toHaveProperty('count');
        });

        test('should get listings by category', async () => {
            const mockListings = [TestUtils.createTestData('listing')];
            mockFetch.mockResolvedValue(TestUtils.mockFetch({ 
                success: true, 
                data: mockListings 
            }));

            const result = await marketplaceService.getListingsByCategory('technology');

            expect(result.success).toBe(true);
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/marketplace/categories/technology/listings',
                expect.any(Object)
            );
        });
    });

    describe('Saved Listings', () => {
        test('should save listing to favorites', async () => {
            mockFetch.mockResolvedValue(TestUtils.mockFetch({ success: true }));

            const result = await marketplaceService.saveListing('456');

            expect(result.success).toBe(true);
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/marketplace/listings/456/save',
                expect.objectContaining({ method: 'POST' })
            );
        });

        test('should remove listing from favorites', async () => {
            mockFetch.mockResolvedValue(TestUtils.mockFetch({ success: true }));

            const result = await marketplaceService.unsaveListing('456');

            expect(result.success).toBe(true);
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/marketplace/listings/456/save',
                expect.objectContaining({ method: 'DELETE' })
            );
        });

        test('should get saved listings', async () => {
            const mockSavedListings = [TestUtils.createTestData('listing')];
            mockFetch.mockResolvedValue(TestUtils.mockFetch({ 
                success: true, 
                data: mockSavedListings 
            }));

            const result = await marketplaceService.getSavedListings();

            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(1);
        });

        test('should check if listing is saved', async () => {
            mockFetch.mockResolvedValue(TestUtils.mockFetch({ 
                success: true, 
                data: { saved: true } 
            }));

            const result = await marketplaceService.isListingSaved('456');

            expect(result.success).toBe(true);
            expect(result.data.saved).toBe(true);
        });
    });

    describe('Filtering and Sorting', () => {
        test('should build filter query correctly', () => {
            const filters = {
                category: 'technology',
                priceMin: 50000,
                priceMax: 200000,
                location: 'New York',
                revenue: { min: 100000, max: 500000 }
            };

            const queryString = marketplaceService.buildFilterQuery(filters);

            expect(queryString).toContain('category=technology');
            expect(queryString).toContain('priceMin=50000');
            expect(queryString).toContain('priceMax=200000');
            expect(queryString).toContain('location=New%20York');
        });

        test('should validate filter values', () => {
            const validFilters = {
                category: 'technology',
                priceMin: 50000,
                priceMax: 200000
            };

            const invalidFilters = {
                category: 'invalid-category',
                priceMin: -1000,
                priceMax: 'not-a-number'
            };

            expect(marketplaceService.validateFilters(validFilters)).toBe(true);
            expect(marketplaceService.validateFilters(invalidFilters)).toBe(false);
        });

        test('should sort listings correctly', () => {
            const listings = [
                { id: '1', price: 100000, title: 'B Business' },
                { id: '2', price: 50000, title: 'A Business' },
                { id: '3', price: 150000, title: 'C Business' }
            ];

            const sortedByPrice = marketplaceService.sortListings(listings, 'price', 'asc');
            const sortedByTitle = marketplaceService.sortListings(listings, 'title', 'asc');

            expect(sortedByPrice[0].price).toBe(50000);
            expect(sortedByPrice[2].price).toBe(150000);
            expect(sortedByTitle[0].title).toBe('A Business');
        });
    });

    describe('Analytics and Tracking', () => {
        test('should track listing view', async () => {
            mockFetch.mockResolvedValue(TestUtils.mockFetch({ success: true }));

            const result = await marketplaceService.trackListingView('456');

            expect(result.success).toBe(true);
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/marketplace/analytics/view',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ listingId: '456' })
                })
            );
        });

        test('should track search query', async () => {
            mockFetch.mockResolvedValue(TestUtils.mockFetch({ success: true }));

            const result = await marketplaceService.trackSearch('technology business');

            expect(result.success).toBe(true);
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/marketplace/analytics/search',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ query: 'technology business' })
                })
            );
        });

        test('should get marketplace analytics', async () => {
            const mockAnalytics = {
                totalListings: 100,
                totalViews: 5000,
                popularCategories: ['technology', 'retail'],
                averagePrice: 125000
            };

            mockFetch.mockResolvedValue(TestUtils.mockFetch({ 
                success: true, 
                data: mockAnalytics 
            }));

            const result = await marketplaceService.getAnalytics();

            expect(result.success).toBe(true);
            expect(result.data.totalListings).toBe(100);
        });
    });

    describe('Error Handling', () => {
        test('should handle network errors', async () => {
            mockFetch.mockRejectedValue(new Error('Network error'));

            const result = await marketplaceService.getListings();

            expect(result.success).toBe(false);
            expect(result.error).toContain('Network error');
        });

        test('should handle API errors', async () => {
            mockFetch.mockResolvedValue(TestUtils.mockFetch({ 
                success: false, 
                error: 'Server error' 
            }, 500));

            const result = await marketplaceService.getListings();

            expect(result.success).toBe(false);
            expect(result.error).toBe('Server error');
        });

        test('should validate listing data before creation', async () => {
            const invalidListing = {
                title: '', // Empty title
                price: -1000, // Negative price
                category: 'invalid-category'
            };

            const result = await marketplaceService.createListing(invalidListing);

            expect(result.success).toBe(false);
            expect(result.error).toContain('validation');
            expect(mockFetch).not.toHaveBeenCalled();
        });
    });

    describe('Caching', () => {
        test('should cache listings data', async () => {
            const mockListings = [TestUtils.createTestData('listing')];
            mockFetch.mockResolvedValue(TestUtils.mockFetch({ 
                success: true, 
                data: mockListings 
            }));

            // First call
            await marketplaceService.getListings();
            // Second call should use cache
            await marketplaceService.getListings();

            expect(mockFetch).toHaveBeenCalledTimes(1);
        });

        test('should invalidate cache when creating listing', async () => {
            const mockListings = [TestUtils.createTestData('listing')];
            mockFetch.mockResolvedValue(TestUtils.mockFetch({ 
                success: true, 
                data: mockListings 
            }));

            await marketplaceService.getListings(); // Cache data
            await marketplaceService.createListing({ title: 'New' }); // Should invalidate cache
            await marketplaceService.getListings(); // Should fetch fresh data

            expect(mockFetch).toHaveBeenCalledTimes(3);
        });
    });
});
