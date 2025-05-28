// Form component theme configuration
(function() {
  const baseTheme = window.ArdonieTheme?.base || {};
  
  const formTheme = {
    // Extend base theme
    ...baseTheme,
    
    // Form-specific overrides
    form: {
      input: {
        base: {
          borderRadius: baseTheme.borderRadius.md,
          padding: {
            x: '0.75rem',
            y: '0.5rem'
          },
          fontSize: '1rem',
          transition: 'all 150ms',
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
          border: {
            default: {
              light: baseTheme.colors.light.border,
              dark: baseTheme.colors.dark.border,
            },
            focus: {
              light: baseTheme.colors.primary.DEFAULT,
              dark: baseTheme.colors.primary.light,
            },
            error: {
              light: baseTheme.colors.error,
              dark: baseTheme.colors.error,
            },
          },
          placeholder: {
            light: baseTheme.colors.secondary.DEFAULT,
            dark: baseTheme.colors.dark.muted,
          },
        },
      },
      label: {
        colors: {
          text: {
            light: baseTheme.colors.light.text,
            dark: baseTheme.colors.dark.text,
          },
          error: {
            light: baseTheme.colors.error,
            dark: baseTheme.colors.error,
          },
        },
        fontSize: '0.875rem',
        fontWeight: 'medium',
        marginBottom: '0.25rem',
      },
      helpText: {
        colors: {
          text: {
            light: baseTheme.colors.secondary.DEFAULT,
            dark: baseTheme.colors.dark.muted,
          },
          error: {
            light: baseTheme.colors.error,
            dark: baseTheme.colors.error,
          },
        },
        fontSize: '0.75rem',
        marginTop: '0.25rem',
      },
      checkbox: {
        size: '1rem',
        colors: {
          checked: {
            background: {
              light: baseTheme.colors.primary.DEFAULT,
              dark: baseTheme.colors.primary.DEFAULT,
            },
            border: {
              light: baseTheme.colors.primary.DEFAULT,
              dark: baseTheme.colors.primary.DEFAULT,
            },
          },
          unchecked: {
            background: {
              light: baseTheme.colors.light.background,
              dark: baseTheme.colors.dark.background,
            },
            border: {
              light: baseTheme.colors.light.border,
              dark: baseTheme.colors.dark.border,
            },
          },
        },
      },
      select: {
        // Inherit most styles from input
        // Add select-specific styles here
      },
      spacing: {
        between: '1rem',
        groups: '1.5rem',
      },
    },
  };
  
  // Export the form theme
  window.ArdonieTheme = window.ArdonieTheme || {};
  window.ArdonieTheme.form = formTheme;
})();