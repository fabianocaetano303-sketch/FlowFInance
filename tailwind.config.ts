import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#0F172A",
        "surface-dim": "#0B1220",
        "surface-bright": "#334155",
        "surface-container-lowest": "#1E293B",
        "surface-container-low": "#243244",
        "surface-container": "#2A3B52",
        "surface-container-high": "#334155",
        "surface-container-highest": "#475569",
        "on-surface": "#F1F5F9",
        "on-surface-variant": "#94A3B8",
        outline: "#475569",
        "outline-variant": "#1E3A46",
        primary: "#10B981",
        "on-primary": "#052E1F",
        "primary-container": "#052E22",
        "on-primary-container": "#6EE7B7",
        secondary: "#10B981",
        "on-secondary": "#052E1F",
        "secondary-container": "#052E22",
        "on-secondary-container": "#6EE7B7",
        tertiary: "#EF4444",
        "on-tertiary": "#FFFFFF",
        "tertiary-container": "#450A0A",
        "on-tertiary-container": "#FCA5A5",
        error: "#EF4444",
        "on-error": "#FFFFFF",
        "error-container": "#450A0A",
        "on-error-container": "#FCA5A5",
        warning: "#F97316",
        "on-warning": "#431407",
        "warning-container": "#431407",
        "on-warning-container": "#FDBA74",
        accent: "#06B6D4",
        "on-accent": "#042A2E",
        "accent-container": "#083344",
        "on-accent-container": "#67E8F9",
        background: "#0F172A",
        "on-background": "#F1F5F9",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontFeatureSettings: {
        tnum: '"tnum"',
      },
      borderRadius: {
        sm: "0.125rem",
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
      },
      boxShadow: {
        elevated: "0px 10px 15px -3px rgba(0, 0, 0, 0.05)",
        soft: "0px 4px 16px rgba(0, 0, 0, 0.25)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "grow-in": {
          "0%": { opacity: "0", transform: "scale(0.85)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "badge-pop": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)" },
        },
        shine: {
          "0%": { backgroundPosition: "-150% 0" },
          "100%": { backgroundPosition: "250% 0" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "grow-in": "grow-in 0.4s ease-out",
        "badge-pop": "badge-pop 0.5s ease-out",
        shine: "shine 2.5s ease-in-out infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
      },
      spacing: {
        base: "8px",
      },
      maxWidth: {
        container: "1280px",
      },
    },
  },
  plugins: [],
};

export default config;
