import { describe, expect, it } from 'vitest'
import {
  DEFAULT_THEME_ID,
  THEME_CATEGORIES,
  THEME_PRESETS,
  getDefaultPreset,
  getPreset,
  presetsByCategory,
  resolveThemeColors,
} from '@/lib/theme/presets'
import { THEME_COLORS } from '@/lib/theme/tokens'

describe('THEME_PRESETS', () => {
  it('ships exactly the three official themes', () => {
    expect(THEME_PRESETS.length).toBe(3)
  })

  it('has unique ids', () => {
    const ids = THEME_PRESETS.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('covers its category', () => {
    for (const category of THEME_CATEGORIES) {
      expect(presetsByCategory(category).length).toBeGreaterThan(0)
    }
  })

  it('includes the default theme', () => {
    expect(getPreset(DEFAULT_THEME_ID)).toBeDefined()
    expect(getDefaultPreset().id).toBe(DEFAULT_THEME_ID)
  })

  it('every preset ships the exact hex tokens', () => {
    for (const preset of THEME_PRESETS) {
      expect(THEME_COLORS[preset.id]).toBeDefined()
      expect(THEME_COLORS[preset.id].primary).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })
})

describe('resolveThemeColors', () => {
  it('falls back to the default preset when settings is undefined', () => {
    const colors = resolveThemeColors(undefined)
    const preset = getDefaultPreset()
    expect(colors.primaryHue).toBe(preset.primaryHue)
    expect(colors.accentHue).toBe(preset.accentHue)
  })

  it('falls back to the default preset for an unknown themeId', () => {
    const colors = resolveThemeColors({ themeId: 'does-not-exist' })
    expect(colors.primaryHue).toBe(getDefaultPreset().primaryHue)
  })

  it('falls back to the default preset for a legacy themeId', () => {
    const colors = resolveThemeColors({ themeId: 'luvina-signature' })
    expect(colors.primaryHue).toBe(getDefaultPreset().primaryHue)
  })

  it('resolves the default preset id', () => {
    const colors = resolveThemeColors({ themeId: DEFAULT_THEME_ID })
    const preset = getPreset(DEFAULT_THEME_ID)!
    expect(colors.primaryHue).toBe(preset.primaryHue)
    expect(colors.primarySaturation).toBe(preset.primarySaturation)
  })

  it('resolves each official theme id', () => {
    for (const preset of THEME_PRESETS) {
      const colors = resolveThemeColors({ themeId: preset.id })
      expect(colors.primaryHue).toBe(preset.primaryHue)
    }
  })

  it('uses the custom fields when themeId is "custom"', () => {
    const colors = resolveThemeColors({
      themeId: 'custom',
      customPrimaryHue: 210,
      customPrimarySaturation: 60,
      customAccentHue: 40,
      customAccentSaturation: 50,
      hueShift: 100,
    })
    expect(colors).toEqual({
      primaryHue: 210,
      primarySaturation: 60,
      accentHue: 40,
      accentSaturation: 50,
      hueShift: 100,
    })
  })
})
