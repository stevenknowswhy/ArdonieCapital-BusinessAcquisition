// Button component theme configuration
(function() {
  const baseTheme = window.ArdonieTheme?.base || {};
  
  const buttonTheme = {
    // Extend base theme
    ...baseTheme,
    
    // Button-specific overrides
    button: {
      base: {
        padding: {
          x: '1rem',
          y: '0.5rem'
        },
        borderRadius: baseTheme.borderRadius.md,
        fontWeight: 'medium',
        transition: 'all 150ms',
      },
      colors: {
        primary: {
          background: {
            default: {
              light: baseTheme.colors.primary.DEFAULT,
              dark: baseTheme.colors.primary.DEFAULT,
            },
            hover: {
              light: baseTheme.colors.primary.dark,
              dark: baseTheme.colors.primary.light,
            },
          },
          text: {
            light: '#ffffff',
            dark: '#ffffff',
          },
          border: {
            light: 'transparent',
            dark: 'transparent',
          },
        },
        secondary: {
          background: {
            default: {
              light: baseTheme.colors.secondary.light,
              dark: baseTheme.colors.dark.background,
            },
            hover: {
              light: '#f8fafc',
              dark: baseTheme.colors.dark.border,
            },
          },
          text: {
            light: baseTheme.colors.secondary.DEFAULT,
            dark: baseTheme.colors.dark.text,
          },
          border: {
            light: baseTheme.colors.light.border,
            dark: baseTheme.colors.dark.border,
          },
        },
        accent: {
          background: {
            default: {
              light: baseTheme.colors.accent.DEFAULT,
              dark: baseTheme.colors.accent.DEFAULT,
            },
            hover: {
              light: baseTheme.colors.accent.dark,
              dark: baseTheme.colors.accent.light,
            },
          },
          text: {
            light: '#ffffff',
            dark: '#ffffff',
          },
          border: {
            light: 'transparent',
            dark: 'transparent',
          },
        },
      },
      sizes: {
        sm: {
          padding: {
            x: '0.75rem',
            y: '0.375rem'
          },
          fontSize: '0.875rem',
        },
        md: {
          padding: {
            x: '1rem',
            y: '0.5rem'
          },
          fontSize: '1rem',
        },
        lg: {
          padding: {
            x: '1.5rem',
            y: '0.75rem'
          },
          fontSize: '1.125rem',
        },
      },
      variants: {
        outline: {
          primary: {
            background: {
              default: {
                light: 'transparent',
                dark: 'transparent',
              },
              hover: {
                light: baseTheme.colors.primary.light + '20', // 20% opacity
                dark: baseTheme.colors.primary.dark + '20',
              },
            },
            text: {
              light: baseTheme.colors.primary.DEFAULT,
              dark: baseTheme.colors.primary.light,
            },
            border: {
              light: baseTheme.colors.primary.DEFAULT,
              dark: baseTheme.colors.primary.light,
            },
          },
          // Add other outline variants as needed
        },
        text: {
          primary: {
            background: {
              default: {
                light: 'transparent',
                dark: 'transparent',
              },
              hover: {
                light: baseTheme.colors.primary.light + '20',
                dark: baseTheme.colors.primary.dark + '20',
              },
            },
            text: {
              light: baseTheme.colors.primary.DEFAULT,
              dark: baseTheme.colors.primary.light,
            },
            border: {
              light: 'transparent',
              dark: 'transparent',
            },
          },
          // Add other text variants as needed
        },
      },
    },
  };
  
  // Export the button theme
  window.ArdonieTheme = window.ArdonieTheme || {};
  window.ArdonieTheme.button = buttonTheme;
})();