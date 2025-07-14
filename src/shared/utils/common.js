
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
 * Shared Utilities - Barrel Export
 * Central export point for all shared utility modules
 */

// Import all utility modules
export * from './validation.utils.js';
export * from './formatting.utils.js';
export * from './storage.utils.js';
export * from './ui.utils.js';

// Import hooks
export * from '../hooks/use-theme.hook.js';
export * from '../hooks/use-mobile-menu.hook.js';

// Import theme services
export * from '../services/theme/theme-loader.service.js';
export * from '../services/theme/base-theme.config.js';

// Legacy exports for backward compatibility
import { formattingUtils } from './formatting.utils.js';
import { validationUtils } from './validation.utils.js';
import { storageUtils } from './storage.utils.js';
import { uiUtils } from './ui.utils.js';

// Legacy function exports
export const formatCurrency = (amount, currency, locale, options) =>
    formattingUtils.formatCurrency(amount, currency, locale, options);

export const formatDate = (date, options, locale) =>
    formattingUtils.formatDate(date, options, locale);

export const formatRelativeTime = (date, baseDate, locale) =>
    formattingUtils.formatRelativeTime(date, baseDate, locale);

export const validateEmail = (email) =>
    validationUtils.validateEmail(email);

export const isValidEmail = (email) =>
    validationUtils.validateEmail(email).isValid;

export const isValidPhone = (phone) =>
    validationUtils.validatePhone(phone).isValid;

export const debounce = (func, wait) =>
    uiUtils.debounce(func, wait);

export const throttle = (func, limit) =>
    uiUtils.throttle(func, limit);

// Utility functions
export function generateId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function sanitizeHtml(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

export function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
        result[key] = value;
    }
    return result;
}

export function setQueryParams(params) {
    const url = new URL(window.location);
    Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
            url.searchParams.set(key, params[key]);
        } else {
            url.searchParams.delete(key);
        }
    });
    window.history.replaceState({}, '', url);
}

// Legacy storage object
export const storage = {
    get: (key, defaultValue) => storageUtils.loadFromLocalStorage(key, defaultValue),
    set: (key, value) => storageUtils.saveToLocalStorage(key, value),
    remove: (key) => storageUtils.removeFromLocalStorage(key),
    clear: () => storageUtils.clearStorage('localStorage')
};

// Legacy API object
export const api = {
    async request(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const config = { ...defaultOptions, ...options };

        // Add auth token if available
        const token = storage.get('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    },

    get(url, options = {}) {
        return this.request(url, { ...options, method: 'GET' });
    },

    post(url, data, options = {}) {
        return this.request(url, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    put(url, data, options = {}) {
        return this.request(url, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    delete(url, options = {}) {
        return this.request(url, { ...options, method: 'DELETE' });
    }
};

// Legacy DOM utilities
export const dom = {
    createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);

        Object.keys(attributes).forEach(key => {
            if (key === 'className') {
                element.className = attributes[key];
            } else if (key === 'dataset') {
                Object.keys(attributes[key]).forEach(dataKey => {
                    element.dataset[dataKey] = attributes[key][dataKey];
                });
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });

        if (content) {
            element.innerHTML = content;
        }

        return element;
    },

    show(element) {
        if (element) element.classList.remove('hidden');
    },

    hide(element) {
        if (element) element.classList.add('hidden');
    },

    toggle(element) {
        if (element) element.classList.toggle('hidden');
    },

    setLoading(element, loading = true) {
        if (!element) return;

        if (loading) {
            element.classList.add('opacity-50', 'pointer-events-none');
            element.setAttribute('aria-busy', 'true');
        } else {
            element.classList.remove('opacity-50', 'pointer-events-none');
            element.removeAttribute('aria-busy');
        }
    }
};

// Event emitter for component communication
export class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    off(event, callback) {
        if (!this.events[event]) return;

        this.events[event] = this.events[event].filter(cb => cb !== callback);
    }

    emit(event, data) {
        if (!this.events[event]) return;

        this.events[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('Error in event callback:', error);
            }
        });
    }
}

// Global event emitter instance
export const eventBus = new EventEmitter();
