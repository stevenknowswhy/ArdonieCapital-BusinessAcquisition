
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
 * Component Library - Public API
 * Central export point for all shared UI components
 */

// Core Components
export * from './button.component.js';
export * from './modal.component.js';
export * from './card.component.js';
export * from './input.component.js';
export * from './header.component.js';

// Component metadata
export const COMPONENT_LIBRARY_NAME = 'ardonie-components';
export const COMPONENT_LIBRARY_VERSION = '1.0.0';
export const COMPONENT_LIBRARY_DESCRIPTION = 'Reusable UI component library for Ardonie Capital platform';

// Component configuration
export const componentConfig = {
    // Global component settings
    global: {
        theme: 'default',
        size: 'medium',
        animation: true,
        accessibility: true,
        responsive: true
    },
    
    // Button configuration
    button: {
        defaultVariant: 'primary',
        defaultSize: 'medium',
        enableRipple: true,
        enableLoading: true,
        enableIcons: true
    },
    
    // Modal configuration
    modal: {
        defaultSize: 'medium',
        enableBackdrop: true,
        enableEscapeClose: true,
        enableOverlayClose: true,
        enableAnimation: true,
        enableFocusManagement: true
    },
    
    // Card configuration
    card: {
        defaultVariant: 'default',
        defaultSize: 'medium',
        defaultShadow: 'medium',
        enableBorder: true,
        enableRounded: true,
        enableHover: false
    },
    
    // Input configuration
    input: {
        defaultSize: 'medium',
        defaultVariant: 'default',
        enableValidation: true,
        enableRealTimeValidation: true,
        enableAccessibility: true
    },
    
    // Header configuration
    header: {
        enableResponsive: true,
        enableMobileMenu: true,
        enableThemeToggle: true,
        enableSearch: false,
        enableNotifications: false
    }
};

// Component capabilities
export const componentCapabilities = {
    // Button capabilities
    button: {
        variants: ['primary', 'secondary', 'outline', 'ghost', 'danger', 'success', 'warning'],
        sizes: ['small', 'medium', 'large', 'xlarge'],
        states: ['default', 'loading', 'disabled'],
        features: ['icons', 'ripple', 'fullWidth', 'accessibility']
    },
    
    // Modal capabilities
    modal: {
        sizes: ['small', 'medium', 'large', 'xlarge', 'full'],
        features: ['backdrop', 'escapeClose', 'overlayClose', 'animation', 'focusManagement'],
        sections: ['header', 'body', 'footer'],
        accessibility: ['aria', 'keyboard', 'screenReader']
    },
    
    // Card capabilities
    card: {
        variants: ['default', 'primary', 'secondary', 'success', 'warning', 'danger', 'info'],
        sizes: ['small', 'medium', 'large'],
        shadows: ['none', 'small', 'medium', 'large', 'xlarge'],
        features: ['border', 'rounded', 'hoverable', 'clickable', 'loading'],
        sections: ['header', 'body', 'footer']
    },
    
    // Input capabilities
    input: {
        types: ['text', 'email', 'password', 'tel', 'url', 'number', 'search'],
        variants: ['default', 'success', 'error', 'warning'],
        sizes: ['small', 'medium', 'large'],
        features: ['validation', 'realTimeValidation', 'helpText', 'errorText', 'required', 'disabled', 'readonly'],
        validation: ['required', 'email', 'phone', 'url', 'custom']
    },
    
    // Header capabilities
    header: {
        features: ['responsive', 'mobileMenu', 'themeToggle', 'search', 'notifications', 'userMenu'],
        navigation: ['horizontal', 'dropdown', 'mega'],
        branding: ['logo', 'text', 'custom'],
        accessibility: ['aria', 'keyboard', 'screenReader']
    }
};

// Component factory functions
export const componentFactory = {
    /**
     * Create button with predefined configuration
     * @param {string} type - Button type
     * @param {string} text - Button text
     * @param {Object} options - Additional options
     * @returns {HTMLElement} Button element
     */
    createButton(type, text, options = {}) {
        const { ButtonComponent } = require('./button.component.js');
        const button = new ButtonComponent({ 
            variant: type, 
            ...options 
        });
        return button.create(text);
    },
    
    /**
     * Create modal with predefined configuration
     * @param {string} type - Modal type
     * @param {Object} content - Modal content
     * @param {Object} options - Additional options
     * @returns {Object} Modal instance
     */
    createModal(type, content, options = {}) {
        const { ModalComponent } = require('./modal.component.js');
        const modalOptions = {
            ...options,
            size: type === 'alert' ? 'small' : options.size || 'medium'
        };
        
        const modal = new ModalComponent(modalOptions);
        modal.create(content);
        return modal;
    },
    
    /**
     * Create card with predefined configuration
     * @param {string} type - Card type
     * @param {Object} content - Card content
     * @param {Object} options - Additional options
     * @returns {HTMLElement} Card element
     */
    createCard(type, content, options = {}) {
        const { CardComponent } = require('./card.component.js');
        const card = new CardComponent({ 
            variant: type, 
            ...options 
        });
        return card.create(content);
    },
    
    /**
     * Create input with predefined configuration
     * @param {string} type - Input type
     * @param {string} label - Input label
     * @param {Object} options - Additional options
     * @returns {HTMLElement} Input element
     */
    createInput(type, label, options = {}) {
        const { InputComponent } = require('./input.component.js');
        const input = new InputComponent({ 
            type: type, 
            label: label, 
            ...options 
        });
        return input.create();
    }
};

