/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        rio: "#C8202A",
        offwhite: "#F7F6F2",
        gold: "#F5A623",
        silver: "#A8A8A8",
        bronze: "#CD7F32",
        muted: "#6B6B6B",
      },
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
