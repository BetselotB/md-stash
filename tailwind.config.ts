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
          faint: 'rgba(246, 241, 220, 0.1)',
        },
        orange: {
          DEFAULT: 'var(--orange)',
          deep: 'var(--orange-deep)',
          light: '#F5B85D',
        },
        ink: {
          DEFAULT: 'var(--ink)',
        },
        // Legacy fallback mapping to ensure no breakage during migration
        pink: {
          DEFAULT: 'var(--orange)',
          deep: 'var(--orange-deep)',
          light: '#F5B85D',
        },
        line: {
          DEFAULT: 'var(--line)',
          ink: 'var(--line-ink)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        sans: ['"Nunito"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        stamp: '0 2px 0 0 rgba(0,0,0,0.15)',
        card: '0 8px 24px -4px rgba(25, 32, 28, 0.35)',
        glow: '0 0 24px -2px rgba(242, 163, 58, 0.35)',
      },
    },
  },
  plugins: [],
} satisfies Config;
