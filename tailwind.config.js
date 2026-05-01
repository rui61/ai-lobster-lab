/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'wildman-bg': '#0f172a',
        'wildman-card': '#1e293b',
        'wildman-accent': '#ff4500',
        'cn-holiday': '#ef4444', // Red
        'cn-gold': '#fbbf24',    // Gold
        'us-holiday': '#3b82f6', // Blue
        'us-white': '#f8fafc',   // White
      },
    },
  },
  plugins: [],
}
