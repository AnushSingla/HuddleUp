/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,css}", // ✅ Add .css
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
