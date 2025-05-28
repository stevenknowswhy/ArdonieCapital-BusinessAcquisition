// Navigation theme configuration
(function() {
  const baseTheme = window.ArdonieTheme?.base || {};
  
  const navigationTheme = {
    // Extend base theme
    ...baseTheme,
    
    // Navigation-specific overrides
    navigation: {
      height: {
        desktop: '4rem',
        mobile: '3.5rem',
      },
      colors: {
        background: {
          light: baseTheme.colors.light.background,
          dark: baseTheme.colors.dark.background,
        },
        text: {
          light: baseTheme.colors.light.text,
          dark: baseTheme.colors.dark.text,
        },
        active: {
          light: baseTheme.colors.primary.DEFAULT,
          dark: baseTheme.colors.primary.light,
        },
        hover: {
          light: baseTheme.colors.primary.dark,
          dark: baseTheme.colors.primary.DEFAULT,
        },
      },
      dropdown: {
        background: {
          light: baseTheme.colors.light.background,
          dark: baseTheme.colors.dark.background,
        },
        border: {
          light: baseTheme.colors.light.border,
          dark: baseTheme.colors.dark.border,
        },
        shadow: baseTheme.boxShadow.lg,
      },
    },
  };
  
  // Export the navigation theme
  window.ArdonieTheme = window.ArdonieTheme || {};
  window.ArdonieTheme.navigation = navigationTheme;
})();