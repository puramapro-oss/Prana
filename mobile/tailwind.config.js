/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: "#0A0A0F",
        surface: "#13131A",
        primary: "#F472B6",
        accent: "#7C3AED",
        muted: "#6B6B72",
        border: "rgba(255,255,255,0.08)",
        ivory: "#FBFAF7",
      },
      fontFamily: {
        sans: ["Inter"],
        heading: ["Fraunces"],
      },
    },
  },
  plugins: [],
}
