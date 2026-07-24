/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // As cores usam CSS variables para permitir personalização por tenant
      // (ver src/styles/themes.css). Cada estabelecimento pode sobrescrever
      // --brand-primary / --brand-secondary sem precisar de rebuild.
      colors: {
        brand: {
          primary: 'rgb(var(--brand-primary) / <alpha-value>)',
          secondary: 'rgb(var(--brand-secondary) / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          raised: 'rgb(var(--surface-raised) / <alpha-value>)',
        },
        ink: {
          DEFAULT: 'rgb(var(--ink) / <alpha-value>)',
          muted: 'rgb(var(--ink-muted) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['"Fredoka"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card: '1.25rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px -8px rgba(0,0,0,0.12)',
        // "Sombra dura" com deslocamento sólido — assinatura visual retrô,
        // usada nos cards de produto e nos selos de preço/promoção.
        hard: '4px 4px 0 rgb(var(--ink))',
        'hard-sm': '3px 3px 0 rgb(var(--ink))',
      },
    },
  },
  plugins: [],
};
