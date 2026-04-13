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
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        // Swedbank custom colors
        swed: {
          orange: "#FF6100",
          dark: "#0F1923",
          card: "#1A2332",
          surface: "#1E2A3A",
          border: "#2A3545",
        },
        success: "#00C48C",
        danger: "#FF4757",
        warning: "#FFBE0B",
        info: "#0096FF",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-ibm-plex-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"],
      },
      keyframes: {
        slideIn: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        livePulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        riskPulse: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255, 71, 87, 0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(255, 71, 87, 0)" },
        },
        criticalGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(239, 68, 68, 0.4), 0 0 15px -3px rgba(239, 68, 68, 0.1)" },
          "50%": { boxShadow: "0 0 0 6px rgba(239, 68, 68, 0), 0 0 25px -3px rgba(239, 68, 68, 0.25)" },
        },
        highGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255, 97, 0, 0.3)" },
          "50%": { boxShadow: "0 0 0 5px rgba(255, 97, 0, 0)" },
        },
        dotPulse: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(1.3)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        slideIn: "slideIn 0.3s ease-out",
        slideInRight: "slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        fadeUp: "fadeUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) both",
        livePulse: "livePulse 1.5s ease-in-out infinite",
        riskPulse: "riskPulse 2s ease-in-out infinite",
        criticalGlow: "criticalGlow 2s ease-in-out infinite",
        highGlow: "highGlow 2.5s ease-in-out infinite",
        dotPulse: "dotPulse 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
