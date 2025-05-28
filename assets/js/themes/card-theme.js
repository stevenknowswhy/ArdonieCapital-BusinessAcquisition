// Card component theme configuration
(function() {
  const baseTheme = window.ArdonieTheme?.base || {};
  
  const cardTheme = {
    // Extend base theme
    ...baseTheme,
    
    // Card-specific overrides
    card: {
      colors: {
        background: {
          light: baseTheme.colors.light.background,
          dark: baseTheme.colors.dark.background,
        },
        border: {
          light: baseTheme.colors.light.border,
          dark: baseTheme.colors.dark.border,
        },
        heading: {
          light: baseTheme.colors.light.text,
          dark: baseTheme.colors.dark.text,
        },
        text: {
          light: baseTheme.colors.secondary.DEFAULT,
          dark: baseTheme.colors.dark.muted,
        },
      },
      borderRadius: baseTheme.borderRadius.lg,
      shadow: {
        default: baseTheme.boxShadow.DEFAULT,
        hover: baseTheme.boxShadow.lg,
      },
      spacing: {
        padding: '1.5rem',
        gap: '1rem',
      },
      variants: {
        primary: {
          background: {
            light: baseTheme.colors.primary.light,
            dark: baseTheme.colors.primary.dark,
          },
          border: {
            light: baseTheme.colors.primary.DEFAULT,
            dark: baseTheme.colors.primary.DEFAULT,
          },
        },
        accent: {
          background: {
            light: baseTheme.colors.accent.light,
            dark: baseTheme.colors.accent.dark,
          },
          border: {
            light: baseTheme.colors.accent.DEFAULT,
            dark: baseTheme.colors.accent.DEFAULT,
          },
        },
      },
    },
  };
  
  // Export the card theme
  window.ArdonieTheme = window.ArdonieTheme || {};
  window.ArdonieTheme.card = cardTheme;
})();