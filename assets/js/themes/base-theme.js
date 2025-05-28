// Base theme configuration for Ardonie Capital
const baseTheme = {
  // Core color palette
  colors: {
    primary: {
      DEFAULT: '#3b82f6', // blue-500
      dark: '#2563eb',    // blue-600
      light: '#93c5fd',   // blue-300
    },
    secondary: {
      DEFAULT: '#64748b', // slate-500
      light: '#f1f5f9',   // slate-100
      dark: '#334155',    // slate-700
    },
    accent: {
      DEFAULT: '#10b981', // emerald-500
      dark: '#059669',    // emerald-600
      light: '#6ee7b7',   // emerald-300
    },
    // Light mode specific colors
    light: {
      background: '#ffffff',
      text: '#1e293b',
      border: '#e2e8f0',
      muted: '#94a3b8',
    },
    // Dark mode specific colors
    dark: {
      background: '#0f172a',
      text: '#f1f5f9',
      border: '#334155',
      muted: '#64748b',
    },
    // Semantic colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },

  // Typography
  fontFamily: {
    sans: ['Inter', 'sans-serif'],
    serif: ['Merriweather', 'serif'],
    mono: ['Menlo', 'Monaco', 'Consolas', 'monospace'],
  },

  // Spacing scale
  spacing: {
    // Standard spacing scale
  },

  // Breakpoints
  screens: {
    'sm': '640px',
    'md': '768px',
    'lg': '1024px',
    'xl': '1280px',
    '2xl': '1536px',
  },

  // Border radius
  borderRadius: {
    'none': '0',
    'sm': '0.125rem',
    'DEFAULT': '0.25rem',
    'md': '0.375rem',
    'lg': '0.5rem',
    'xl': '0.75rem',
    '2xl': '1rem',
    'full': '9999px',
  },

  // Shadows
  boxShadow: {
    'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    'none': 'none',
  },

  // Transitions
  transitionProperty: {
    'DEFAULT': 'background-color, border-color, color, fill, stroke, opacity, box-shadow, transform',
    'colors': 'background-color, border-color, color, fill, stroke',
    'opacity': 'opacity',
    'shadow': 'box-shadow',
    'transform': 'transform',
  },
  transitionTimingFunction: {
    'DEFAULT': 'cubic-bezier(0.4, 0, 0.2, 1)',
    'linear': 'linear',
    'in': 'cubic-bezier(0.4, 0, 1, 1)',
    'out': 'cubic-bezier(0, 0, 0.2, 1)',
    'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  transitionDuration: {
    'DEFAULT': '150ms',
    '75': '75ms',
    '100': '100ms',
    '150': '150ms',
    '200': '200ms',
    '300': '300ms',
    '500': '500ms',
    '700': '700ms',
    '1000': '1000ms',
  },
};

// Export the base theme
if (typeof module !== 'undefined') {
  module.exports = baseTheme;
} else {
  window.ArdonieTheme = window.ArdonieTheme || {};
  window.ArdonieTheme.base = baseTheme;
}