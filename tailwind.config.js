/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#C5F232',
        secondary: '#9BB641',
        tertiary: '#683f8a',
        'background-light': '#fafafa',
        'background-overlay': 'var(--background-overlay)',
        'text-adaptive': "var(--text-adaptive)",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",

        'backg': '#0e0e0e',
      }
    },
  },
  darkMode: 'class',
  plugins: [],
} 