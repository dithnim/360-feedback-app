// @type {import('tailwindcss').Config}
export default {
  content: ["./index.html", "./src/**/.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        red: {
          dark: "#a10000",
          light: "#ed3f41",
        },
        success: "#008a24",
        gray: {
          dark: "#3c3d3d",
          light: "#2b2c2c",
        },
        white: "#fafffe",
        black: "#000000",
      },
    },
  },
  plugins: [],
};
