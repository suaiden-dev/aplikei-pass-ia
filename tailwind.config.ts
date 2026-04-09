import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

export default {
  darkMode: "class",
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "var(--space-4)",
      screens: {
        "2xl": "1200px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Plus Jakarta Sans", "sans-serif"],
      },
      colors: {
        border: "var(--color-border)",
        input: "var(--color-border)",
        ring: "var(--color-primary)",
        background: "var(--color-bg)",
        foreground: "var(--color-text-primary)",
        primary: {
          DEFAULT: "var(--color-primary)",
          foreground: "var(--color-card)",
          hover: "var(--color-primary-hover)",
        },
        secondary: {
          DEFAULT: "var(--color-bg)",
          foreground: "var(--color-text-secondary)",
        },
        destructive: {
          DEFAULT: "var(--color-danger)",
          foreground: "var(--color-card)",
        },
        muted: {
          DEFAULT: "var(--color-bg)",
          foreground: "var(--color-text-secondary)",
        },
        accent: {
          DEFAULT: "var(--color-primary)",
          foreground: "var(--color-card)",
        },
        popover: {
          DEFAULT: "var(--color-card)",
          foreground: "var(--color-text-primary)",
        },
        card: {
          DEFAULT: "var(--color-card)",
          foreground: "var(--color-text-primary)",
        },
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
        info: "var(--color-info)",
        highlight: "#0F172A",
        "cloud-grey": "#F4F7F9",
        "dark-grey": "#2A2D30",
      },
      spacing: {
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        5: "var(--space-5)",
        6: "var(--space-6)",
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      fontSize: {
        "title-xl": ["var(--font-title-xl)", { fontWeight: "var(--weight-title-xl)" }],
        "title": ["var(--font-title)", { fontWeight: "var(--weight-title)" }],
        "subtitle": ["var(--font-subtitle)", { fontWeight: "var(--weight-subtitle)" }],
        "body": ["var(--font-body)", { fontWeight: "var(--weight-body)" }],
        "small": ["var(--font-small)", { fontWeight: "var(--weight-small)" }],
        "label": ["var(--font-label)", { fontWeight: "var(--weight-label)" }],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down var(--animate-normal) var(--ease-standard)",
        "accordion-up": "accordion-up var(--animate-normal) var(--ease-standard)",
        "fade-up": "fade-up var(--animate-slow) var(--ease-standard)",
        "fade-in": "fade-in var(--animate-slow) var(--ease-standard)",
      },
    },
  },
  plugins: [tailwindAnimate],
} satisfies Config;
