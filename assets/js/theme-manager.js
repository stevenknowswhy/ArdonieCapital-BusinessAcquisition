/**
 * Theme Manager for BuyMartV1
 * Handles theme switching, persistence, and system preference detection
 */

class ThemeManager {
    constructor() {
        this.themes = {
            light: 'light',
            dark: 'dark',
            system: 'system'
        };
        
        this.currentTheme = this.getStoredTheme() || 'system';
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        this.init();
    }

    /**
     * Initialize theme manager
     */
    init() {
        console.log('🎨 Initializing Theme Manager...');
        
        // Apply initial theme
        this.applyTheme(this.currentTheme);
        
        // Listen for system theme changes
        this.mediaQuery.addEventListener('change', () => {
            if (this.currentTheme === 'system') {
                this.applySystemTheme();
            }
        });
        
        // Set up theme controls if they exist
        this.setupThemeControls();
        
        console.log(`✅ Theme Manager initialized with theme: ${this.currentTheme}`);
    }

    /**
     * Get stored theme from localStorage
     */
    getStoredTheme() {
        try {
            return localStorage.getItem('buymart-theme');
        } catch (error) {
            console.warn('Failed to get stored theme:', error);
            return null;
        }
    }

    /**
     * Store theme in localStorage
     */
    storeTheme(theme) {
        try {
            localStorage.setItem('buymart-theme', theme);
            console.log(`💾 Theme stored: ${theme}`);
        } catch (error) {
            console.warn('Failed to store theme:', error);
        }
    }

    /**
     * Apply theme to document
     */
    applyTheme(theme) {
        console.log(`🎨 Applying theme: ${theme}`);
        
        this.currentTheme = theme;
        
        // Remove existing theme classes
        document.documentElement.classList.remove('dark');
        
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else if (theme === 'system') {
            this.applySystemTheme();
        }
        
        // Store the preference
        this.storeTheme(theme);
        
        // Update theme controls
        this.updateThemeControls();
        
        // Dispatch theme change event
        this.dispatchThemeChangeEvent(theme);
    }

    /**
     * Apply system theme based on user's OS preference
     */
    applySystemTheme() {
        const isDark = this.mediaQuery.matches;
        console.log(`🖥️ Applying system theme: ${isDark ? 'dark' : 'light'}`);
        
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

    /**
     * Set up theme controls (radio buttons, etc.)
     */
    setupThemeControls() {
        const themeInputs = document.querySelectorAll('input[name="theme"]');
        
        themeInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                if (e.target.checked) {
                    const selectedTheme = e.target.value;
                    console.log(`🎯 Theme selected: ${selectedTheme}`);
                    this.applyTheme(selectedTheme);
                    
                    // Show immediate feedback
                    this.showThemeChangeNotification(selectedTheme);
                }
            });
        });
        
        // Set initial state
        this.updateThemeControls();
    }

    /**
     * Update theme control states
     */
    updateThemeControls() {
        const themeInputs = document.querySelectorAll('input[name="theme"]');
        
        themeInputs.forEach(input => {
            input.checked = input.value === this.currentTheme;
        });
    }

    /**
     * Show theme change notification
     */
    showThemeChangeNotification(theme) {
        const themeNames = {
            light: 'Light',
            dark: 'Dark',
            system: 'System'
        };
        
        const message = `Theme changed to ${themeNames[theme]}`;
        
        // Try to use existing toast function
        if (typeof showToast === 'function') {
            showToast(message, 'success');
        } else {
            // Create simple notification
            this.createSimpleNotification(message);
        }
    }

    /**
     * Create simple notification if toast function not available
     */
    createSimpleNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    /**
     * Dispatch theme change event for other components
     */
    dispatchThemeChangeEvent(theme) {
        const event = new CustomEvent('themeChanged', {
            detail: { theme, isDark: this.isDarkMode() }
        });
        window.dispatchEvent(event);
    }

    /**
     * Check if current theme is dark
     */
    isDarkMode() {
        if (this.currentTheme === 'dark') {
            return true;
        } else if (this.currentTheme === 'system') {
            return this.mediaQuery.matches;
        }
        return false;
    }

    /**
     * Get current theme
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Set theme programmatically
     */
    setTheme(theme) {
        if (this.themes[theme]) {
            this.applyTheme(theme);
        } else {
            console.warn(`Invalid theme: ${theme}`);
        }
    }

    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        const newTheme = this.isDarkMode() ? 'light' : 'dark';
        this.applyTheme(newTheme);
    }
}

// Initialize theme manager when DOM is loaded
let themeManager = null;

document.addEventListener('DOMContentLoaded', () => {
    themeManager = new ThemeManager();
    
    // Make theme manager globally available
    window.themeManager = themeManager;
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}
