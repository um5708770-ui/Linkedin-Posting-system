import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // Core Primary Blue
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          dark: '#0F172A', // Dark Navy slate
          surface: '#1E293B',
          card: '#0F172A',
        },
      },
    },
  },
  plugins: [],
};
export default config;
