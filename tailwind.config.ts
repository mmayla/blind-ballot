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

          // Custom semantic tokens
          "--text-primary": "#ffffff",      // Main text color
          "--text-secondary": "#9ca3af",    // Less prominent text
          "--text-muted": "#6b7280",        // Subtle text elements
          "--border-primary": "#ffffff",     // Main borders
          "--border-secondary": "#374151",   // Subtle borders
          "--bg-primary": "#0a0a0a",        // Main background
          "--bg-secondary": "#171717",       // Secondary background
          "--bg-elevated": "#262626",        // Elevated elements
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
