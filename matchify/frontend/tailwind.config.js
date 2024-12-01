// tailwind.config.js
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        spotify: {
          "primary": "#1DB954",    // Spotify Green
          "secondary": "#191414",  // Spotify Black
          "accent": "#1DB954",
          "neutral": "#191414",
          "base-100": "#121212",   // Dark Gray
          "base-200": "#1E1E1E",   // Slightly lighter than base-100
          "base-content": "#FFFFFF", // Light text color
          "info": "#2094f3",
          "success": "#1DB954",
          "warning": "#ff9900",
          "error": "#ff5724",
        },
      },
    ],
  },
};
