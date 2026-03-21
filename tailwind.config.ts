import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        blob: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        gradient: "gradient 3s ease infinite",
        blob: "blob 7s infinite",
        "fade-in": "fade-in 0.5s ease-out",
      },
      colors: {
        primary: {
          50: "#e8f5f1",
          100: "#c7e9e1",
          200: "#a5ddd0",
          300: "#6ecfc0",
          400: "#48c5b0",
          500: "#1FA774",
          600: "#1a926a",
          700: "#157d52",
          800: "#106843",
          900: "#0a5a3a",
        },
        secondary: {
          50: "#fffbf0",
          100: "#fff5d6",
          200: "#ffeeb8",
          300: "#fee8a0",
          400: "#fde28d",
          500: "#F5B400",
          600: "#d99c00",
          700: "#b88400",
          800: "#946900",
          900: "#7a5500",
        },
        dark: {
          50: "#f6f7f9",
          100: "#eceef2",
          200: "#d4dae6",
          300: "#b1b9cf",
          400: "#8a97b8",
          500: "#0B3C5D",
          600: "#0a3553",
          700: "#092e4b",
          800: "#082643",
          900: "#051e3b",
        },
        text: {
          50: "#f7f8f9",
          100: "#f0f1f3",
          200: "#e1e3e7",
          300: "#c2c5cc",
          400: "#a3a8b3",
          500: "#1F2933",
          600: "#1a232d",
          700: "#151c27",
          800: "#101620",
          900: "#0b0e1a",
        },
        danger: {
          50: "#fef5f5",
          100: "#fce8e8",
          200: "#f9d0d0",
          300: "#f4aaaa",
          400: "#ed8585",
          500: "#D64545",
          600: "#be3d3d",
          700: "#a63535",
          800: "#8e2d2d",
          900: "#762525",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
        sora: ["var(--font-sora)"],
        clash: ["var(--font-clash)"],
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px -1px rgba(11, 60, 93, 0.1), 0 2px 4px -1px rgba(11, 60, 93, 0.06)",
        lg: "0 10px 15px -3px rgba(11, 60, 93, 0.1), 0 4px 6px -2px rgba(11, 60, 93, 0.05)",
        xl: "0 20px 25px -5px rgba(11, 60, 93, 0.1), 0 10px 10px -5px rgba(11, 60, 93, 0.04)",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #1FA774 0%, #48c5b0 100%)",
        "gradient-dark": "linear-gradient(135deg, #0B3C5D 0%, #1A5F7F 100%)",
        "gradient-warm": "linear-gradient(135deg, #F5B400 0%, #FFC93E 100%)",
        "gradient-gold": "linear-gradient(135deg, #F5B041 0%, #FCD34D 50%, #F59E0B 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
