import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'
import { FONT_FAMILY_SANS, MOTION, RADIUS, SHADOWS } from './src/lib/theme/tokens'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}', './app/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1.25rem',
      screens: {
        '2xl': '1200px',
      },
    },
    extend: {
      fontFamily: {
        sans: [FONT_FAMILY_SANS],
        display: [FONT_FAMILY_SANS],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          light: 'hsl(var(--primary-light))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          strong: 'hsl(var(--accent-strong))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Luvina-specific semantic colors
        period: {
          DEFAULT: 'hsl(var(--period))',
          foreground: 'hsl(var(--period-foreground))',
          soft: 'hsl(var(--period-soft))',
        },
        predicted: {
          DEFAULT: 'hsl(var(--predicted))',
          foreground: 'hsl(var(--predicted-foreground))',
          soft: 'hsl(var(--predicted-soft))',
        },
        fertile: {
          DEFAULT: 'hsl(var(--fertile))',
          foreground: 'hsl(var(--fertile-foreground))',
          soft: 'hsl(var(--fertile-soft))',
        },
        ovulation: {
          DEFAULT: 'hsl(var(--ovulation))',
          foreground: 'hsl(var(--ovulation-foreground))',
          soft: 'hsl(var(--ovulation-soft))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        // Brand accent (per-theme): mapped to the theme's accent-strong so
        // decorative accents follow the selected theme instead of a fixed hex.
        gold: {
          DEFAULT: 'hsl(var(--accent-strong))',
          soft: 'hsl(var(--accent) / 0.5)',
        },
      },
      spacing: {
        // Semantic spacing tokens on the 8-point grid (8/16/24/32/40/48...).
        card: '24px',
        inset: '16px',
        section: '24px',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '2xl': '1.75rem',
        '3xl': '2.25rem',
        // Semantic radius tokens from the design system.
        card: `${RADIUS.card}px`,
        button: `${RADIUS.button}px`,
        input: `${RADIUS.input}px`,
        sheet: `${RADIUS.sheet}px`,
        pill: `${RADIUS.pill}px`,
      },
      boxShadow: SHADOWS,
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%': { transform: 'scale(1.25)', opacity: '0' },
          '100%': { transform: 'scale(1.25)', opacity: '0' },
        },
      },
      animation: {
        'fade-in': `fade-in ${MOTION.fast}ms ease-out`,
        'fade-up': `fade-up ${MOTION.base}ms cubic-bezier(${MOTION.easeOut.join(',')})`,
        'scale-in': `scale-in ${MOTION.fast}ms ease-out`,
        shimmer: `shimmer 1.8s linear infinite`,
        'pulse-ring': `pulse-ring 1.8s cubic-bezier(0.22, 1, 0.36, 1) infinite`,
      },
    },
  },
  plugins: [animate],
}

export default config
