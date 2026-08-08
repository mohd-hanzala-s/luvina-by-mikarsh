/**
 * Central design tokens for Luvina.
 *
 * This file is the single source of truth for the visual language:
 * colors, typography, spacing, radii, shadows, elevation, icon sizing and
 * motion. Values defined here feed the Tailwind theme (tailwind.config.ts)
 * and the runtime palette engine (src/lib/theme/palette.ts) so nothing in
 * the app hardcodes a magic number that lives in more than one place.
 */

/* ---------------------------------------------------------------------------
 * Color system
 * ------------------------------------------------------------------------- */

export interface ThemeHexColors {
  primary: string
  primaryLight: string
  accent: string
  surface: string
}

/**
 * The three official themes. Only accent colors change between themes —
 * layout, spacing, typography, icons and component structure are identical.
 * Royal Purple is the default.
 *
 * Royal Purple ships a premium Champagne Gold accent (#D6C59D) rather than a
 * bright yellow, so the palette reads warm and refined instead of toy-like.
 */
export const THEME_COLORS: Record<string, ThemeHexColors> = {
  'royal-purple': {
    primary: '#6C3EF4',
    primaryLight: '#8C5DFF',
    accent: '#D6C59D',
    surface: '#EDE9FE',
  },
  'sunset-rose': {
    primary: '#E056A0',
    primaryLight: '#F278AE',
    accent: '#FFD7A8',
    surface: '#FFF1F3',
  },
  'ocean-teal': {
    primary: '#007F7A',
    primaryLight: '#20B2AA',
    accent: '#A8E6CF',
    surface: '#E6F7F5',
  },
}

/**
 * Light-mode tokens shared by every theme. The background is a soft,
 * theme-tinted near-white (the runtime palette blends each theme's surface
 * color toward white to produce it — Royal Purple resolves to #F8F7FC) and
 * the text is always #111827; cards sit pure white on top of it.
 */
export const LIGHT_BASE = {
  background: '#F8F7FC',
  foreground: '#111827',
  card: '#FFFFFF',
  border: '#E5E9F0',
  input: '#CBD5E1',
  shadow: '#111827',
} as const

/**
 * Dark-mode tokens shared by every theme. A dedicated dark theme rather than
 * an inverted light one: pitch black ground with layered neutral surfaces.
 * Shadows are intentionally absent in dark mode (surface elevation carries
 * the depth instead), so the shadow color is black.
 */
export const DARK_BASE = {
  background: '#000000',
  foreground: '#F5F5F5',
  card: '#1A1A1A',
  surfaceSecondary: '#2A2A2A',
  border: '#2A2A2A',
  input: '#2A2A2A',
  mutedForeground: '#A3A3A3',
  shadow: '#000000',
} as const

/* ---------------------------------------------------------------------------
 * Typography
 * ------------------------------------------------------------------------- */

/** Primary font family (Poppins) with the Inter fallback. */
export const FONT_FAMILY_SANS =
  "'Poppins', 'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"

/**
 * Font size / weight pairs for the type scale. Sizes are multiples of the
 * 4px unit so they stay on the spacing rhythm; weights use the named
 * hierarchy (H1/H2 Semibold, H3 Medium, Body Regular, Caption Medium,
 * Button Medium).
 */
export const TYPOGRAPHY = {
  h1: { fontSize: '28px', lineHeight: '36px', fontWeight: 600 },
  h2: { fontSize: '24px', lineHeight: '32px', fontWeight: 600 },
  h3: { fontSize: '18px', lineHeight: '26px', fontWeight: 500 },
  body: { fontSize: '14px', lineHeight: '22px', fontWeight: 400 },
  caption: { fontSize: '12px', lineHeight: '16px', fontWeight: 500 },
  button: { fontSize: '14px', lineHeight: '20px', fontWeight: 500 },
} as const

/* ---------------------------------------------------------------------------
 * Spacing — strict 8-point grid
 * ------------------------------------------------------------------------- */

export const SPACING = {
  8: 8,
  16: 16,
  24: 24,
  32: 32,
  40: 40,
  48: 48,
  56: 56,
  64: 64,
  72: 72,
  80: 80,
} as const

/* ---------------------------------------------------------------------------
 * Border radius
 * ------------------------------------------------------------------------- */

export const RADIUS = {
  input: 12,
  button: 16,
  card: 20,
  sheet: 24,
  pill: 9999,
} as const

/* ---------------------------------------------------------------------------
 * Shadows & elevation
 *
 * Light mode uses soft, diffuse shadows. Dark mode deliberately does not —
 * layered surfaces (#1A1A1A / #2A2A2A) provide the depth instead.
 * ------------------------------------------------------------------------- */

export const SHADOWS = {
  soft: '0 2px 16px -2px hsl(var(--shadow-color) / 0.08), 0 1px 4px -1px hsl(var(--shadow-color) / 0.05)',
  lifted:
    '0 8px 32px -8px hsl(var(--shadow-color) / 0.16), 0 4px 12px -4px hsl(var(--shadow-color) / 0.08)',
  glow: '0 0 0 1px hsl(var(--ring) / 0.25), 0 8px 40px -8px hsl(var(--primary) / 0.35)',
} as const

/* ---------------------------------------------------------------------------
 * Icon sizing
 * ------------------------------------------------------------------------- */

export const ICON_SIZE = {
  sm: 16,
  md: 20,
  lg: 24,
  strokeWidth: 2,
} as const

/* ---------------------------------------------------------------------------
 * Motion
 *
 * Subtle motion only: 150–250ms, ease-out. Longer or bouncier transitions
 * would read as excessive in a calm, health-focused app.
 * ------------------------------------------------------------------------- */

export const MOTION = {
  fast: 150,
  base: 200,
  slow: 250,
  /** Standard ease-out curve used across transitions. */
  easeOut: [0.16, 1, 0.3, 1],
} as const

export const MOTION_CSS = {
  fast: `${MOTION.fast}ms`,
  base: `${MOTION.base}ms`,
  slow: `${MOTION.slow}ms`,
  easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
} as const

/* ---------------------------------------------------------------------------
 * Accessibility
 * ------------------------------------------------------------------------- */

/** Minimum touch target size (WCAG 2.5.8 / platform guidance). */
export const MIN_TOUCH_TARGET = 48 as const
