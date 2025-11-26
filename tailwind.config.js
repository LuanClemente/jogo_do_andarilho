/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'rpg-bg': '#0f1724',
        'rpg-panel': '#111827',
        'rpg-border': '#3b3b3b',
        'rpg-gold': '#e8d9a8',
        'rpg-text': '#e5e5e5',
        'rpg-accent': '#b8a26c',
      },
      fontFamily: {
        'medieval': ['"Uncial Antiqua"', 'serif'],
        'mono': ['monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(5px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}