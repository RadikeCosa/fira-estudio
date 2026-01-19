import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Playfair Display", "serif"],
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0px",  // Minimalista - bordes rectos
        sm: "2px",
        md: "4px",
        lg: "8px",
        xl: "12px",
      },
    },
  },
  plugins: [],
};

export default config;
