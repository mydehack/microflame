import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          DEFAULT: "#070F21",
          900: "#040914",
          800: "#070F21",
          700: "#0A1633",
        },
        deep: {
          DEFAULT: "#0D2554",
          panel: "#0D2554",
          card: "rgba(13, 37, 84, 0.75)",
        },
        surface: {
          DEFAULT: "#164E9E",
          secondary: "#164E9E",
          hover: "#1A5CB8",
        },
        electric: {
          DEFAULT: "#1B64DD",
          glow: "rgba(27, 100, 221, 0.4)",
        },
        cyan: {
          DEFAULT: "#2694EE",
          glow: "#2694EE",
          soft: "rgba(38, 148, 238, 0.2)",
        },
        flame: {
          orange: "#E8671C",
          amber: "#F79628",
          blue: "#2694EE",
          core: "#FFE57F",
        },
        txt: {
          primary: "#D9E0EE",
          secondary: "#A7B1D2",
          muted: "#6B7B9E",
        },
        accent: {
          purple: "#8B35E8",
          green: "#16A34A",
          yellow: "#FACC15",
        },
      },
      boxShadow: {
        "cyan-glow": "0 0 15px rgba(38, 148, 238, 0.35)",
        "cyan-glow-strong": "0 0 25px rgba(38, 148, 238, 0.6)",
        "blue-glow": "0 0 20px rgba(27, 100, 221, 0.4)",
        "flame-glow": "0 0 25px rgba(232, 103, 28, 0.5)",
        "panel-glow": "0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(38, 148, 238, 0.15)",
      },
      fontFamily: {
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
        sans: ["var(--font-sans)", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
