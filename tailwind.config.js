/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Minimal Hacker Dark Theme
        hacker: {
          bg: '#0a0a0a',
          surface: '#141414',
          elevated: '#1e1e1e',
          border: '#2a2a2a',
          muted: '#3a3a3a',
        },
        // Light Theme (Complementary)
        light: {
          bg: '#f8f9fa',
          surface: '#ffffff',
          elevated: '#f0f0f0',
          border: '#e0e0e0',
          muted: '#6b7280',
        },
        // Brand Colors
        accent: {
          DEFAULT: '#FF7A64',
          hover: '#ff8f7d',
          muted: 'rgba(255, 122, 100, 0.2)',
        },
        // Text Colors
        text: {
          primary: '#e4e4e7',
          secondary: '#a1a1aa',
          muted: '#71717a',
          light: {
            primary: '#18181b',
            secondary: '#3f3f46',
            muted: '#71717a',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['Satisfy', 'cursive'],
        condensed: ['Saira Extra Condensed', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(255, 122, 100, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(255, 122, 100, 0.8)' },
        },
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(to right, #1e1e1e 1px, transparent 1px), linear-gradient(to bottom, #1e1e1e 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}
