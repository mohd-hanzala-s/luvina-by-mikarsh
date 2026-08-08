import {
  type HSL,
  WHITE,
  darkInk,
  ensureAaColor,
  hexToHsl,
  hslString,
  pickForeground,
} from '@/lib/theme/colors'
import { DARK_BASE, LIGHT_BASE, THEME_COLORS } from '@/lib/theme/tokens'

/** The inputs a theme (preset or custom) reduces to. */
export interface ThemeColorInput {
  primaryHue: number
  primarySaturation: number
  accentHue: number
  accentSaturation: number
  /**
   * Degrees added to `primaryHue` to derive the "ink" hue used for text that
   * sits on the primary color. Kept in the same color family as the primary.
   */
  hueShift: number
}

export type Mode = 'light' | 'dark'

/** A full set of CSS custom-property values, ready to apply to an element's inline style. */
export type PaletteVars = Record<string, string>

/**
 * CSS variable names this engine controls. Semantic status colors (period,
 * fertile, success, warning, etc.) are intentionally left alone — they carry
 * meaning and stay constant across themes.
 */
export const THEME_MANAGED_VARS = [
  '--background',
  '--foreground',
  '--card',
  '--card-foreground',
  '--popover',
  '--popover-foreground',
  '--primary',
  '--primary-light',
  '--primary-foreground',
  '--secondary',
  '--secondary-foreground',
  '--muted',
  '--muted-foreground',
  '--accent',
  '--accent-foreground',
  '--accent-strong',
  '--border',
  '--input',
  '--ring',
  '--shadow-color',
] as const

/** The three official preset ids (keys of THEME_COLORS). Anything else — including legacy ids and `'custom'` — is derived from hue/saturation. */
const OFFICIAL_THEME_IDS = Object.keys(THEME_COLORS)

interface PaletteInputBase {
  themeId?: string
  hueShift?: number
  mode: Mode
}

/** Runtime palette generation options: a resolved theme id plus the custom-theme hue fields. */
export type PaletteInput = PaletteInputBase & Partial<ThemeColorInput>

const LIGHT_FOREGROUND: HSL = { h: 221, s: 39, l: 11 } // #111827
const LIGHT_MUTED_FOREGROUND: HSL = { h: 221, s: 18, l: 42 }
const DARK_FOREGROUND: HSL = { h: 0, s: 0, l: 96 } // #F5F5F5
const DARK_MUTED_FOREGROUND: HSL = { h: 0, s: 0, l: 64 } // #A3A3A3

/** Neutral (theme-agnostic) light tokens, tinted with the ink hue for cohesion. */
function lightNeutrals(surface: HSL): {
  border: HSL
  input: HSL
  shadow: HSL
  background: HSL
  card: HSL
  surfaceSecondary: HSL
  popover: HSL
} {
  return {
    // A soft, theme-tinted near-white ground (Royal Purple resolves to
    // ~#F8F7FC); cards sit pure white on top of it.
    background: { h: surface.h, s: Math.min(surface.s * 0.35, 40), l: 98 },
    card: hexToHsl(LIGHT_BASE.card),
    popover: hexToHsl(LIGHT_BASE.card),
    surfaceSecondary: hexToHsl(LIGHT_BASE.card),
    border: { h: surface.h, s: Math.min(surface.s * 0.25, 30), l: 91 },
    input: { h: 214, s: 25, l: 84 },
    shadow: { h: 222, s: 40, l: 18 },
  }
}

/** Theme-agnostic dark tokens — a dedicated dark theme, not an inverted light one. */
function darkNeutrals(): {
  border: HSL
  input: HSL
  shadow: HSL
  background: HSL
  card: HSL
  surfaceSecondary: HSL
  popover: HSL
} {
  const card = hexToHsl(DARK_BASE.card)
  const surfaceSecondary = hexToHsl(DARK_BASE.surfaceSecondary)
  return {
    background: { h: 0, s: 0, l: 0 },
    card,
    popover: surfaceSecondary,
    border: surfaceSecondary,
    input: { h: 0, s: 0, l: 20 },
    shadow: { h: 0, s: 0, l: 0 },
    surfaceSecondary,
  }
}

/** Resolve the base themed colors (primary, primary-light, accent, surface) for the given input. */
function resolveThemeBases(input: PaletteInput): {
  primary: HSL
  primaryLight: HSL
  accent: HSL
  surface: HSL
  inkHue: number
} {
  const themeId = input.themeId ?? ''
  const inkHue = (input.primaryHue ?? 255) + (input.hueShift ?? 14)

  if (OFFICIAL_THEME_IDS.includes(themeId)) {
    const colors = THEME_COLORS[themeId]
    return {
      primary: hexToHsl(colors.primary),
      primaryLight: hexToHsl(colors.primaryLight),
      accent: hexToHsl(colors.accent),
      surface: hexToHsl(colors.surface),
      inkHue,
    }
  }

  const primaryHue = input.primaryHue ?? 255
  const primarySaturation = input.primarySaturation ?? 90
  const accentHue = input.accentHue ?? 45
  const accentSaturation = input.accentSaturation ?? 92

  // Derived palette for legacy/custom themes: same derivation rules the
  // signature palette used, now producing the full new token set.
  return {
    primary: { h: primaryHue, s: primarySaturation, l: 60 },
    primaryLight: { h: primaryHue, s: primarySaturation, l: 70 },
    accent: { h: accentHue, s: accentSaturation, l: 60 },
    surface: { h: primaryHue, s: Math.min(primarySaturation, 85), l: 95 },
    inkHue,
  }
}