// Component utilities
export const componentUtils = {
    /**
     * Check if a component capability is available
     * @param {string} component - Component name
     * @param {string} capability - Capability name
     * @returns {boolean} True if capability is available
     */
    hasCapability(component, capability) {
        const componentCaps = componentCapabilities[component];
        if (!componentCaps) return false;
        
        // Check in different capability categories
        for (const category of Object.values(componentCaps)) {
            if (Array.isArray(category) && category.includes(capability)) {
                return true;
            }
        }
        
        return false;
    },
    
    /**
     * Get all capabilities for a component
     * @param {string} component - Component name
     * @returns {Object} Component capabilities
     */
    getCapabilities(component) {
        return componentCapabilities[component] || {};
    },
    
    /**
     * Get configuration for a component
     * @param {string} component - Component name
     * @returns {Object} Component configuration
     */
    getConfig(component) {
        return componentConfig[component] || {};
    },
    
    /**
     * Update configuration for a component
     * @param {string} component - Component name
     * @param {Object} updates - Configuration updates
     */
    updateConfig(component, updates) {
        if (componentConfig[component]) {
            Object.assign(componentConfig[component], updates);
        }
    },
    
    /**
     * Get component library information
     * @returns {Object} Library information
     */
    getLibraryInfo() {
        return {
            name: COMPONENT_LIBRARY_NAME,
            version: COMPONENT_LIBRARY_VERSION,
            description: COMPONENT_LIBRARY_DESCRIPTION,
            config: componentConfig,
            capabilities: componentCapabilities
        };
    },
    
    /**
     * Initialize component library with global settings
     * @param {Object} settings - Global settings
     */
    initialize(settings = {}) {
        // Update global configuration
        Object.assign(componentConfig.global, settings);
        
        // Apply theme if specified
        if (settings.theme) {
            document.documentElement.setAttribute('data-theme', settings.theme);
        }
        
        // Apply global CSS classes if needed
        if (settings.className) {
            document.body.classList.add(...settings.className.split(' '));
        }
        
        console.log('Component library initialized with settings:', settings);
    },
    
    /**
     * Create component theme
     * @param {string} name - Theme name
     * @param {Object} theme - Theme configuration
     */
    createTheme(name, theme) {
        const style = document.createElement('style');
        style.setAttribute('data-theme', name);
        
        let css = `[data-theme="${name}"] {\n`;
        Object.entries(theme).forEach(([property, value]) => {
            css += `  --${property}: ${value};\n`;
        });
        css += '}';
        
        style.textContent = css;
        document.head.appendChild(style);
    },
    
    /**
     * Apply component theme
     * @param {string} theme - Theme name
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        componentConfig.global.theme = theme;
    }
};

// Component validation
export const componentValidation = {
    /**
     * Validate component options
     * @param {string} component - Component name
     * @param {Object} options - Component options
     * @returns {Object} Validation result
     */
    validateOptions(component, options) {
        const capabilities = componentCapabilities[component];
        if (!capabilities) {
            return { isValid: false, errors: [`Unknown component: ${component}`] };
        }
        
        const errors = [];
        
        // Validate variant
        if (options.variant && capabilities.variants && !capabilities.variants.includes(options.variant)) {
            errors.push(`Invalid variant "${options.variant}" for ${component}. Available: ${capabilities.variants.join(', ')}`);
        }
        
        // Validate size
        if (options.size && capabilities.sizes && !capabilities.sizes.includes(options.size)) {
            errors.push(`Invalid size "${options.size}" for ${component}. Available: ${capabilities.sizes.join(', ')}`);
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },
    
    /**
     * Validate component accessibility
     * @param {HTMLElement} element - Component element
     * @returns {Object} Accessibility validation result
     */
    validateAccessibility(element) {
        const errors = [];
        
        // Check for required ARIA attributes
        if (element.getAttribute('role') === 'button' && !element.hasAttribute('aria-label') && !element.textContent.trim()) {
            errors.push('Button elements should have accessible text or aria-label');
        }
        
        if (element.getAttribute('role') === 'dialog' && !element.hasAttribute('aria-labelledby')) {
            errors.push('Dialog elements should have aria-labelledby attribute');
        }
        
        // Check for keyboard accessibility
        const interactiveElements = element.querySelectorAll('button, input, select, textarea, a[href], [tabindex]');
        interactiveElements.forEach(el => {
            if (el.tabIndex < 0 && !el.hasAttribute('aria-hidden')) {
                errors.push('Interactive elements should be keyboard accessible');
            }
        });
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
};

// Export default configuration
export default {
    name: COMPONENT_LIBRARY_NAME,
    version: COMPONENT_LIBRARY_VERSION,
    description: COMPONENT_LIBRARY_DESCRIPTION,
    config: componentConfig,
    capabilities: componentCapabilities,
    factory: componentFactory,
    utils: componentUtils,
    validation: componentValidation
};
