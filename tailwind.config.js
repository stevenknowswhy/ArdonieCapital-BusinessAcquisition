/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./auth/*.html",
    "./blog/*.html",
    "./dashboard/*.html",
    "./documents/*.html",
    "./education/*.html",
    "./funding/*.html",
    "./marketplace/*.html",
    "./matchmaking/*.html",
    "./portals/*.html",
    "./tools/*.html",
    "./vendor-portal/*.html",
    "./components/*.js",
    "./components/*.html",
    "./assets/js/**/*.js",
    "./src/**/*.js"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#3B82F6',
          DEFAULT: '#2563EB',
          dark: '#1D4ED8'
        },
        secondary: {
          light: '#F8FAFC',
          DEFAULT: '#E2E8F0',
          dark: '#64748B'
        },
        accent: {
          light: '#10B981',
          DEFAULT: '#059669',
          dark: '#047857'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
