import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#B21F2D",
          creme: "#F6E7C8",
          green: "#1F7A4A",
          ink: "#1a1a1a",
        },
      },
      borderRadius: { xl2: "1.25rem" },
      boxShadow: { soft: "0 10px 30px rgba(0,0,0,0.10)" },
    },
  },
  plugins: [],
} satisfies Config;
