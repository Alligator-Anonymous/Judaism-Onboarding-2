/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/renderer/**/*.{ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        pomegranate: {
          DEFAULT: "#d94841"
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        hebrew: ["'Frank Ruhl Libre'", "'David Libre'", "serif"],
        dyslexia: ["'OpenDyslexic'", "Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
