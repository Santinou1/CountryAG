/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary': '#2A2F73',
        'secondary': '#434C94',
        'accent': '#A3B9C9',
        'light': '#ABDAE1',
        'dark-gray': '#616161',
      }
    },
  },
  plugins: [],
};
