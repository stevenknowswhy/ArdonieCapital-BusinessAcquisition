// Theme loader - manages theme loading and application
(function() {
  const ThemeLoader = {
    // Theme registry
    themes: {},

    // Initialize the theme system
    init: function() {
      // Register event listeners
      this.setupEventListeners();

      // Load user preferences
      this.loadUserPreferences();

      // Apply initial theme
      this.applyTheme();

      console.log('Theme system initialized');
    },

    // Register a theme component
    registerTheme: function(name, theme) {
      this.themes[name] = theme;
      return this;
    },

    // Get a specific theme or component
    getTheme: function(name) {
      return this.themes[name] || null;
    },

    // Apply theme to Tailwind config
    applyTheme: function() {
      // Merge all themes into a single configuration
      const mergedTheme = this.mergeThemes();

      // Apply to Tailwind
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

        console.log('Theme applied to Tailwind config');
      }
    },

    // Merge all registered themes
    mergeThemes: function() {
      const merged = {};

      // Start with base theme
      const baseTheme = this.getTheme('base') || {};
      Object.assign(merged, baseTheme);

      // Merge component-specific themes
      Object.keys(this.themes).forEach(key => {
        if (key !== 'base') {
          const theme = this.themes[key];
          // Only merge top-level properties to avoid conflicts
          Object.keys(theme).forEach(prop => {
            if (typeof theme[prop] === 'object' && !Array.isArray(theme[prop])) {
              merged[prop] = {...(merged[prop] || {}), ...theme[prop]};
            } else {
              merged[prop] = theme[prop];
            }
          });
        }
      });

      return merged;
    },

    // Set dark/light mode
    setColorMode: function(mode) {
      const html = document.documentElement;

      if (mode === 'dark') {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }

      // Save preference
      localStorage.setItem('theme', mode);

      // Dispatch event
      window.dispatchEvent(new CustomEvent('themeChanged', { detail: { mode } }));
    },

    // Toggle between dark and light mode
    toggleColorMode: function() {
      const html = document.documentElement;
      const isDark = html.classList.contains('dark');
      this.setColorMode(isDark ? 'light' : 'dark');
    },

    // Load user preferences from localStorage or system preferences
    loadUserPreferences: function() {
      const savedTheme = localStorage.getItem('theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

      if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        this.setColorMode('dark');
      } else {
        this.setColorMode('light');
      }
    },

    // Set up event listeners
    setupEventListeners: function() {
      // Listen for system preference changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
          this.setColorMode(e.matches ? 'dark' : 'light');
        }
      });

      // Listen for theme toggle clicks
      document.addEventListener('click', e => {
        if (e.target.id === 'dark-mode-toggle' || e.target.closest('#dark-mode-toggle')) {
          this.toggleColorMode();
        }
      });
    }
  };

  // Export the ThemeLoader
  window.ArdonieTheme = window.ArdonieTheme || {};
  window.ArdonieTheme.loader = ThemeLoader;

  // Auto-initialize when all themes are loaded
  document.addEventListener('DOMContentLoaded', () => {
    // Register all available themes
    if (window.ArdonieTheme.base) ThemeLoader.registerTheme('base', window.ArdonieTheme.base);
    if (window.ArdonieTheme.navigation) ThemeLoader.registerTheme('navigation', window.ArdonieTheme.navigation);
    if (window.ArdonieTheme.footer) ThemeLoader.registerTheme('footer', window.ArdonieTheme.footer);
    if (window.ArdonieTheme.card) ThemeLoader.registerTheme('card', window.ArdonieTheme.card);
    if (window.ArdonieTheme.button) ThemeLoader.registerTheme('button', window.ArdonieTheme.button);
    if (window.ArdonieTheme.form) ThemeLoader.registerTheme('form', window.ArdonieTheme.form);

    // Initialize the theme system
    ThemeLoader.init();
  });
})();