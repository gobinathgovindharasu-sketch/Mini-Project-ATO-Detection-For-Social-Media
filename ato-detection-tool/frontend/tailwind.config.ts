import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "ato-black": "#0a0a0a",
        "ato-dark": "#111111",
        "ato-card": "#161616",
        "ato-border": "#1e1e1e",
        "ato-cyan": "#00e5ff",
        "ato-red": "#ff1744",
        "ato-green": "#00e676",
        "ato-yellow": "#ffd600",
        "ato-gray": "#8a8a8a",
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
