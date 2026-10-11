import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sage: {
          DEFAULT: '#838D78',
          deep: '#5E6A54',
        },
        forest: {
          DEFAULT: '#2F3A33',
          light: '#3A4840',
          dark: '#242C27',
        },
        cream: {
          DEFAULT: '#F8F7E6',
          dim: '#E6E4D1',
          faint: 'rgba(246, 241, 220, 0.1)',
        },
        oat: {
          DEFAULT: '#D8D3BC',
          light: '#E2DEC9',
        },
        orange: {
          DEFAULT: '#EEB257',
          deep: '#D99E41',
          light: '#F5B85D',
        },
        ink: {
          DEFAULT: '#26332A',
        },
        // Legacy fallback mapping to ensure no breakage during migration
        pink: {
          DEFAULT: 'var(--orange)',
          deep: 'var(--orange-deep)',
          light: '#F5B85D',
        },
        dialog: {
          DEFAULT: 'var(--dialog-bg)',
        },
        field: {
          DEFAULT: 'var(--field-bg)',
          border: 'var(--field-border)',
        },
        scrim: 'var(--scrim)',
        danger: {
          DEFAULT: 'var(--danger)',
          hover: '#963024',
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
