/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.{html,js}",
    "./views/**/*.ejs",
    "./src/**/*.{html,js}"
  ],
  theme: {
    extend: {
      fontFamily: {
        'segoe': ['"Segoe UI"', 'Roboto', 'Arial', 'sans-serif'],
        'cambria': ['Cambria', 'serif'],
        'calibri': ['Calibri', 'sans-serif'],
        // Classe ajustada para 'inter'
        'inter': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}