/**
 * Generate every managed CSS variable for a given mode.
 *
 * Light mode: a soft theme-tinted near-white ground, pure-white cards, soft
 * shadows, and the exact brand primary (auto-adjusted only when it cannot
 * reach WCAG AA text contrast on white — see `ensureAaColor`). Dark mode: a
 * dedicated dark theme — pitch black ground, layered #1A1A1A / #2A2A2A
 * surfaces, no shadows — with the theme's light primary used for accents so
 * it stays readable on black.
 */
export function generatePalette(input: PaletteInput): PaletteVars {
  const { mode } = input
  const dark = mode === 'dark'
  const { primary, primaryLight, accent, surface, inkHue } = resolveThemeBases(input)

  const neutrals = dark ? darkNeutrals() : lightNeutrals(surface)

  // In light mode the primary is the brand color, adjusted only if it cannot
  // reach WCAG AA text contrast on the white background. In dark mode the
  // lighter "primary light" variant carries the accent so text and buttons
  // stay readable on the black ground.
  const effectivePrimary: HSL = dark
    ? ensureAaColor(primaryLight, inkHue)
    : ensureAaColor(primary, inkHue, [WHITE])
  const primaryForeground = pickForeground(effectivePrimary, inkHue)

  const foreground = dark ? DARK_FOREGROUND : LIGHT_FOREGROUND
  const mutedForeground = dark ? DARK_MUTED_FOREGROUND : LIGHT_MUTED_FOREGROUND

  // Card surface: pure white in light mode, #1A1A1A in dark mode. Secondary
  // buttons/tints use the theme surface color in light mode.
  const card = dark ? neutrals.card : hexToHsl(LIGHT_BASE.card)
  const secondary = dark ? neutrals.surfaceSecondary : surface
  // Muted (chips, tracks, skeletons) is the surface deepened a touch so it
  // stays visible when sitting on a white card.
  const muted: HSL = dark
    ? neutrals.surfaceSecondary
    : { h: surface.h, s: Math.min(surface.s, 75), l: Math.max(88, surface.l - 4) }
  const accentBg: HSL = dark
    ? { h: accent.h, s: Math.min(accent.s, 60), l: 18 }
    : { h: accent.h, s: Math.min(accent.s, 70), l: 94 }
  const accentForeground: HSL = dark
    ? { h: accent.h, s: 50, l: 85 }
    : { h: accent.h, s: 55, l: 32 }
  // The strong accent is a decorative fill AND a text color, so it must keep
  // AA contrast on its own background: deepened to a bronze tone in light
  // mode and softened to a pale champagne in dark mode.
  const accentStrong: HSL = dark
    ? { h: accent.h, s: Math.min(accent.s, 55), l: 74 }
    : { h: accent.h, s: Math.min(accent.s, 45), l: 34 }

  return {
    '--background': hslString(neutrals.background),
    '--foreground': hslString(foreground),
    '--card': hslString(card),
    '--card-foreground': hslString(foreground),
    '--popover': hslString(neutrals.popover),
    '--popover-foreground': hslString(foreground),
    '--primary': hslString(effectivePrimary),
    '--primary-light': hslString(primaryLight),
    '--primary-foreground': hslString(primaryForeground),
    '--secondary': hslString(secondary),
    '--secondary-foreground': hslString(foreground),
    '--muted': hslString(muted),
    '--muted-foreground': hslString(mutedForeground),
    '--accent': hslString(accentBg),
    '--accent-foreground': hslString(accentForeground),
    '--accent-strong': hslString(accentStrong),
    '--border': hslString(neutrals.border),
    '--input': hslString(neutrals.input),
    '--ring': hslString(effectivePrimary),
    '--shadow-color': hslString(neutrals.shadow),
  }
}

/** Apply a set of CSS variables to an element's inline style (defaults to the document root). */
export function applyPalette(vars: PaletteVars, target: HTMLElement = document.documentElement): void {
  for (const [name, value] of Object.entries(vars)) {
    target.style.setProperty(name, value)
  }
}

/** Remove inline overrides so the stylesheet's static fallback values take over again. */
export function clearPaletteOverrides(target: HTMLElement = document.documentElement): void {
  for (const name of THEME_MANAGED_VARS) target.style.removeProperty(name)
}

export { darkInk }
