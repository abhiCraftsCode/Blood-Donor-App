/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0B1220",
          800: "#121A2B",
          600: "#1E2740",
          500: "#5B6478",
          300: "#8E97A8",
        },
        paper: {
          DEFAULT: "#F7F5F1",
          dim: "#EFEDE7",
        },
        pulse: {
          DEFAULT: "#E11D3C",
          600: "#C71733",
          100: "#FCE4E7",
        },
        plasma: {
          DEFAULT: "#F5A524",
          100: "#FDF1DA",
        },
        vital: {
          DEFAULT: "#0FA968",
          100: "#DCF5EA",
        },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,18,32,0.04), 0 8px 24px -8px rgba(11,18,32,0.10)",
        "card-hover": "0 4px 12px rgba(11,18,32,0.06), 0 16px 40px -12px rgba(11,18,32,0.16)",
        glow: "0 0 0 1px rgba(225,29,60,0.15), 0 8px 24px -4px rgba(225,29,60,0.25)",
      },
      keyframes: {
        pulseLine: {
          "0%": { strokeDashoffset: "0" },
          "100%": { strokeDashoffset: "-200" },
        },
        spike: {
          "0%, 100%": { transform: "scaleY(1)" },
          "50%": { transform: "scaleY(1.6)" },
        },
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        pulseLine: "pulseLine 2.4s linear infinite",
        spike: "spike 0.4s ease-in-out",
        fadeUp: "fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both",
      },
    },
  },
  plugins: [],
};
