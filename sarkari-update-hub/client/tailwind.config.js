/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#2563eb',
          DEFAULT: '#0f4c81', // Premium, secure government royal blue
          dark: '#0a3052',
        },
        accent: {
          DEFAULT: '#16a34a', // Clear notification success green
          dark: '#15803d',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'system-ui'],
      }
    },
  },
  plugins: [],
}
