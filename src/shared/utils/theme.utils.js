/**
 * Theme Utilities
 * Provides theme management functionality for the application
 */

class ThemeUtils {
    constructor() {
        this.themes = ['light', 'dark'];
        this.defaultTheme = 'light';
        this.storageKey = 'theme';
        this.currentTheme = this.getTheme();
    }

    /**
     * Get current theme
     * @returns {string} Current theme name
     */
    getTheme() {
        if (typeof window === 'undefined') {
            return this.defaultTheme;
        }

        // Check localStorage first
        const stored = localStorage.getItem(this.storageKey);
        if (stored && this.themes.includes(stored)) {
            return stored;
        }

        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }

        return this.defaultTheme;
    }

    /**
     * Set theme
     * @param {string} theme - Theme name to set
     * @returns {boolean} Success status
     */
    setTheme(theme) {
        if (!this.themes.includes(theme)) {
            console.warn(`Theme "${theme}" is not supported. Available themes:`, this.themes);
            return false;
        }

        this.currentTheme = theme;

        const windowObj = (typeof window !== 'undefined' && window) || global.window;
        const localStorageObj = (typeof localStorage !== 'undefined' && localStorage) || global.localStorage;

        if (windowObj || localStorageObj) {
            // Store in localStorage
            if (localStorageObj) {
                localStorageObj.setItem(this.storageKey, theme);
            }

            // Apply to document
            if (windowObj && windowObj.document && windowObj.document.documentElement) {
                windowObj.document.documentElement.classList.remove(...this.themes);
                windowObj.document.documentElement.classList.add(theme);

                // Dispatch theme change event
                windowObj.dispatchEvent(new CustomEvent('themechange', {
                    detail: { theme, previousTheme: this.currentTheme }
                }));
            }
        }

        return true;
    }

    /**
     * Toggle between light and dark themes
     * @returns {string} New theme name
     */
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        return newTheme;
    }

    /**
     * Initialize theme system
     */
    init() {
        if (typeof window === 'undefined') {
            return;
        }

        // Apply current theme
        this.setTheme(this.currentTheme);

        // Listen for system theme changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                // Only auto-switch if no theme is stored (user hasn't made a choice)
                if (!localStorage.getItem(this.storageKey)) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    /**
     * Get theme CSS variables
     * @param {string} theme - Theme name
     * @returns {Object} CSS variables for the theme
     */
    getThemeVariables(theme = this.currentTheme) {
        const themes = {
            light: {
                '--color-primary': '#3b82f6',
                '--color-secondary': '#64748b',
                '--color-background': '#ffffff',
                '--color-surface': '#f8fafc',
                '--color-text': '#1e293b',
                '--color-text-secondary': '#64748b',
                '--color-border': '#e2e8f0',
                '--color-success': '#10b981',
                '--color-warning': '#f59e0b',
                '--color-error': '#ef4444'
            },
            dark: {
                '--color-primary': '#60a5fa',
                '--color-secondary': '#94a3b8',
                '--color-background': '#0f172a',
                '--color-surface': '#1e293b',
                '--color-text': '#f1f5f9',
                '--color-text-secondary': '#94a3b8',
                '--color-border': '#334155',
                '--color-success': '#34d399',
                '--color-warning': '#fbbf24',
                '--color-error': '#f87171'
            }
        };

        return themes[theme] || themes[this.defaultTheme];
    }

    /**
     * Apply theme variables to element
     * @param {HTMLElement} element - Element to apply variables to
     * @param {string} theme - Theme name
     */
    applyThemeVariables(element, theme = this.currentTheme) {
        if (!element || typeof window === 'undefined') {
            return;
        }

        const variables = this.getThemeVariables(theme);
        Object.entries(variables).forEach(([property, value]) => {
            element.style.setProperty(property, value);
        });
    }

    /**
     * Check if dark theme is active
     * @returns {boolean} True if dark theme is active
     */
    isDarkTheme() {
        return this.currentTheme === 'dark';
    }

    /**
     * Check if light theme is active
     * @returns {boolean} True if light theme is active
     */
    isLightTheme() {
        return this.currentTheme === 'light';
    }

    /**
     * Get available themes
     * @returns {Array} Array of available theme names
     */
    getAvailableThemes() {
        return [...this.themes];
    }

    /**
     * Add custom theme
     * @param {string} name - Theme name
     * @param {Object} variables - CSS variables for the theme
     * @returns {boolean} Success status
     */
    addCustomTheme(name, variables) {
        if (this.themes.includes(name)) {
            console.warn(`Theme "${name}" already exists`);
            return false;
        }

        this.themes.push(name);
        // Store custom theme variables (implementation would depend on requirements)
        return true;
    }
}

// Export singleton instance
export const themeUtils = new ThemeUtils();

// Export individual functions for backward compatibility
export const getTheme = () => themeUtils.getTheme();
export const setTheme = (theme) => themeUtils.setTheme(theme);
export const toggleTheme = () => themeUtils.toggleTheme();
export const isDarkTheme = () => themeUtils.isDarkTheme();
export const isLightTheme = () => themeUtils.isLightTheme();
export const getAvailableThemes = () => themeUtils.getAvailableThemes();
export const applyThemeVariables = (element, theme) => themeUtils.applyThemeVariables(element, theme);
export const getThemeVariables = (theme) => themeUtils.getThemeVariables(theme);

// Auto-initialize
if (typeof window !== 'undefined') {
    themeUtils.init();
}

export default themeUtils;
