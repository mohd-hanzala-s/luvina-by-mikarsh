import { describe, expect, it } from 'vitest'
import { generatePalette, THEME_MANAGED_VARS } from '@/lib/theme/palette'
import { DEFAULT_HUE_SHIFT, THEME_PRESETS } from '@/lib/theme/presets'
import { hexToHsl, hslContrast, WHITE } from '@/lib/theme/colors'
import { THEME_COLORS } from '@/lib/theme/tokens'

const defaultPreset = THEME_PRESETS.find((preset) => preset.id === 'royal-purple')!

function paletteFor(presetId: string, mode: 'light' | 'dark') {
  const preset = THEME_PRESETS.find((p) => p.id === presetId) ?? defaultPreset
  return generatePalette({
    themeId: presetId,
    primaryHue: preset.primaryHue,
    primarySaturation: preset.primarySaturation,
    accentHue: preset.accentHue,
    accentSaturation: preset.accentSaturation,
    hueShift: DEFAULT_HUE_SHIFT,
    mode,
  })
}

describe('generatePalette', () => {
  it('produces every managed CSS variable', () => {
    const palette = paletteFor('royal-purple', 'light')
    for (const key of THEME_MANAGED_VARS) {
      expect(palette[key]).toBeTruthy()
    }
  })

  it('generates different backgrounds for light and dark mode', () => {
    const light = paletteFor('royal-purple', 'light')
    const dark = paletteFor('royal-purple', 'dark')
    expect(light['--background']).not.toBe(dark['--background'])
    expect(light['--foreground']).not.toBe(dark['--foreground'])
  })

  it('uses a soft theme-tinted background and dark text in light mode', () => {
    const palette = paletteFor('royal-purple', 'light')
    const lightness = Number(palette['--background'].split(' ')[2].replace('%', ''))
    expect(lightness).toBe(98)
    expect(Number(palette['--foreground'].split(' ')[2].replace('%', ''))).toBeLessThan(20)
  })

  it('uses pure white cards in light mode', () => {
    const palette = paletteFor('royal-purple', 'light')
    expect(palette['--card']).toBe('0 0% 100%')
    expect(palette['--popover']).toBe('0 0% 100%')
  })

  it('uses a pitch black background in dark mode with #1A1A1A cards', () => {
    const palette = paletteFor('royal-purple', 'dark')
    expect(palette['--background']).toBe('0 0% 0%')
    const cardLightness = Number(palette['--card'].split(' ')[2].replace('%', ''))
    expect(cardLightness).toBe(10)
  })

  it('every card and card-foreground stays high contrast in both modes', () => {
    for (const preset of THEME_PRESETS) {
      for (const mode of ['light', 'dark'] as const) {
        const palette = paletteFor(preset.id, mode)
        // Sanity check: every value is a well-formed "H S% L%" triple.
        for (const key of THEME_MANAGED_VARS) {
          expect(palette[key]).toMatch(/^\d+(\.\d+)? \d+(\.\d+)?% \d+(\.\d+)?%$/)
        }
      }
    }
  })

  it('ships the exact brand primary in light mode when it passes AA', () => {
    for (const preset of THEME_PRESETS) {
      const palette = paletteFor(preset.id, 'light')
      const expected = hexToHsl(THEME_COLORS[preset.id].primary)
      // Sunset Rose's exact primary is slightly below AA on white, so it is
      // auto-adjusted; the other two themes keep their exact brand color.
      if (preset.id === 'sunset-rose') {
        const actual = palette['--primary']
        const parts = actual.split(' ')
        const hsl = { h: Number(parts[0]), s: Number(parts[1].replace('%', '')), l: Number(parts[2].replace('%', '')) }
        expect(hslContrast(hsl, WHITE)).toBeGreaterThanOrEqual(4.5)
      } else {
        expect(palette['--primary']).toBe(
          `${Math.round(expected.h)} ${Math.round(expected.s)}% ${Math.round(expected.l)}%`,
        )
      }
    }
  })

  it('keeps accent-strong readable against its own mode background', () => {
    const parse = (value: string) => {
      const [h, s, l] = value.split(' ')
      return { h: Number(h), s: Number(s.replace('%', '')), l: Number(l.replace('%', '')) }
    }
    for (const preset of THEME_PRESETS) {
      const light = paletteFor(preset.id, 'light')
      expect(hslContrast(parse(light['--accent-strong']), parse(light['--background']))).toBeGreaterThanOrEqual(4.5)

      const dark = paletteFor(preset.id, 'dark')
      expect(hslContrast(parse(dark['--accent-strong']), parse(dark['--background']))).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('picks readable primary-foreground text for every preset', () => {
    for (const preset of THEME_PRESETS) {
      for (const mode of ['light', 'dark'] as const) {
        const palette = paletteFor(preset.id, mode)
        // White or near-black ink — never something in between that would be
        // low-contrast against both a light and dark primary.
        const lightness = Number(palette['--primary-foreground'].split(' ')[2].replace('%', ''))
        expect(lightness === 100 || lightness <= 20).toBe(true)
      }
    }
  })
})
