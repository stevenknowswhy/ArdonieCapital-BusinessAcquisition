// Footer component theme configuration
(function() {
  const baseTheme = window.ArdonieTheme?.base || {};
  
  const footerTheme = {
    // Extend base theme
    ...baseTheme,
    
    // Footer-specific overrides
    footer: {
      colors: {
        background: {
          light: baseTheme.colors.secondary.light,
          dark: baseTheme.colors.dark.background,
        },
        text: {
          primary: {
            light: baseTheme.colors.light.text,
            dark: baseTheme.colors.dark.text,
          },
          secondary: {
            light: baseTheme.colors.secondary.DEFAULT,
            dark: baseTheme.colors.dark.muted,
          },
        },
        link: {
          default: {
            light: baseTheme.colors.secondary.DEFAULT,
            dark: baseTheme.colors.dark.muted,
          },
          hover: {
            light: baseTheme.colors.primary.DEFAULT,
            dark: baseTheme.colors.primary.light,
          },
        },
        border: {
          light: baseTheme.colors.light.border,
          dark: baseTheme.colors.dark.border,
        },
      },
      spacing: {
        padding: {
          top: '3rem',
          bottom: '2rem',
          x: '1rem',
        },
        sections: '2rem',
        items: '0.75rem',
      },
      typography: {
        heading: {
          fontSize: '1.125rem',
          fontWeight: '600',
          marginBottom: '1rem',
        },
        link: {
          fontSize: '0.875rem',
          fontWeight: '400',
          transition: 'color 150ms',
        },
        copyright: {
          fontSize: '0.75rem',
          fontWeight: '400',
          marginTop: '2rem',
        },
      },
      layout: {
        columns: {
          desktop: 4,
          tablet: 2,
          mobile: 1,
        },
        maxWidth: '1280px',
      },
      social: {
        iconSize: '1.5rem',
        spacing: '1rem',
        colors: {
          default: {
            light: baseTheme.colors.secondary.DEFAULT,
            dark: baseTheme.colors.dark.muted,
          },
          hover: {
            light: baseTheme.colors.primary.DEFAULT,
            dark: baseTheme.colors.primary.light,
          },
        },
      },
      newsletter: {
        input: {
          borderRadius: baseTheme.borderRadius.md,
          padding: {
            x: '0.75rem',
            y: '0.5rem',
          },
          colors: {
            background: {
              light: baseTheme.colors.light.background,
              dark: baseTheme.colors.dark.background,
            },
            border: {
              light: baseTheme.colors.light.border,
              dark: baseTheme.colors.dark.border,
            },
            text: {
              light: baseTheme.colors.light.text,
              dark: baseTheme.colors.dark.text,
            },
          },
        },
        button: {
          borderRadius: baseTheme.borderRadius.md,
          padding: {
            x: '1rem',
            y: '0.5rem',
          },
          colors: {
            background: {
              light: baseTheme.colors.primary.DEFAULT,
              dark: baseTheme.colors.primary.DEFAULT,
            },
            text: {
              light: '#ffffff',
              dark: '#ffffff',
            },
            hover: {
              light: baseTheme.colors.primary.dark,
              dark: baseTheme.colors.primary.light,
            },
          },
        },
      },
    },
  };
  
  // Export the footer theme
  window.ArdonieTheme = window.ArdonieTheme || {};
  window.ArdonieTheme.footer = footerTheme;
})();
