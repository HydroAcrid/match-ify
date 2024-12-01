module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
    },
  },
  daisyui: {
    themes: [
      {
        spotify: {
          "primary": "#1DB954",
          "secondary": "#191414",
          "accent": "#1DB954",
          "neutral": "#191414",
          "base-100": "#121212",
          "info": "#2094f3",
          "success": "#009485",
          "warning": "#ff9900",
          "error": "#ff5724",
        },
      },
    ],
  },
  plugins: [require('daisyui')],
}
