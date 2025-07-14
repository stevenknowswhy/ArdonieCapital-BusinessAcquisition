
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
 * Matchmaking Feature - Public API
 * Central export point for all matchmaking and compatibility functionality
 * This file defines what is public and what is private for the matchmaking module
 */

// Core Services - Always available
export { MatchmakingService } from './services/matchmaking.service.js';

// Enhanced Matchmaking Services
export { matchmakingAlgorithmService } from './services/matchmaking-algorithm.service.js';
export { matchManagementService } from './services/match-management.service.js';

// Conditional Service Exports - Only export what exists
export const getAvailableServices = async () => {
    const services = {};

    try {
        const { MatchmakingService } = await import('./services/matchmaking.service.js');
        services.matchmaking = new MatchmakingService();
    } catch (e) {
        console.debug('Matchmaking service not available');
    }

    return services;
};

// Component Exports - Only export what exists
export const getAvailableComponents = async () => {
    const components = {};

    try {
        const { MatchCard } = await import('./components/match-card.component.js');
        components.MatchCard = MatchCard;
    } catch (e) {
        console.debug('Match card component not available');
    }

    try {
        const { MatchFilters } = await import('./components/match-filters.component.js');
        components.MatchFilters = MatchFilters;
    } catch (e) {
        console.debug('Match filters component not available');
    }

    try {
        const { MatchDetails } = await import('./components/match-details.component.js');
        components.MatchDetails = MatchDetails;
    } catch (e) {
        console.debug('Match details component not available');
    }

    try {
        const { CompatibilityScore } = await import('./components/compatibility-score.component.js');
        components.CompatibilityScore = CompatibilityScore;
    } catch (e) {
        console.debug('Compatibility score component not available');
    }

    return components;
};

// Page Exports - HTML pages (if they exist)
export const getAvailablePages = async () => {
    const pages = {};

    try {
        pages.matches = await import('./pages/matches.html');
    } catch (e) {
        console.debug('Matches page not available');
    }

    return pages;
};

// Feature metadata
export const MATCHMAKING_FEATURE_NAME = 'matchmaking';
export const MATCHMAKING_FEATURE_VERSION = '1.0.0';
export const MATCHMAKING_FEATURE_DESCRIPTION = 'Buyer-seller matchmaking and compatibility system';

// Feature configuration
export const matchmakingConfig = {
    matchesPerPage: 12,
    maxMatches: 50,
    compatibilityThreshold: 0.7,
    autoRefresh: true,
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    enableNotifications: true,
    enableAnalytics: true,
    enableSavedMatches: true,
    scoreWeights: {
        location: 0.3,
        budget: 0.25,
        experience: 0.2,
        timeline: 0.15,
        preferences: 0.1
    }
};

// Feature capabilities detection
export const getMatchmakingCapabilities = async () => {
    const services = await getAvailableServices();
    const components = await getAvailableComponents();
    const pages = await getAvailablePages();

    return {
        services: {
            matchmaking: !!services.matchmaking
        },
        components: {
            matchCard: !!components.MatchCard,
            matchFilters: !!components.MatchFilters,
            matchDetails: !!components.MatchDetails,
            compatibilityScore: !!components.CompatibilityScore
        },
        pages: {
            matches: !!pages.matches
        },
        features: {
            compatibilityScoring: true,
            savedMatches: matchmakingConfig.enableSavedMatches,
            notifications: matchmakingConfig.enableNotifications,
            analytics: matchmakingConfig.enableAnalytics,
            autoRefresh: matchmakingConfig.autoRefresh,
            filtering: true,
            preferences: true
        }
    };
};

// Convenience function to get all matchmaking resources
export const getMatchmakingModule = async () => {
    const [services, components, pages, capabilities] = await Promise.all([
        getAvailableServices(),
        getAvailableComponents(),
        getAvailablePages(),
        getMatchmakingCapabilities()
    ]);

    return {
        services: {
            matchmaking: MatchmakingService,
            ...services
        },
        components,
        pages,
        capabilities,
        config: matchmakingConfig,
        metadata: {
            name: MATCHMAKING_FEATURE_NAME,
            version: MATCHMAKING_FEATURE_VERSION,
            description: MATCHMAKING_FEATURE_DESCRIPTION
        }
    };
};

// Legacy exports for backward compatibility
export const FEATURE_NAME = MATCHMAKING_FEATURE_NAME;
export const FEATURE_VERSION = MATCHMAKING_FEATURE_VERSION;
export const FEATURE_DESCRIPTION = MATCHMAKING_FEATURE_DESCRIPTION;

// Enhanced Matchmaking Constants
export const ENHANCED_MATCH_STATUSES = {
    GENERATED: 'generated',
    VIEWED: 'viewed',
    INTERESTED: 'interested',
    NOT_INTERESTED: 'not_interested',
    CONTACTED: 'contacted',
    MEETING_SCHEDULED: 'meeting_scheduled',
    IN_NEGOTIATION: 'in_negotiation',
    DEAL_CREATED: 'deal_created',
    EXPIRED: 'expired'
};

export const FEEDBACK_TYPES = {
    QUALITY: 'quality',
    RELEVANCE: 'relevance',
    ACCURACY: 'accuracy',
    OVERALL: 'overall'
};

export const INTERACTION_TYPES = {
    VIEWED: 'viewed',
    CLICKED: 'clicked',
    CONTACTED: 'contacted',
    SAVED: 'saved',
    SHARED: 'shared',
    STATUS_CHANGE: 'status_change',
    FEEDBACK_PROVIDED: 'feedback_provided',
    MEETING_SCHEDULED: 'meeting_scheduled'
};

// Enhanced scoring weights
export const ENHANCED_SCORING_WEIGHTS = {
    business_type: 0.25,
    price_range: 0.20,
    location: 0.15,
    experience: 0.15,
    timeline: 0.10,
    financing: 0.10,
    revenue_range: 0.05
};

// Match quality thresholds
export const QUALITY_THRESHOLDS = {
    EXCELLENT: 90,
    GOOD: 80,
    FAIR: 70,
    POOR: 60,
    MINIMUM: 50
};
