
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

/**
 * Marketplace Feature - Public API
 * Central export point for all marketplace-related functionality
 * This file defines what is public and what is private for the marketplace module
 */

// Core Services - Always available
export { MarketplaceService } from './services/marketplace.service.js';

// Enhanced Marketplace Services
export { inquiryService } from './services/inquiry.service.js';
export { listingAnalyticsService } from './services/listing-analytics.service.js';

// Conditional Service Exports - Only export what exists
export const getAvailableServices = async () => {
    const services = {};

    try {
        const { listingService } = await import('./services/listing.service.js');
        services.listings = listingService;
    } catch (e) {
        console.debug('Listing service not available');
    }

    try {
        const { searchService } = await import('./services/search.service.js');
        services.search = searchService;
    } catch (e) {
        console.debug('Search service not available');
    }

    try {
        const { filterService } = await import('./services/filter.service.js');
        services.filters = filterService;
    } catch (e) {
        console.debug('Filter service not available');
    }

    try {
        const { inquiryService } = await import('./services/inquiry.service.js');
        services.inquiry = inquiryService;
    } catch (e) {
        console.debug('Inquiry service not available');
    }

    try {
        const { listingAnalyticsService } = await import('./services/listing-analytics.service.js');
        services.analytics = listingAnalyticsService;
    } catch (e) {
        console.debug('Analytics service not available');
    }

    return services;
};

// Component Exports - Only export what exists
export const getAvailableComponents = async () => {
    const components = {};

    try {
        const { ListingCard } = await import('./components/listing-card.component.js');
        components.ListingCard = ListingCard;
    } catch (e) {
        console.debug('Listing card component not available');
    }

    try {
        const { SearchFilters } = await import('./components/search-filters.component.js');
        components.SearchFilters = SearchFilters;
    } catch (e) {
        console.debug('Search filters component not available');
    }

    try {
        const { ListingDetails } = await import('./components/listing-details.component.js');
        components.ListingDetails = ListingDetails;
    } catch (e) {
        console.debug('Listing details component not available');
    }

    try {
        const { SavedListings } = await import('./components/saved-listings.component.js');
        components.SavedListings = SavedListings;
    } catch (e) {
        console.debug('Saved listings component not available');
    }

    return components;
};

// Page Exports - HTML pages (if they exist)
export const getAvailablePages = async () => {
    const pages = {};

    try {
        pages.listings = await import('./pages/listings.html');
    } catch (e) {
        console.debug('Listings page not available');
    }

    return pages;
};

// Feature metadata
export const MARKETPLACE_FEATURE_NAME = 'marketplace';
export const MARKETPLACE_FEATURE_VERSION = '1.0.0';
export const MARKETPLACE_FEATURE_DESCRIPTION = 'Business marketplace with listings, search, and filtering';

// Feature configuration
export const marketplaceConfig = {
    itemsPerPage: 12,
    maxSearchResults: 100,
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
    autoRefresh: true,
    refreshInterval: 2 * 60 * 1000, // 2 minutes
    defaultSortBy: 'price',
    defaultSortOrder: 'asc',
    enableFilters: true,
    enableSearch: true,
    enableCategories: true
};

// Feature capabilities detection
export const getMarketplaceCapabilities = async () => {
    const services = await getAvailableServices();
    const components = await getAvailableComponents();
    const pages = await getAvailablePages();

    return {
        services: {
            marketplace: true, // Always available
            listings: !!services.listings,
            search: !!services.search,
            filters: !!services.filters
        },
        components: {
            listingCard: !!components.ListingCard,
            searchFilters: !!components.SearchFilters,
            listingDetails: !!components.ListingDetails,
            savedListings: !!components.SavedListings
        },
        pages: {
            listings: !!pages.listings
        },
        features: {
            search: marketplaceConfig.enableSearch,
            filters: marketplaceConfig.enableFilters,
            categories: marketplaceConfig.enableCategories,
            autoRefresh: marketplaceConfig.autoRefresh,
            caching: true
        }
    };
};

// Convenience function to get all marketplace resources
export const getMarketplaceModule = async () => {
    const [services, components, pages, capabilities] = await Promise.all([
        getAvailableServices(),
        getAvailableComponents(),
        getAvailablePages(),
        getMarketplaceCapabilities()
    ]);

    return {
        services: {
            marketplace: MarketplaceService,
            ...services
        },
        components,
        pages,
        capabilities,
        config: marketplaceConfig,
        metadata: {
            name: MARKETPLACE_FEATURE_NAME,
            version: MARKETPLACE_FEATURE_VERSION,
            description: MARKETPLACE_FEATURE_DESCRIPTION
        }
    };
};

// Legacy exports for backward compatibility
export const FEATURE_NAME = MARKETPLACE_FEATURE_NAME;
export const FEATURE_VERSION = MARKETPLACE_FEATURE_VERSION;
export const FEATURE_DESCRIPTION = MARKETPLACE_FEATURE_DESCRIPTION;

// Direct component exports for immediate use (backward compatibility)
// NOTE: Components commented out until they are created to prevent 404 errors
// export { ListingCard } from './components/listing-card.component.js';
// export { SearchFilters } from './components/search-filters.component.js';
// export { ListingDetails } from './components/listing-details.component.js';
// export { SavedListings } from './components/saved-listings.component.js';
