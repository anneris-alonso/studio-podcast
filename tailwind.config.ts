import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        fg: "rgb(var(--fg) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        ring: "rgb(var(--ring) / <alpha-value>)",
        accent: {
          pink: "rgb(var(--accent-pink) / <alpha-value>)",
          violet: "rgb(var(--accent-violet) / <alpha-value>)",
          blue: "rgb(var(--accent-blue) / <alpha-value>)",
        },
      },
      borderRadius: {
        "r-lg": "var(--r-lg)",
        "r-xl": "var(--r-xl)",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        glow: "var(--shadow-glow)",
      },
      backdropBlur: {
        glass: "var(--glass-blur)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(90deg, rgb(var(--accent-pink)), rgb(var(--accent-violet)), rgb(var(--accent-blue)))",
        "radial-glow": "radial-gradient(600px circle at var(--x, 50%) var(--y, 30%), rgba(122, 92, 255, 0.22), transparent 60%)",
      },
    },
  },
  plugins: [],
};
export default config;
