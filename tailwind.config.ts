import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          surface: "var(--bg-surface)",
          "surface-hover": "var(--bg-surface-hover)",
        },
        jade: {
          DEFAULT: "var(--jade)",
          light: "var(--jade-light)",
          dim: "var(--jade-dim)",
        },
        gold: {
          DEFAULT: "var(--gold)",
          light: "var(--gold-light)",
          dim: "var(--gold-dim)",
        },
        sage: {
          DEFAULT: "var(--sage)",
          dim: "var(--sage-dim)",
        },
        rose: {
          DEFAULT: "var(--rose)",
          dim: "var(--rose-dim)",
        },
        violet: {
          DEFAULT: "var(--violet)",
          light: "var(--violet-light)",
          dim: "var(--violet-dim)",
        },
        amber: {
          DEFAULT: "var(--amber)",
          dim: "var(--amber-dim)",
        },
        border: "var(--border)",
        "border-glow": "var(--border-glow)",
        text: "var(--text)",
        muted: "var(--muted)",
        dim: "var(--dim)",
        faint: "var(--faint)",
        season: {
          primary: "var(--season-primary)",
          secondary: "var(--season-secondary)",
        },
      },
      fontFamily: {
        display: ["Cormorant Garamond", "serif"],
        mono: ["DM Mono", "monospace"],
      },
      letterSpacing: {
        display: "0.25em",
        label: "0.14em",
      },
      animation: {
        breathe: "breathe 5.5s ease-in-out infinite",
        "orbit-slow": "orbitSlow 25s linear infinite",
        "orbit-mid": "orbitSlow 33s linear infinite",
        "orbit-fast": "orbitSlowR 41s linear infinite",
        "glow-pulse": "glowPulse 4s ease-in-out infinite",
        "fade-in-up": "fadeInUp 0.8s ease-out forwards",
        shimmer: "shimmer 3s ease-in-out infinite",
        "letter-reveal": "letterReveal 0.5s ease-out forwards",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.8" },
          "50%": { transform: "scale(1.08)", opacity: "1" },
        },
        orbitSlow: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        orbitSlowR: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(-360deg)" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.06" },
          "50%": { opacity: "0.12" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          from: { backgroundPosition: "-200% center" },
          to: { backgroundPosition: "200% center" },
        },
        letterReveal: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
