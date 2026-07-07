/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#f6f6f7',
          100: '#eef0f2',
          200: '#d7dadf',
          300: '#b4b9c2',
          400: '#8c93a0',
          500: '#6d7584',
          600: '#565c6a',
          700: '#474b57',
          800: '#2d3039',
          900: '#1e2025',
          950: '#121317',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
