/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        subgroup: {
          default: '#f8f9fa',  // светло-серый
          buy: '#fff3cd',      // светло-жёлтый
          think: '#ffeaa7',    // светло-оранжевый
          taken: '#d4edda'     // светло-зелёный
        }
      }
    },
  },
  plugins: [],
}