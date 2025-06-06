import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        // Matrix Theme Colors
        'matrix-cyber-blue': 'var(--matrix-cyber-blue)',
        'matrix-green': 'var(--matrix-green)',
        'matrix-black': 'var(--matrix-black)',
        'matrix-green-light': 'var(--matrix-green-light)',
        'matrix-green-dark': 'var(--matrix-green-dark)',
        'matrix-green-glow': 'var(--matrix-green-glow)',
        'matrix-blue-light': 'var(--matrix-blue-light)',
        'matrix-blue-dark': 'var(--matrix-blue-dark)',
        'matrix-blue-glow': 'var(--matrix-blue-glow)',
        'matrix-bg-black': 'var(--matrix-bg-black)',
        'matrix-bg-dark': 'var(--matrix-bg-dark)',
        'matrix-bg-medium': 'var(--matrix-bg-medium)',
        'matrix-overlay': 'var(--matrix-overlay)',
        'matrix-glass': 'var(--matrix-glass)',
        'matrix-rain-alpha': 'var(--matrix-rain-alpha)',
      },
      spacing: {
        sidebar: "var(--sidebar-width)",
        header: "var(--header-height)",
        section: "var(--section-spacing)",
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        5: "var(--space-5)",
        6: "var(--space-6)",
        8: "var(--space-8)",
        10: "var(--space-10)",
        12: "var(--space-12)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "var(--radius-sm)",
        sm: "var(--radius-lg)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        // Matrix Glow Effects
        'matrix-glow': '0 0 20px rgba(0, 255, 65, 0.5)',
        'cyber-glow': '0 0 20px rgba(0, 212, 255, 0.5)',
        'red-glow': '0 0 20px rgba(255, 0, 0, 0.5)',
      },
      zIndex: {
        header: "var(--z-header)",
        sidebar: "var(--z-sidebar)",
        overlay: "var(--z-overlay)",
        modal: "var(--z-modal)",
        toast: "var(--z-toast)",
      },
      maxWidth: {
        content: "var(--content-max-width)",
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
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "slide-in": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-out": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-100%)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        // Matrix Animations
        "matrix-glow": {
          "0%, 100%": { 
            textShadow: "0 0 5px rgba(0, 255, 65, 0.8)",
            opacity: "0.8" 
          },
          "50%": { 
            textShadow: "0 0 20px rgba(0, 255, 65, 1), 0 0 30px rgba(0, 255, 65, 1)",
            opacity: "1" 
          },
        },
        "cyber-glow": {
          "0%, 100%": { 
            textShadow: "0 0 5px rgba(0, 212, 255, 0.8)",
            boxShadow: "0 0 10px rgba(0, 212, 255, 0.3)" 
          },
          "50%": { 
            textShadow: "0 0 20px rgba(0, 212, 255, 1), 0 0 30px rgba(0, 212, 255, 1)",
            boxShadow: "0 0 20px rgba(0, 212, 255, 0.5), 0 0 40px rgba(0, 212, 255, 0.3)" 
          },
        },
        "matrix-flicker": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
          "75%": { opacity: "0.9" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "fade-out": "fade-out 0.2s ease-out",
        "slide-in": "slide-in 0.2s ease-out",
        "slide-out": "slide-out 0.2s ease-out",
        "pulse-slow": "pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        // Matrix Animations
        "matrix-glow": "matrix-glow 2s ease-in-out infinite",
        "cyber-glow": "cyber-glow 2s ease-in-out infinite",
        "matrix-flicker": "matrix-flicker 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config; 