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
          "'Inter'",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: [
          "'Chakra Petch'",
          "'Inter'",
          "sans-serif",
        ],
        mono: [
          "'JetBrains Mono'",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 10px rgba(249, 115, 22, 0.6))' },
          '50%': { opacity: '0.6', filter: 'drop-shadow(0 0 2px rgba(249, 115, 22, 0.2))' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        drumSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        cableWinch: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(18px)' },
        },
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        'marquee-fast': 'marquee 18s linear infinite',
        'marquee-reverse': 'marquee-reverse 30s linear infinite',
        float: 'float 4s ease-in-out infinite',
        'float-delayed': 'float 4s ease-in-out 2s infinite',
        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
        scan: 'scan 8s linear infinite',
        shimmer: 'shimmer 3s ease-in-out infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
        'drum-spin': 'drumSpin 6s linear infinite',
        'cable-winch': 'cableWinch 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;
