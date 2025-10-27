/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef9ff",
          100: "#d9f1ff",
          200: "#b6e6ff",
          300: "#83d7ff",
          400: "#45c1ff",
          500: "#169cf0",   // 👈 the one used in your CSS
          600: "#0f7bd2",
          700: "#1061a6",
          800: "#124f84",
          900: "#143f69"
        }
      }
    },
  },
  plugins: [],
}
