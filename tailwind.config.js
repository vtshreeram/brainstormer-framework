/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: {
          10:  '#edf5ff',
          20:  '#d0e2ff',
          30:  '#a6c8ff',
          40:  '#78a9ff',
          50:  '#4589ff',
          60:  '#0f62fe',
          70:  '#0043ce',
          80:  '#002d9c',
          90:  '#001d6c',
          100: '#001141',
          500: '#4589ff',
          600: '#0f62fe',
          700: '#0043ce',
          800: '#002d9c',
        },
        gray: {
          50:  '#f4f4f4',
          100: '#e0e0e0',
          200: '#e0e0e0',
          300: '#c6c6c6',
          400: '#a8a8a8',
          500: '#8d8d8d',
          600: '#6f6f6f',
          700: '#525252',
          800: '#393939',
          900: '#161616',
        },
      },
    },
  },
  plugins: [],
}
