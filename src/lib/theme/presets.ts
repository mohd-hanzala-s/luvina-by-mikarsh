import type { ThemeColorInput } from '@/lib/theme/palette'
import { normalizeHue } from '@/lib/theme/colors'
import { THEME_COLORS } from '@/lib/theme/tokens'

export type ThemeCategory = 'signature'

export interface ThemePreset {
  id: string
  name: string
  category: ThemeCategory
  primaryHue: number
  primarySaturation: number
  accentHue: number
  accentSaturation: number
  /** Lightness used only for rendering the preview swatch. */
  previewLightness: number
}

export const THEME_CATEGORY_LABELS: Record<ThemeCategory, string> = {
  signature: 'Signature',
}

/**
 * Degrees added to the primary hue to derive the text/ink hue. Kept small
 * and in the same color family as the primary (rather than swinging to an
 * unrelated hue) so light and dark text both read as a deep, cohesive ink
 * instead of generic gray.
 */
export const DEFAULT_HUE_SHIFT = 14

/**
 * The three official themes. Royal Purple is the default; Sunset Rose and
 * Ocean Teal are full first-class themes. Only accent colors change between
 * them — layout, spacing, typography, icons and component structure are
 * identical. Exact hex values live in src/lib/theme/tokens.ts (THEME_COLORS);
 * the hue/saturation here power the custom-theme derivation path.
 */
export const DEFAULT_THEME_ID = 'royal-purple'

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    category: 'signature',
    primaryHue: 255,
    primarySaturation: 89,
    accentHue: 42,
    accentSaturation: 41,
    previewLightness: 73,
  },
  {
    id: 'sunset-rose',
    name: 'Sunset Rose',
    category: 'signature',
    primaryHue: 328,
    primarySaturation: 69,
    accentHue: 32,
    accentSaturation: 100,
    previewLightness: 61,
  },
  {
    id: 'ocean-teal',
    name: 'Ocean Teal',
    category: 'signature',
    primaryHue: 178,
    primarySaturation: 100,
    accentHue: 158,
    accentSaturation: 55,
    previewLightness: 25,
  },
]

const PRESETS_BY_ID: Record<string, ThemePreset> = Object.fromEntries(
  THEME_PRESETS.map((preset) => [preset.id, preset]),
)

export function getPreset(id: string): ThemePreset | undefined {
  return PRESETS_BY_ID[id]
}

export function getDefaultPreset(): ThemePreset {
  return PRESETS_BY_ID[DEFAULT_THEME_ID]
}

export const THEME_CATEGORIES: ThemeCategory[] = ['signature']

export function presetsByCategory(category: ThemeCategory): ThemePreset[] {
  return THEME_PRESETS.filter((preset) => preset.category === category)
}

/** The subset of a Settings row this module needs, so callers don't have to import the full type. */
export interface ThemeSettingsSlice {
  themeId?: string
  customPrimaryHue?: number
  customPrimarySaturation?: number
  customAccentHue?: number
  customAccentSaturation?: number
  hueShift?: number
}

/**
 * Resolve whatever is stored in Settings into concrete color inputs the
 * palette generator can use. Falls back to the default preset for a fresh
 * install, a missing/unknown themeId (e.g. a legacy 'luvina-signature'
 * saved before the three-theme system shipped), or `undefined` settings.
 */
export function resolveThemeColors(settings: ThemeSettingsSlice | null | undefined): ThemeColorInput {
  const themeId = settings?.themeId ?? DEFAULT_THEME_ID

  if (themeId === 'custom') {
    const fallback = getDefaultPreset()
    return {
      primaryHue: settings?.customPrimaryHue ?? fallback.primaryHue,
      primarySaturation: settings?.customPrimarySaturation ?? fallback.primarySaturation,
      accentHue: settings?.customAccentHue ?? fallback.accentHue,
      accentSaturation: settings?.customAccentSaturation ?? fallback.accentSaturation,
      hueShift: settings?.hueShift ?? DEFAULT_HUE_SHIFT,
    }
  }

  const preset = getPreset(themeId) ?? getDefaultPreset()
  return {
    primaryHue: preset.primaryHue,
    primarySaturation: preset.primarySaturation,
    accentHue: preset.accentHue,
    accentSaturation: preset.accentSaturation,
    hueShift: settings?.hueShift ?? DEFAULT_HUE_SHIFT,
  }
}

/** The exact hex tokens for a theme id (falls back to the default theme). */
export function getThemeColors(themeId?: string | null) {
  return THEME_COLORS[themeId ?? ''] ?? THEME_COLORS[DEFAULT_THEME_ID]
}

/** Utility re-export kept for callers that only need hue normalization. */
export { normalizeHue }
