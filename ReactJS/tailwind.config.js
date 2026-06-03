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
          DEFAULT: '#00f2ff', // Neon Blue
          dark: '#00c2cc',
        },
        secondary: '#ff00ea', // Neon Pink
        dark: {
          DEFAULT: '#0a0a0b',
          lighter: '#16161a',
          card: '#1c1c21',
        }
      },
      backgroundImage: {
        'glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
