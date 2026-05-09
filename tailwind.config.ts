import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "Georgia", "serif"],
      },
      colors: {
        void: "var(--bg-void)",
        deep: "var(--bg-deep)",
        card: "var(--bg-card)",
        gold: "var(--gold-mid)",
      },
    },
  },
  plugins: [],
};
export default config;
