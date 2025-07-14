
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
 * Shared Module - Public API
 * Central export point for all shared utilities, components, hooks, and services
 */

// Export all utilities (includes validation, formatting, storage, UI)
export * from './utils/common.js';

// Export components
export * from './components/header.component.js';

// Export hooks
export * from './hooks/use-theme.hook.js';
export * from './hooks/use-mobile-menu.hook.js';

// Export all services (includes Supabase, theme, etc.)
export * from './services/index.js';

// Feature metadata
export const SHARED_MODULE_NAME = 'shared';
export const SHARED_MODULE_VERSION = '1.0.0';
export const SHARED_MODULE_DESCRIPTION = 'Shared utilities, components, and services for the Ardonie Capital platform';

// Module configuration
export const sharedConfig = {
    // Utility settings
    validation: {
        emailRegex: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
        phoneRegex: /^(\+1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/,
        strongPasswordMinLength: 12
    },
    
    // Formatting settings
    formatting: {
        defaultLocale: 'en-US',
        defaultCurrency: 'USD',
        defaultTimezone: 'America/New_York'
    },
    
    // Storage settings
    storage: {
        prefix: 'ardonie_',
        compressionThreshold: 1024,
        encryptSensitiveData: true
    },
    
    // UI settings
    ui: {
        toastDuration: 3000,
        loadingDebounce: 300,
        scrollAnimationDuration: 500
    },
    
    // Theme settings
    theme: {
        defaultMode: 'auto',
        enableSystemPreferences: true,
        enableAnimations: true,
        enableReducedMotion: true
    },
    
    // Mobile menu settings
    mobileMenu: {
        breakpoint: 768,
        enableOverlay: true,
        enableBodyLock: true,
        enableFocusManagement: true
    }
};

// Module capabilities
export const sharedCapabilities = {
    // Validation capabilities
    validation: {
        email: true,
        phone: true,
        creditCard: true,
        ssn: true,
        url: true,
        date: true,
        age: true,
        required: true,
        multiField: true
    },
    
    // Formatting capabilities
    formatting: {
        currency: true,
        currencyCompact: true,
        numbers: true,
        percentages: true,
        dates: true,
        time: true,
        relativeTime: true,
        phone: true,
        text: true,
        fileSize: true,
        businessHours: true
    },
    
    // Storage capabilities
    storage: {
        localStorage: true,
        sessionStorage: true,
        encryption: true,
        compression: true,
        expiration: true,
        quotaManagement: true,
        cleanup: true
    },
    
    // UI capabilities
    ui: {
        loading: true,
        toasts: true,
        scrolling: true,
        clipboard: true,
        animations: true,
        tooltips: true,
        rippleEffects: true,
        debouncing: true,
        throttling: true
    },
    
    // Theme capabilities
    theme: {
        lightMode: true,
        darkMode: true,
        autoMode: true,
        systemPreferences: true,
        customColors: true,
        animations: true,
        accessibility: true,
        persistence: true
    },
    
    // Mobile menu capabilities
    mobileMenu: {
        responsive: true,
        overlay: true,
        bodyLock: true,
        keyboardNavigation: true,
        focusManagement: true,
        accessibility: true,
        customBreakpoints: true
    },
    
    // Component capabilities
    components: {
        header: true,
        navigation: true,
        responsive: true,
        accessibility: true,
        theming: true
    }
};

// Utility functions for module management
export const sharedUtils = {
    /**
     * Check if a capability is available
     * @param {string} category - Capability category
     * @param {string} capability - Specific capability
     * @returns {boolean} True if capability is available
     */
    hasCapability(category, capability) {
        return sharedCapabilities[category]?.[capability] === true;
    },
    
    /**
     * Get all capabilities for a category
     * @param {string} category - Capability category
     * @returns {Object} Capabilities object
     */
    getCapabilities(category) {
        return sharedCapabilities[category] || {};
    },
    
    /**
     * Get configuration for a category
     * @param {string} category - Configuration category
     * @returns {Object} Configuration object
     */
    getConfig(category) {
        return sharedConfig[category] || {};
    },
    
    /**
     * Update configuration for a category
     * @param {string} category - Configuration category
     * @param {Object} updates - Configuration updates
     */
    updateConfig(category, updates) {
        if (sharedConfig[category]) {
            Object.assign(sharedConfig[category], updates);
        }
    },
    
    /**
     * Get module information
     * @returns {Object} Module information
     */
    getModuleInfo() {
        return {
            name: SHARED_MODULE_NAME,
            version: SHARED_MODULE_VERSION,
            description: SHARED_MODULE_DESCRIPTION,
            config: sharedConfig,
            capabilities: sharedCapabilities
        };
    }
};

// Export default configuration
export default {
    name: SHARED_MODULE_NAME,
    version: SHARED_MODULE_VERSION,
    description: SHARED_MODULE_DESCRIPTION,
    config: sharedConfig,
    capabilities: sharedCapabilities,
    utils: sharedUtils
};
