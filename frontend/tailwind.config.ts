/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        background: "#0d001a",
        primary: "#ff00cc",
        secondary: "#00f0ff",
        foreground: "#ffffff",
        border: "#ff00cc",
        input: "#ff00cc",
        ring: "#00f0ff",
        card: "#0d001a",
        "card-foreground": "#ffffff",
        popover: "#0d001a",
        "popover-foreground": "#ffffff",
        "primary-foreground": "#ffffff",
        "secondary-foreground": "#0d001a",
        muted: "#0d001a",
        "muted-foreground": "#ffffff",
        accent: "#ff00cc",
        "accent-foreground": "#ffffff",
        destructive: "#ff0000",
        "destructive-foreground": "#ffffff",
      },
      fontFamily: {
        vt323: ["VT323", "monospace"],
        default: ["VT323", "monospace"],
      },
      borderRadius: {
        none: "0",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        scan: {
          "0%": {
            transform: "translateY(-100%)",
          },
          "100%": {
            transform: "translateY(100%)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        scan: "scan 8s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
