/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        glass: {
          white: 'rgba(255, 255, 255, 0.25)',
          black: 'rgba(0, 0, 0, 0.25)',
          blue: 'rgba(59, 130, 246, 0.25)',
          purple: 'rgba(147, 51, 234, 0.25)',
          pink: 'rgba(236, 72, 153, 0.25)',
          green: 'rgba(34, 197, 94, 0.25)',
          yellow: 'rgba(234, 179, 8, 0.25)',
          red: 'rgba(239, 68, 68, 0.25)',
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 3s infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        }
      },
      fontFamily: {
        'sf-pro': ['SF Pro Display', 'system-ui', 'sans-serif'],
        'sf-mono': ['SF Mono', 'Monaco', 'monospace'],
      },
      boxShadow: {
        'glass': '0 2px 12px rgba(0, 0, 0, 0.06)',
        'glass-inset': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        'neumorphism': '20px 20px 60px #bebebe, -20px -20px 60px #ffffff',
        'neumorphism-inset': 'inset 20px 20px 60px #bebebe, inset -20px -20px 60px #ffffff',
      },
      borderRadius: {
        'glass': '16px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    function({ addUtilities }) {
      const newUtilities = {
        '.glass': {
          background: 'rgba(255, 255, 255, 0.25)',
          'box-shadow': '0 2px 12px rgba(0, 0, 0, 0.06)',
          'backdrop-filter': 'blur(4px)',
          '-webkit-backdrop-filter': 'blur(4px)',
          'border-radius': '10px',
          border: '1px solid rgba(255, 255, 255, 0.18)',
        },
        '.glass-dark': {
          background: 'rgba(0, 0, 0, 0.25)',
          'box-shadow': '0 2px 12px rgba(0, 122, 255, 0.25)',
          'backdrop-filter': 'blur(4px)',
          '-webkit-backdrop-filter': 'blur(4px)',
          'border-radius': '10px',
          border: '1px solid rgba(255, 255, 255, 0.18)',
        },
        '.glass-card': {
          background: 'rgba(255, 255, 255, 0.1)',
          'box-shadow': '0 2px 12px rgba(0, 0, 0, 0.06)',
          'backdrop-filter': 'blur(8px)',
          '-webkit-backdrop-filter': 'blur(8px)',
          'border-radius': '16px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.text-shadow': {
          'text-shadow': '0 2px 4px rgba(0,0,0,0.1)',
        },
        '.text-shadow-lg': {
          'text-shadow': '0 4px 8px rgba(0,0,0,0.2)',
        }
      }
      addUtilities(newUtilities)
    }
  ],
}

