// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"], // adjust paths to your project structure
  theme: {
    extend: {},
  },
  plugins: [require("tailwind-scrollbar")],
};
