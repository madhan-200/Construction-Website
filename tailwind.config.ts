import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        industrial: {
          950: "#080c14",
          900: "#0f1624",
          850: "#141e30",
          800: "#1c283f",
          700: "#2d3d5c",
          600: "#485b82",
          500: "#697fa8",
          400: "#93a5cc",
          300: "#c2cfee",
          200: "#e1e7f6",
          100: "#f0f4fc",
          50: "#f8fafd",
        },
        safety: {
          orange: "#f97316",
          "orange-hover": "#ea580c",
          "orange-dark": "#c2410c",
          yellow: "#eab308",
          green: "#10b981",
          red: "#ef4444",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "var(--font-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
