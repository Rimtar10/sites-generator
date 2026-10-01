import type { Config } from "tailwindcss";

// NOTE: Tailwind styles the BUILDER UI only.
// The generated websites use their own plain CSS (src/templates/*/styles.ts)
// so that an exported site is a single self-contained .html file with no build step.
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0a0a0c",
          900: "#111114",
          800: "#1a1a1f",
          700: "#26262e",
          600: "#35353f",
          500: "#4a4a57",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
