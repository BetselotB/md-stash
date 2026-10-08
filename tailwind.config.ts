import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sage: {
          DEFAULT: 'var(--sage)',
          deep: 'var(--sage-deep)',
        },
        forest: {
          DEFAULT: 'var(--forest)',
          light: '#3A4840',
          dark: '#242C27',
        },
        cream: {
          DEFAULT: 'var(--cream)',
          dim: 'var(--cream-dim)',
          faint: 'rgba(245, 242, 227, 0.1)',
        },
        pink: {
          DEFAULT: 'var(--pink)',
          deep: 'var(--pink-deep)',
          light: '#DEB5CC',
        },
        line: 'var(--line)',
      },
      fontFamily: {
        display: ['"Bebas Neue"', '"Anton"', 'sans-serif'],
        sans: ['"Nunito"', '"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        stamp: '0 2px 0 0 rgba(0,0,0,0.15)',
        card: '0 8px 24px -4px rgba(25, 32, 28, 0.35)',
        glow: '0 0 20px -3px rgba(201, 154, 181, 0.3)',
      },
    },
  },
  plugins: [],
} satisfies Config;
