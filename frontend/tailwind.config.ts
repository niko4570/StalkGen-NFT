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
         background: "#050012",
         primary: "#8b5cf6",
         secondary: "#a78bfa",
         foreground: "#f8fafc",
         border: "#8b5cf6",
         input: "#8b5cf6",
         ring: "#fbbf24",
         card: "#08001f",
         "card-foreground": "#f8fafc",
         popover: "#050012",
         "popover-foreground": "#f8fafc",
         "primary-foreground": "#050012",
         "secondary-foreground": "#050012",
         muted: "#0f0f23",
         "muted-foreground": "#c4b5fd",
         accent: "#fbbf24",
         "accent-foreground": "#050012",
         destructive: "#ef4444",
         "destructive-foreground": "#f8fafc",
       },
      fontFamily: {
        heading: ["VT323", "monospace"],
        body: ["VT323", "monospace"],
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
