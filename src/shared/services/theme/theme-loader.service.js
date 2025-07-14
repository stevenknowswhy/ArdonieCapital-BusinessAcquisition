
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
 * Theme Loader Service
 * Manages theme loading, registration, and application
 */

export class ThemeLoaderService {
    constructor() {
        this.themes = new Map();
        this.currentColorMode = 'light';
        this.userPreferences = {
            colorMode: 'auto',
            reducedMotion: false,
            highContrast: false
        };
        this.listeners = new Set();
        this.isInitialized = false;
    }

    /**
     * Initialize the theme system
     */
    init() {
        if (this.isInitialized) return;

        // Setup event listeners
        this.setupEventListeners();

        // Load user preferences
        this.loadUserPreferences();

        // Detect system preferences
        this.detectSystemPreferences();

        // Apply initial theme
        this.applyTheme();

        this.isInitialized = true;
        console.log('Theme system initialized');

        // Dispatch initialization event
        this.dispatchEvent('themeSystemInitialized');
    }

    /**
     * Register a theme component
     * @param {string} name - Theme component name
     * @param {Object} theme - Theme configuration
     * @returns {ThemeLoaderService} This instance for chaining
     */
    registerTheme(name, theme) {
        if (!name || typeof name !== 'string') {
            throw new Error('Theme name must be a non-empty string');
        }

        if (!theme || typeof theme !== 'object') {
            throw new Error('Theme must be an object');
        }

        this.themes.set(name, { ...theme });
        
        // Re-apply theme if system is initialized
        if (this.isInitialized) {
            this.applyTheme();
        }

        return this;
    }

    /**
     * Get a specific theme component
     * @param {string} name - Theme component name
     * @returns {Object|null} Theme configuration or null
     */
    getTheme(name) {
        return this.themes.get(name) || null;
    }

    /**
     * Get all registered themes
     * @returns {Object} All themes as an object
     */
    getAllThemes() {
        return Object.fromEntries(this.themes);
    }

    /**
     * Merge all registered themes into a single configuration
     * @returns {Object} Merged theme configuration
     */
    mergeThemes() {
        const merged = {
            colors: {},
            fontFamily: {},
            fontSize: {},
            spacing: {},
            borderRadius: {},
            boxShadow: {},
            animation: {},
            keyframes: {}
        };

        // Merge each theme
        for (const [name, theme] of this.themes) {
            this.deepMerge(merged, theme);
        }

        return merged;
    }

    /**
     * Apply theme to Tailwind configuration
     */
    applyTheme() {
        const mergedTheme = this.mergeThemes();

        // Apply to Tailwind if available
        if (window.tailwind && window.tailwind.config) {
            window.tailwind.config = {
                ...window.tailwind.config,
                darkMode: 'class',
                theme: {
                    ...window.tailwind.config.theme,
                    extend: {
                        ...window.tailwind.config.theme?.extend,
                        ...mergedTheme
                    }
                }
            };

            // Trigger Tailwind rebuild if available
            if (window.tailwind.rebuild) {
                window.tailwind.rebuild();
            }
        }

        // Apply CSS custom properties
        this.applyCSSCustomProperties(mergedTheme);

        // Apply color mode
        this.applyColorMode();

        // Notify listeners
        this.notifyListeners('themeApplied', { theme: mergedTheme });
    }

    /**
     * Apply CSS custom properties to document root
     * @param {Object} theme - Theme configuration
     */
    applyCSSCustomProperties(theme) {
        const root = document.documentElement;

        // Apply color variables
        if (theme.colors) {
            this.applyColorVariables(root, theme.colors);
        }

        // Apply spacing variables
        if (theme.spacing) {
            this.applySpacingVariables(root, theme.spacing);
        }

        // Apply typography variables
        if (theme.fontFamily || theme.fontSize) {
            this.applyTypographyVariables(root, theme);
        }
    }

    /**
     * Apply color variables to CSS
     * @param {HTMLElement} root - Document root element
     * @param {Object} colors - Color configuration
     */
    applyColorVariables(root, colors) {
        const flattenColors = (obj, prefix = '') => {
            const result = {};
            for (const [key, value] of Object.entries(obj)) {
                const newKey = prefix ? `${prefix}-${key}` : key;
                if (typeof value === 'object' && value !== null) {
                    Object.assign(result, flattenColors(value, newKey));
                } else {
                    result[newKey] = value;
                }
            }
            return result;
        };

        const flatColors = flattenColors(colors);
        for (const [key, value] of Object.entries(flatColors)) {
            root.style.setProperty(`--color-${key}`, value);
        }
    }

    /**
     * Apply spacing variables to CSS
     * @param {HTMLElement} root - Document root element
     * @param {Object} spacing - Spacing configuration
     */
    applySpacingVariables(root, spacing) {
        for (const [key, value] of Object.entries(spacing)) {
            root.style.setProperty(`--spacing-${key}`, value);
        }
    }

