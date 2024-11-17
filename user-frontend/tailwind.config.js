/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
    screens: {
      xs: "500px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "1xl": "413px",
      "2xl": "1500px",
      "3xl": "1800px",
    },
  },
  plugins: [require("tailwind-scrollbar-hide")],
};
