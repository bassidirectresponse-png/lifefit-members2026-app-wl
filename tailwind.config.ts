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
        bg: {
          primary: "#0A0A0B",
          secondary: "#141416",
          tertiary: "#1C1C1F",
        },
        pink: {
          primary: "#EC4899",
          vibrant: "#F472B6",
          dark: "#9D174D",
          rose: "#FCE7F3",
          success: "#F9A8D4",
          glow: "rgba(236, 72, 153, 0.4)",
          "glow-soft": "rgba(236, 72, 153, 0.15)",
          "border": "rgba(236, 72, 153, 0.2)",
        },
        text: {
          primary: "#F5F5F4",
          secondary: "#A1A1AA",
          tertiary: "#71717A",
        },
        border: {
          DEFAULT: "#27272A",
          pink: "rgba(236, 72, 153, 0.2)",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "body": ["17px", { lineHeight: "1.6" }],
        "body-sm": ["15px", { lineHeight: "1.6" }],
        "h1": ["56px", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "h2": ["40px", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "h3": ["28px", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "h4": ["22px", { lineHeight: "1.3" }],
      },
      borderRadius: {
        card: "16px",
        button: "12px",
        tag: "999px",
      },
      boxShadow: {
        "glow": "0 8px 32px -8px rgba(236, 72, 153, 0.4)",
        "glow-soft": "0 4px 24px -8px rgba(236, 72, 153, 0.15)",
        "glow-intense": "0 12px 40px -4px rgba(236, 72, 153, 0.5)",
        "card": "0 2px 12px -4px rgba(0, 0, 0, 0.3)",
        "card-hover": "0 8px 24px -8px rgba(236, 72, 153, 0.2)",
      },
      spacing: {
        "card-padding": "32px",
        "18": "72px",
        "22": "88px",
      },
      maxWidth: {
        container: "1280px",
        prose: "680px",
      },
      transitionTimingFunction: {
        "smooth": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "draw-check": {
          "0%": { strokeDashoffset: "24" },
          "100%": { strokeDashoffset: "0" },
        },
      },
      animation: {
        "shimmer": "shimmer 2s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "fade-up": "fade-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "draw-check": "draw-check 0.3s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
