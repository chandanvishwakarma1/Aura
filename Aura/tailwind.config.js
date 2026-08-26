/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}"
  ],
  darkMode: "class",
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        'aura-bold': ["Aura-Bold", "sans-serif"],
        'aura-bold-italic': ["Aura-Bold-Italic", "sans-serif"],
        'aura-extralight': ["Aura-ExtraLight", "sans-serif"],
        'aura-extralight-italic': ["Aura-ExtraLight-Italic", "sans-serif"],
        'aura-light': ["Aura-Light", "sans-serif"],
        'aura-light-italic': ["Aura-Light-Italic", "sans-serif"],
        'aura-regular': ["Aura-Regular", "sans-serif"],
        'aura-regular-italic': ["Aura-Regular-Italic", "sans-serif"],
        'aura-medium': ["Aura-Medium", "sans-serif"],
        'aura-medium-italic': ["Aura-Medium-Italic", "sans-serif"],
      },
      colors: {
        aura: {
          // Canvas & Surfaces
          bg: {
            DEFAULT: '#FFFFFF',
            dark: '#0A0B0D',
            alt: '#F7F8F9',
            'alt-dark': '#1E2025',
          },
          surface: {
            DEFAULT: '#EEF0F3',
            dark: '#16181C',
            elevated: '#FFFFFF',
            'elevated-dark': '#32353D'
          },
          // Text & Ink
          text: {
            primary: '#0A0B0D',
            'primary-dark': '#FFFFFF',
            secondary: '#5B616E',
            'secondary-dark': '#89909E',
            muted: '#717886',
            inverse: '#FFFFFF'
          },
          // Action & Brand
          primary: '#0052FF',
          'primary-hover': '#004BEB',
          // Financial & Status
          positive: '#05B169',
          negative: '#CF202F',
          warning: '#F4B000',
          // Borders
          border: {
            DEFAULT: '#DEE1E6',
            dark: '#32353D',
            soft: '#EEF0F3'
          }
        }
      }
    },
  },
  plugins: [],
}