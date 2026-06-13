import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "#6C63FF",
        secondary: "#00BFA6",
        background: "#0F0F1A",
        surface: "#1A1A2E",
        "surface-light": "#252547",
        "text-primary": "#EAEAEA",
        "text-muted": "#A0A0B0",
        success: "#4CAF50",
        warning: "#FF9800",
        danger: "#EF5350",
        accent: "#FFD93D",
      },
      animation: {
        breathe: "breathe 8s ease-in-out infinite",
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "bounce-soft": "bounceSoft 0.4s ease-out",
        "pulse-gentle": "pulseGentle 2s ease-in-out infinite",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.8" },
          "25%": { transform: "scale(1.3)", opacity: "1" },
          "50%": { transform: "scale(1.3)", opacity: "1" },
          "75%": { transform: "scale(1)", opacity: "0.8" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        bounceSoft: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.15)" },
          "100%": { transform: "scale(1)" },
        },
        pulseGentle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
