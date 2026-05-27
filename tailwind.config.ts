import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        sm: "480px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        honey: {
          50: "var(--color-honey-50)",
          100: "var(--color-honey-100)",
          200: "var(--color-honey-200)",
          300: "var(--color-honey-300)",
          400: "var(--color-honey-400)",
          500: "var(--color-honey-500)",
          600: "var(--color-honey-600)",
          700: "var(--color-honey-700)",
          900: "var(--color-honey-900)",
        },
        ash: {
          50: "var(--color-ash-50)",
          100: "var(--color-ash-100)",
          200: "var(--color-ash-200)",
          300: "var(--color-ash-300)",
          400: "var(--color-ash-400)",
          500: "var(--color-ash-500)",
          600: "var(--color-ash-600)",
          700: "var(--color-ash-700)",
          800: "var(--color-ash-800)",
          900: "var(--color-ash-900)",
        },
        graphite: {
          DEFAULT: "var(--color-graphite)",
          soft: "var(--color-graphite-soft)",
        },
      },
      borderRadius: {
        "4xl": "28px",
        "5xl": "36px",
      },
      boxShadow: {
        float: "var(--shadow-float)",
        honey: "var(--shadow-honey)",
      },
      transitionTimingFunction: {
        "out-soft": "var(--ease-out-soft)",
        spring: "var(--ease-spring)",
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        base: "var(--duration-base)",
        slow: "var(--duration-slow)",
      },
    },
  },
  plugins: [],
};
export default config;
