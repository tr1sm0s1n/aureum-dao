/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        cursive: ['Pacifico', 'Sriracha', 'cursive'],
        cursive2: ['Sriracha', 'cursive'],
      },
      colors: {
        primary: '#7275ff',
        secondary: '#a1a3ff',
        brandDark: '#6366FF',
        dark: '#272866',
        light: '#f5f5f5',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '3rem',
        },
      },
      animation: {
        'spin-slow': 'spin 40s linear infinite',
      },
    },
  },
  plugins: [],
}
