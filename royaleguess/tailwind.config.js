/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'clash-dark': '#141414',
        'clash-blue': '#1a4f7c',
        'clash-gold': '#fccf3e',
        'rarity-common': '#8e8e8e',
        'rarity-rare': '#f29c1f',
        'rarity-epic': '#b634bb',
        'rarity-legendary': '#34d0f4',
        'rarity-champion': '#f5c445',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
