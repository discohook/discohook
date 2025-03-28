import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Whitney", "Helvetica", "sans-serif"],
      code: [
        // "gg mono",
        "Source Code Pro",
        "Consolas",
        "Andale Mono WT",
        "Andale Mono",
        "Lucida Console",
        "Lucida Sans Typewriter",
        "DejaVu Sans Mono",
        "Bitstream Vera Sans Mono",
        "Liberation Mono",
        "Nimbus Mono L",
        "Monaco",
        "Courier New",
        "Courier",
        "monospace",
      ],
    },
    extend: {
      spacing: {
        inherit: "inherit",
      },
      colors: {
        brand: {
          blue: "#58B9FF",
          pink: "#FF81FF",
        },
        primary: {
          130: "#EFF0F3",
          160: "#EBEDEF",
          200: "#E3E5E8",
          230: "#DBDEE1",
          300: "#C4C9CE",
          400: "#80848E",
          500: "#4E5058",
          600: "#2E2E33",
          630: "#202225",
          700: "#17181A",
        },
        blurple: {
          50: "#eef3ff",
          100: "#e0e9ff",
          200: "#c6d6ff",
          260: "#C9CDFB",
          300: "#a4b9fd",
          400: "#8093f9",
          DEFAULT: "#5865f2",
          500: "#5865f2",
          600: "#4654c0",
          700: "#3a48a3",
          800: "#2f2fa4",
          900: "#2d2f82",
          950: "#1a1a4c",
        },
        blue: {
          345: "#86AFEF",
          430: "#3172DB",
        },
        gray: {
          100: "#F3F3F4",
          200: "#EAEAEC",
          300: "#e3e5e8",
          400: "#d4d7dc",
          500: "#606069",
          600: "#4f545c",
          700: "#36393f",
          800: "#2f3136",
          900: "#202225",
        },
        muted: "#5C5E65",
        "muted-dark": "#959BA3",
        background: {
          secondary: "#F3F3F4",
          "secondary-dark": "#37373D",
        },
        border: {
          normal: "#D9D9DC",
          "normal-dark": "#4A4A51"
        }
      },
    },
  },
  plugins: [],
  darkMode: "class",
} satisfies Config;
