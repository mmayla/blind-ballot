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
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        dark: {
          "primary": "#ffffff",
          "secondary": "#ffffff",
          "accent": "#ffffff",
          "neutral": "#000000",
          "base-100": "#0a0a0a",
          "base-200": "#171717",
          "base-300": "#262626",
          "base-content": "#ffffff",
          "info": "#ffffff",
          "success": "#ffffff",
          "warning": "#ffffff",
          "error": "#ffffff",
        },
      },
    ],
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: false,
  },
} satisfies Config;
