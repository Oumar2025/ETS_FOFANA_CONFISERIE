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
        fofana: {
          50: '#f4f7fa',
          100: '#e1e8f0',
          200: '#c7d5e4',
          300: '#a1b9d3',
          400: '#7397be',
          500: '#5279a6',
          600: '#3e5f8a',
          700: '#334c71',
          800: '#2d415f',
          900: '#1e293b',
          950: '#0f172a',
          gold: '#d97706',
          amber: '#f59e0b',
          emerald: '#10b981',
          crimson: '#ef4444'
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.3)',
        'gold-glow': '0 0 20px rgba(217, 119, 6, 0.3)',
      }
    },
  },
  plugins: [],
}
