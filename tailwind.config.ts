import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "#2A2A35",
        background: "#08080A",
        surface: "#111116",
        surface2: "#181820",
        foreground: "#F8F8F8",
        muted: "#A1A1AA",
        maroon: "#8B1A3A",
        gold: "#C9A961",
        success: "#4ADE80",
        warning: "#FBBF24",
        danger: "#F87171"
      },
      boxShadow: {
        glow: "0 0 60px rgba(139, 26, 58, 0.25)",
        gold: "0 0 44px rgba(201, 169, 97, 0.16)"
      },
      backgroundImage: {
        "hero-radial":
          "radial-gradient(circle at 18% 20%, rgba(139,26,58,0.28), transparent 32%), radial-gradient(circle at 82% 12%, rgba(201,169,97,0.18), transparent 28%), linear-gradient(135deg, #08080A 0%, #111116 48%, #08080A 100%)"
      }
    }
  },
  plugins: []
};

export default config;
