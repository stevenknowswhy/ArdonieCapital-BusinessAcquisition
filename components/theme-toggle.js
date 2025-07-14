/**
 * Theme Toggle Component for Navigation
 * Provides a quick theme toggle button for the navigation bar
 */

window.ThemeToggle = {
    template: `
    <button id="theme-toggle" 
            class="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
            title="Toggle theme"
            aria-label="Toggle between light and dark themes">
        <!-- Sun icon (shown in dark mode) -->
        <svg id="theme-toggle-sun" class="w-5 h-5 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z">
            </path>
        </svg>
        <!-- Moon icon (shown in light mode) -->
        <svg id="theme-toggle-moon" class="w-5 h-5 block dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z">
            </path>
        </svg>
    </button>
    `,

    init() {
        // Wait for theme manager to be available
        const checkThemeManager = () => {
            if (window.themeManager) {
                this.setupToggle();
            } else {
                setTimeout(checkThemeManager, 100);
            }
        };
        checkThemeManager();
    },

    setupToggle() {
        const toggleButton = document.getElementById('theme-toggle');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => {
                if (window.themeManager) {
                    window.themeManager.toggleTheme();
                }
            });

            // Listen for theme changes to update icons
            window.addEventListener('themeChanged', (event) => {
                this.updateIcons(event.detail.isDark);
            });

            // Set initial icon state
            this.updateIcons(window.themeManager.isDarkMode());
        }
    },

    updateIcons(isDark) {
        const sunIcon = document.getElementById('theme-toggle-sun');
        const moonIcon = document.getElementById('theme-toggle-moon');
        
        if (sunIcon && moonIcon) {
            if (isDark) {
                sunIcon.classList.remove('hidden');
                sunIcon.classList.add('block');
                moonIcon.classList.remove('block');
                moonIcon.classList.add('hidden');
            } else {
                sunIcon.classList.remove('block');
                sunIcon.classList.add('hidden');
                moonIcon.classList.remove('hidden');
                moonIcon.classList.add('block');
            }
        }
    },

    render(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = this.template;
            this.init();
        }
    }
};

// Auto-initialize if container exists
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('theme-toggle-container');
    if (container) {
        window.ThemeToggle.render('theme-toggle-container');
    }
});
