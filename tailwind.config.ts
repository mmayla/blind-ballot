import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Semantic color tokens
        'content': {
          primary: '#ffffff',
          secondary: '#9ca3af',
          muted: '#6b7280',
        },
        'surface': {
          primary: '#0a0a0a',
          secondary: '#171717',
          elevated: '#262626',
        },
        'border': {
          primary: '#ffffff',
          secondary: '#374151',
        },
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: false,
  },
} satisfies Config;
