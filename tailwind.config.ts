import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      animation: {
        drift: "drift 18s ease-in-out infinite",
        shimmer: "shimmer 12s linear infinite",
        pulseGlow: "pulseGlow 5s ease-in-out infinite"
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-body)", "var(--font-sans)"]
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(0, -10px, 0) scale(1.03)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" }
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.5", transform: "scale(0.98)" },
          "50%": { opacity: "0.9", transform: "scale(1.02)" }
        }
      },
      boxShadow: {
        soft: "0 24px 60px rgba(4, 6, 12, 0.38)",
        card: "0 20px 48px rgba(5, 8, 15, 0.32)"
      },
      colors: {
        app: {
          bg: "var(--bg)",
          surface: "var(--surface)",
          surface2: "var(--surface-2)",
          border: "var(--border)",
          text: "var(--text)",
          muted: "var(--muted)",
          purple: "var(--purple)",
          "purple-hover": "var(--purple-hover)",
          success: "var(--success)",
          risk: "var(--risk)"
        }
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.5rem"
      },
      backgroundImage: {
        "app-grid":
          "radial-gradient(circle at top, rgba(31, 28, 184, 0.22), transparent 28%), linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0) 20%)"
      }
    }
  },
  plugins: []
};

export default config;
