import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Whitney", "Helvetica", "sans-serif"],
    },
    extend: {
      colors: {
        brand: {
          blue: "#58B9FF",
          pink: "#FF81FF",
        },
        primary: {
          130: "#EFF0F3",
          200: "#E3E5E8",
          230: "#DBDEE1",
          600: "#313338",
          630: "#202225",
          700: "#17181A",
        },
        blurple: {
          50: "#eef3ff",
          100: "#e0e9ff",
          200: "#c6d6ff",
          300: "#a4b9fd",
          400: "#8093f9",
          DEFAULT: "#5865f2",
          500: "#5865f2",
          600: "#4752c4",
          700: "#3c45a5",
          800: "#2f2fa4",
          900: "#2d2f82",
          950: "#1a1a4c",
        },
        gray: {
          100: "#f2f3f5",
          200: "#ebedef",
          300: "#e3e5e8",
          400: "#d4d7dc",
          600: "#4f545c",
          700: "#36393f",
          800: "#2f3136",
          900: "#202225",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