    /**
     * Apply typography variables to CSS
     * @param {HTMLElement} root - Document root element
     * @param {Object} theme - Theme configuration
     */
    applyTypographyVariables(root, theme) {
        if (theme.fontFamily) {
            for (const [key, value] of Object.entries(theme.fontFamily)) {
                const fontValue = Array.isArray(value) ? value.join(', ') : value;
                root.style.setProperty(`--font-${key}`, fontValue);
            }
        }

        if (theme.fontSize) {
            for (const [key, value] of Object.entries(theme.fontSize)) {
                const sizeValue = Array.isArray(value) ? value[0] : value;
                root.style.setProperty(`--text-${key}`, sizeValue);
            }
        }
    }

    /**
     * Apply color mode (light/dark)
     */
    applyColorMode() {
        const html = document.documentElement;
        const effectiveMode = this.getEffectiveColorMode();

        // Remove existing mode classes
        html.classList.remove('light', 'dark');

        // Add current mode class
        html.classList.add(effectiveMode);

        // Update current mode
        this.currentColorMode = effectiveMode;

        // Update meta theme-color
        this.updateMetaThemeColor(effectiveMode);

        // Notify listeners
        this.notifyListeners('colorModeChanged', { 
            mode: effectiveMode, 
            preference: this.userPreferences.colorMode 
        });
    }

    /**
     * Get effective color mode (resolves 'auto' to actual mode)
     * @returns {string} Effective color mode
     */
    getEffectiveColorMode() {
        if (this.userPreferences.colorMode === 'auto') {
            return this.getSystemColorMode();
        }
        return this.userPreferences.colorMode;
    }

    /**
     * Get system color mode preference
     * @returns {string} System color mode
     */
    getSystemColorMode() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    /**
     * Set color mode
     * @param {string} mode - Color mode ('light', 'dark', 'auto')
     */
    setColorMode(mode) {
        if (!['light', 'dark', 'auto'].includes(mode)) {
            throw new Error('Invalid color mode. Must be "light", "dark", or "auto"');
        }

        this.userPreferences.colorMode = mode;
        this.saveUserPreferences();
        this.applyColorMode();
    }

    /**
     * Toggle color mode between light and dark
     */
    toggleColorMode() {
        const currentEffective = this.getEffectiveColorMode();
        const newMode = currentEffective === 'light' ? 'dark' : 'light';
        this.setColorMode(newMode);
    }

    /**
     * Load user preferences from storage
     */
    loadUserPreferences() {
        try {
            const stored = localStorage.getItem('ardonie_theme_preferences');
            if (stored) {
                const preferences = JSON.parse(stored);
                this.userPreferences = { ...this.userPreferences, ...preferences };
            }
        } catch (error) {
            console.error('Failed to load theme preferences:', error);
        }
    }

    /**
     * Save user preferences to storage
     */
    saveUserPreferences() {
        try {
            localStorage.setItem('ardonie_theme_preferences', JSON.stringify(this.userPreferences));
        } catch (error) {
            console.error('Failed to save theme preferences:', error);
        }
    }

    /**
     * Detect system preferences
     */
    detectSystemPreferences() {
        // Detect reduced motion preference
        if (window.matchMedia) {
            const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            this.userPreferences.reducedMotion = reducedMotionQuery.matches;

            // Listen for changes
            reducedMotionQuery.addEventListener('change', (e) => {
                this.userPreferences.reducedMotion = e.matches;
                this.applyAccessibilityPreferences();
            });
        }

        // Detect high contrast preference
        if (window.matchMedia) {
            const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
            this.userPreferences.highContrast = highContrastQuery.matches;

            // Listen for changes
            highContrastQuery.addEventListener('change', (e) => {
                this.userPreferences.highContrast = e.matches;
                this.applyAccessibilityPreferences();
            });
        }
    }

    /**
     * Apply accessibility preferences
     */
    applyAccessibilityPreferences() {
        const html = document.documentElement;

        // Apply reduced motion
        html.classList.toggle('reduce-motion', this.userPreferences.reducedMotion);

        // Apply high contrast
        html.classList.toggle('high-contrast', this.userPreferences.highContrast);

        // Notify listeners
        this.notifyListeners('accessibilityPreferencesChanged', this.userPreferences);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for system color scheme changes
        if (window.matchMedia) {
            const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
            colorSchemeQuery.addEventListener('change', () => {
                if (this.userPreferences.colorMode === 'auto') {
                    this.applyColorMode();
                }
            });
        }
    }

    /**
     * Update meta theme-color for mobile browsers
     * @param {string} mode - Current color mode
     */
    updateMetaThemeColor(mode) {
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

        metaThemeColor.content = colors[mode] || colors.light;
    }

    /**
     * Deep merge objects
     * @param {Object} target - Target object
     * @param {Object} source - Source object
     */
    deepMerge(target, source) {
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!target[key]) target[key] = {};
                this.deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }

    /**
     * Add event listener
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    addListener(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    /**
     * Notify listeners of events
     * @param {string} event - Event name
     * @param {any} data - Event data
     */
    notifyListeners(event, data) {
        this.listeners.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Theme listener error:', error);
            }
        });
    }

    /**
     * Dispatch custom event
     * @param {string} eventName - Event name
     * @param {any} detail - Event detail
     */
    dispatchEvent(eventName, detail = {}) {
        window.dispatchEvent(new CustomEvent(eventName, { detail }));
    }
}

// Export singleton instance
export const themeLoader = new ThemeLoaderService();
