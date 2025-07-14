
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
 * Dashboard Feature - Public API
 * Central export point for all dashboard-related functionality
 * This file defines what is public and what is private for the dashboard module
 */

// Core Services - Always available
export { DashboardService } from './services/dashboard.service.js';

// Conditional Service Exports - Only export what exists
export const getAvailableServices = async () => {
    const services = {};

    try {
        const { analyticsService } = await import('./services/analytics.service.js');
        services.analytics = analyticsService;
    } catch (e) {
        console.debug('Analytics service not available');
    }

    try {
        const { notificationService } = await import('./services/notification.service.js');
        services.notifications = notificationService;
    } catch (e) {
        console.debug('Notification service not available');
    }

    try {
        const { widgetManager } = await import('./services/widget-manager.service.js');
        services.widgets = widgetManager;
    } catch (e) {
        console.debug('Widget manager not available');
    }

    return services;
};

// Component Exports - Only export what exists
export const getAvailableComponents = async () => {
    const components = {};

    try {
        const { DashboardHeader } = await import('./components/dashboard-header.component.js');
        components.Header = DashboardHeader;
    } catch (e) {
        console.debug('Dashboard header component not available');
    }

    try {
        const { DashboardSidebar } = await import('./components/dashboard-sidebar.component.js');
        components.Sidebar = DashboardSidebar;
    } catch (e) {
        console.debug('Dashboard sidebar component not available');
    }

    try {
        const { KPICard } = await import('./components/kpi-card.component.js');
        components.KPICard = KPICard;
    } catch (e) {
        console.debug('KPI card component not available');
    }

    try {
        const { ActivityFeed } = await import('./components/activity-feed.component.js');
        components.ActivityFeed = ActivityFeed;
    } catch (e) {
        console.debug('Activity feed component not available');
    }

    return components;
};

// Page Exports - HTML pages (if they exist)
export const getAvailablePages = async () => {
    const pages = {};

    try {
        pages.buyerDashboard = await import('./pages/buyer-dashboard.html');
    } catch (e) {
        console.debug('Buyer dashboard page not available');
    }

    try {
        pages.sellerDashboard = await import('./pages/seller-dashboard.html');
    } catch (e) {
        console.debug('Seller dashboard page not available');
    }

    return pages;
};

// Feature metadata
export const DASHBOARD_FEATURE_NAME = 'dashboard';
export const DASHBOARD_FEATURE_VERSION = '1.0.0';
export const DASHBOARD_FEATURE_DESCRIPTION = 'User dashboard functionality for buyers and sellers';

// Feature configuration
export const dashboardConfig = {
    refreshInterval: 30000, // 30 seconds
    maxActivityItems: 50,
    kpiUpdateInterval: 60000, // 1 minute
    autoSave: true,
    autoSaveInterval: 10000, // 10 seconds
    enableRealTime: true,
    theme: 'default',
    maxNotifications: 50
};

// Feature capabilities detection
export const getDashboardCapabilities = async () => {
    const services = await getAvailableServices();
    const components = await getAvailableComponents();
    const pages = await getAvailablePages();

    return {
        services: {
            dashboard: true, // Always available
            analytics: !!services.analytics,
            notifications: !!services.notifications,
            widgets: !!services.widgets
        },
        components: {
            header: !!components.Header,
            sidebar: !!components.Sidebar,
            kpiCard: !!components.KPICard,
            activityFeed: !!components.ActivityFeed
        },
        pages: {
            buyerDashboard: !!pages.buyerDashboard,
            sellerDashboard: !!pages.sellerDashboard
        },
        features: {
            realTime: dashboardConfig.enableRealTime,
            autoSave: dashboardConfig.autoSave,
            customization: true,
            responsive: true
        }
    };
};

// Convenience function to get all dashboard resources
export const getDashboardModule = async () => {
    const [services, components, pages, capabilities] = await Promise.all([
        getAvailableServices(),
        getAvailableComponents(),
        getAvailablePages(),
        getDashboardCapabilities()
    ]);

    return {
        services: {
            dashboard: DashboardService,
            ...services
        },
        components,
        pages,
        capabilities,
        config: dashboardConfig,
        metadata: {
            name: DASHBOARD_FEATURE_NAME,
            version: DASHBOARD_FEATURE_VERSION,
            description: DASHBOARD_FEATURE_DESCRIPTION
        }
    };
};

// Legacy exports for backward compatibility
export const FEATURE_NAME = DASHBOARD_FEATURE_NAME;
export const FEATURE_VERSION = DASHBOARD_FEATURE_VERSION;
export const FEATURE_DESCRIPTION = DASHBOARD_FEATURE_DESCRIPTION;
