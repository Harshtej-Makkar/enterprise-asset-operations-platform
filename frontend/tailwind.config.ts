import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

/**
 * EAOP Tailwind Theme
 *
 * Implements the Design Tokens Specification (ref: 13-Design-Tokens-Specification.md).
 * Single dark theme for MVP — light theme is documented as out-of-scope.
 *
 * All component code MUST consume these tokens (e.g. `bg-bg-surface`,
 * `text-text-primary`, `border-border-default`) instead of arbitrary hex values
 * or default Tailwind palette names.
 */
const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        md: '2rem',
      },
      screens: {
        '2xl': '1440px',
      },
    },
    extend: {
      colors: {
        // Backgrounds & surfaces
        'bg-primary': 'var(--bg-primary)',
        'bg-surface': 'var(--bg-surface)',
        'bg-surface-raised': 'var(--bg-surface-raised)',
        'bg-sidebar': 'var(--bg-sidebar)',

        // Borders
        'border-default': 'var(--border-default)',
        'border-strong': 'var(--border-strong)',
        'border-focus': 'var(--border-focus)',

        // Text
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'text-inverse': 'var(--text-inverse)',

        // Signature & semantic
        'accent-signal': 'var(--accent-signal)',
        'status-success': 'var(--status-success)',
        'status-warning': 'var(--status-warning)',
        'status-critical': 'var(--status-critical)',
        'status-info': 'var(--status-info)',
        'status-neutral': 'var(--status-neutral)',

        // shadcn/ui conventional aliases
        background: 'var(--bg-primary)',
        foreground: 'var(--text-primary)',
        card: {
          DEFAULT: 'var(--bg-surface)',
          foreground: 'var(--text-primary)',
        },
        popover: {
          DEFAULT: 'var(--bg-surface-raised)',
          foreground: 'var(--text-primary)',
        },
        primary: {
          DEFAULT: 'var(--status-info)',
          foreground: 'var(--text-primary)',
        },
        secondary: {
          DEFAULT: 'var(--bg-surface-raised)',
          foreground: 'var(--text-primary)',
        },
        muted: {
          DEFAULT: 'var(--bg-surface-raised)',
          foreground: 'var(--text-secondary)',
        },
        accent: {
          DEFAULT: 'var(--bg-surface-raised)',
          foreground: 'var(--text-primary)',
        },
        destructive: {
          DEFAULT: 'var(--status-critical)',
          foreground: 'var(--text-primary)',
        },
        input: 'var(--border-default)',
        ring: 'var(--border-focus)',
      },
      borderRadius: {
        // Deliberately sharp — see doc 13 §6. No 16px+ radii anywhere.
        sm: '4px',
        md: '4px',
        lg: '6px',
        pill: '9999px',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // See doc 13 §4
        h1: ['32px', { lineHeight: '40px', fontWeight: '700' }],
        h2: ['28px', { lineHeight: '36px', fontWeight: '700' }],
        h3: ['24px', { lineHeight: '32px', fontWeight: '600' }],
        h4: ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        body: ['14px', { lineHeight: '20px', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '16px', fontWeight: '400' }],
        code: ['13px', { lineHeight: '18px', fontWeight: '400' }],
      },
      spacing: {
        // 8px base — see doc 13 §5
        4.5: '18px',
        5.5: '22px',
      },
      boxShadow: {
        // Subtle — see doc 13 §7
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        md: '0 2px 4px 0 rgba(0, 0, 0, 0.45)',
        lg: '0 4px 8px 0 rgba(0, 0, 0, 0.5)',
        xl: '0 8px 24px 0 rgba(0, 0, 0, 0.55)',
      },
      keyframes: {
        // See doc 13 §13 — only fade, slide, scale. No bounce/flip/elastic.
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      zIndex: {
        // See doc 13 §14
        dropdown: '100',
        sticky: '200',
        'sidebar-overlay': '300',
        dialog: '400',
        toast: '500',
        tooltip: '600',
      },
    },
  },
  plugins: [animate],
};

export default config;
