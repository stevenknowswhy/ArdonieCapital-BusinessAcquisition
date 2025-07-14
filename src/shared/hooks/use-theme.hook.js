
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
 * Theme Hook
 * Manages dark/light mode functionality and theme persistence
 */

export class ThemeHook {
    constructor() {
        this.storageKey = 'ardonie_theme';
        this.currentTheme = 'light';
        this.systemPreference = 'light';
        this.listeners = new Set();
        this.mediaQuery = null;
        
        this.init();
    }

    /**
     * Initialize theme system
     */
    init() {
        // Detect system preference
        this.detectSystemPreference();
        
        // Load saved theme or use system preference
        this.loadTheme();
        
        // Apply initial theme
        this.applyTheme(this.currentTheme);
        
        // Listen for system preference changes
        this.setupSystemPreferenceListener();
        
        // Initialize theme toggle elements
        this.initializeToggleElements();
    }

    /**
     * Detect system color scheme preference
     */
    detectSystemPreference() {
        if (window.matchMedia) {
            this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            this.systemPreference = this.mediaQuery.matches ? 'dark' : 'light';
        }
    }

    /**
     * Load theme from storage or use system preference
     */
    loadTheme() {
        try {
            const savedTheme = localStorage.getItem(this.storageKey);
            
            if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
                this.currentTheme = savedTheme;
            } else {
                this.currentTheme = 'auto';
            }
        } catch (error) {
            console.error('Failed to load theme from storage:', error);
            this.currentTheme = 'auto';
        }
    }

    /**
     * Save theme to storage
     * @param {string} theme - Theme to save
     */
    saveTheme(theme) {
        try {
            localStorage.setItem(this.storageKey, theme);
        } catch (error) {
            console.error('Failed to save theme to storage:', error);
        }
    }

    /**
     * Apply theme to document
     * @param {string} theme - Theme to apply ('light', 'dark', 'auto')
     */
    applyTheme(theme) {
        const html = document.documentElement;
        const effectiveTheme = this.getEffectiveTheme(theme);
        
        // Remove existing theme classes
        html.classList.remove('light', 'dark');
        
        // Add new theme class
        html.classList.add(effectiveTheme);
        
        // Update meta theme-color for mobile browsers
        this.updateMetaThemeColor(effectiveTheme);
        
        // Notify listeners
        this.notifyListeners(effectiveTheme, theme);
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: {
                theme: effectiveTheme,
                userPreference: theme,
                systemPreference: this.systemPreference
            }
        }));
    }

    /**
     * Get effective theme (resolves 'auto' to actual theme)
     * @param {string} theme - Theme preference
     * @returns {string} Effective theme ('light' or 'dark')
     */
    getEffectiveTheme(theme) {
        if (theme === 'auto') {
            return this.systemPreference;
        }
        return theme;
    }

    /**
     * Update meta theme-color for mobile browsers
     * @param {string} theme - Current theme
     */
    updateMetaThemeColor(theme) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        
        const colors = {
            light: '#ffffff',
            dark: '#0f172a'
        };
        
        metaThemeColor.content = colors[theme] || colors.light;
    }

    /**
     * Set theme
     * @param {string} theme - Theme to set ('light', 'dark', 'auto')
     */
    setTheme(theme) {
        if (!['light', 'dark', 'auto'].includes(theme)) {
            console.error('Invalid theme:', theme);
            return;
        }
        
        this.currentTheme = theme;
        this.saveTheme(theme);
        this.applyTheme(theme);
        this.updateToggleElements();
    }

    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        const currentEffective = this.getEffectiveTheme(this.currentTheme);
        const newTheme = currentEffective === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    /**
     * Get current theme
     * @returns {Object} Current theme information
     */
    getCurrentTheme() {
        return {
            preference: this.currentTheme,
            effective: this.getEffectiveTheme(this.currentTheme),
            system: this.systemPreference
        };
    }

    /**
     * Check if dark mode is active
     * @returns {boolean} True if dark mode is active
     */
    isDarkMode() {
        return this.getEffectiveTheme(this.currentTheme) === 'dark';
    }

    /**
     * Check if light mode is active
     * @returns {boolean} True if light mode is active
     */
    isLightMode() {
        return this.getEffectiveTheme(this.currentTheme) === 'light';
    }

    /**
     * Check if auto mode is enabled
     * @returns {boolean} True if auto mode is enabled
     */
    isAutoMode() {
        return this.currentTheme === 'auto';
    }

    /**
     * Add theme change listener
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    addListener(callback) {
        this.listeners.add(callback);
        
        // Return unsubscribe function
        return () => {
            this.listeners.delete(callback);
        };
    }

    /**
     * Remove theme change listener
     * @param {Function} callback - Callback function to remove
     */
    removeListener(callback) {
        this.listeners.delete(callback);
    }

    /**
     * Notify all listeners of theme change
     * @param {string} effectiveTheme - Current effective theme
     * @param {string} userPreference - User's theme preference
     */
    notifyListeners(effectiveTheme, userPreference) {
        const themeInfo = {
            theme: effectiveTheme,
            preference: userPreference,
            system: this.systemPreference,
            isDark: effectiveTheme === 'dark',
            isLight: effectiveTheme === 'light',
            isAuto: userPreference === 'auto'
        };
        
        this.listeners.forEach(callback => {
            try {
                callback(themeInfo);
            } catch (error) {
                console.error('Theme listener error:', error);
            }
        });
    }

    /**
     * Setup system preference change listener
     */
    setupSystemPreferenceListener() {
        if (this.mediaQuery) {
            this.mediaQuery.addEventListener('change', (e) => {
                this.systemPreference = e.matches ? 'dark' : 'light';
                
                // If using auto mode, apply the new system preference
                if (this.currentTheme === 'auto') {
                    this.applyTheme('auto');
                }
            });
        }
    }

    /**
     * Initialize theme toggle elements
     */
    initializeToggleElements() {
        // Find all theme toggle elements
        const toggleElements = document.querySelectorAll('[data-theme-toggle]');
        
        toggleElements.forEach(element => {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTheme();
            });
        });
        
        // Find theme selector elements
        const selectorElements = document.querySelectorAll('[data-theme-selector]');
        
        selectorElements.forEach(element => {
            element.addEventListener('change', (e) => {
                this.setTheme(e.target.value);
            });
        });
        
        // Update initial state
        this.updateToggleElements();
    }

    /**
     * Update theme toggle elements to reflect current state
     */
    updateToggleElements() {
        const currentTheme = this.getCurrentTheme();
        
        // Update toggle buttons
        const toggleElements = document.querySelectorAll('[data-theme-toggle]');
        toggleElements.forEach(element => {
            const isDark = currentTheme.effective === 'dark';
            element.setAttribute('aria-checked', isDark.toString());
            
            // Update text content if element has data-theme-text attribute
            const textElement = element.querySelector('[data-theme-text]') || element;
            if (textElement.hasAttribute('data-theme-text')) {
                textElement.textContent = isDark ? 'Dark Mode' : 'Light Mode';
            }
            
            // Update icon if element has theme icons
            const lightIcon = element.querySelector('[data-theme-icon="light"]');
            const darkIcon = element.querySelector('[data-theme-icon="dark"]');
            
            if (lightIcon && darkIcon) {
                lightIcon.style.display = isDark ? 'none' : 'block';
                darkIcon.style.display = isDark ? 'block' : 'none';
            }
        });
        
        // Update selector elements
        const selectorElements = document.querySelectorAll('[data-theme-selector]');
        selectorElements.forEach(element => {
            element.value = currentTheme.preference;
        });
    }

    /**
     * Get theme CSS variables for the current theme
     * @returns {Object} CSS variables object
     */
    getThemeVariables() {
        const isDark = this.isDarkMode();
        
        return {
            '--color-primary': isDark ? '#3b82f6' : '#2563eb',
            '--color-secondary': isDark ? '#64748b' : '#475569',
            '--color-background': isDark ? '#0f172a' : '#ffffff',
            '--color-surface': isDark ? '#1e293b' : '#f8fafc',
            '--color-text': isDark ? '#f1f5f9' : '#0f172a',
            '--color-text-secondary': isDark ? '#cbd5e1' : '#64748b',
            '--color-border': isDark ? '#334155' : '#e2e8f0',
            '--color-accent': isDark ? '#10b981' : '#059669'
        };
    }

    /**
     * Apply theme variables to document
     */
    applyThemeVariables() {
        const variables = this.getThemeVariables();
        const root = document.documentElement;
        
        Object.entries(variables).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });
    }

    /**
     * Reset theme to system default
     */
    resetTheme() {
        this.setTheme('auto');
    }

    /**
     * Get available themes
     * @returns {Array} Available theme options
     */
    getAvailableThemes() {
        return [
            { value: 'light', label: 'Light', icon: '☀️' },
            { value: 'dark', label: 'Dark', icon: '🌙' },
            { value: 'auto', label: 'Auto', icon: '🔄' }
        ];
    }
}

// Export singleton instance
export const useTheme = new ThemeHook();

// Export hook functions for easier usage
export const setTheme = (theme) => useTheme.setTheme(theme);
export const toggleTheme = () => useTheme.toggleTheme();
export const getCurrentTheme = () => useTheme.getCurrentTheme();
export const isDarkMode = () => useTheme.isDarkMode();
export const isLightMode = () => useTheme.isLightMode();
export const addThemeListener = (callback) => useTheme.addListener(callback);
export const removeThemeListener = (callback) => useTheme.removeListener(callback);
