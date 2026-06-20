/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#0B0B12",
        surface: "#16151F",
        raised: "#1E1D2A",
        bone: "#F5F3EE",
        "bone-dim": "#A8A6B3",
        violet: "#7C5CFF",
        ember: "#FF6B47",
        mint: "#3DDC97",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-inter)", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      keyframes: {
        pulseDot: { "0%,100%": { opacity: "0.35" }, "50%": { opacity: "1" } },
        fadeUp: { from: { opacity: "0", transform: "translateY(10px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        drawLine: { from: { strokeDashoffset: "600" }, to: { strokeDashoffset: "0" } },
      },
      animation: {
        pulseDot: "pulseDot 1s ease infinite",
        fadeUp: "fadeUp .45s ease both",
        drawLine: "drawLine 1.2s ease forwards",
      },
    },
  },
  plugins: [],
};
