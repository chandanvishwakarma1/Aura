/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./src/app/**/*.{js,jsx,ts,tsx}","./src/components/**/*.{js,jsx,ts,tsx}"],
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
        brand: '#4671ED'
      }
    },
  },
  plugins: [],
}