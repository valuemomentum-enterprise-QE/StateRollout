export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'usaa-navy': { DEFAULT: '#002b5c', 700: '#001f44' },
        'usaa-blue': '#1f4e79',
        'usaa-gold': '#c8a500',
        'usaa-light': '#f6f8fb'
      }
    },
  },
  plugins: [],
};
