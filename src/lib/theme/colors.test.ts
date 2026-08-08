import { describe, expect, it } from 'vitest'
import {
  clamp,
  contrastRatio,
  darkInk,
  hslContrast,
  hslString,
  hslToRgb,
  normalizeHue,
  pickForeground,
  relativeLuminance,
  WCAG_AA_CONTRAST,
  WHITE,
} from '@/lib/theme/colors'

describe('normalizeHue', () => {
  it('wraps positive overflow', () => {
    expect(normalizeHue(400)).toBe(40)
  })
  it('wraps negative values', () => {
    expect(normalizeHue(-85)).toBe(275)
  })
  it('leaves in-range hues alone', () => {
    expect(normalizeHue(180)).toBe(180)
  })
})

describe('clamp', () => {
  it('clamps below the minimum', () => {
    expect(clamp(-10, 0, 100)).toBe(0)
  })
  it('clamps above the maximum', () => {
    expect(clamp(150, 0, 100)).toBe(100)
  })
  it('passes through in-range values', () => {
    expect(clamp(50, 0, 100)).toBe(50)
  })
})

describe('hslString', () => {
  it('formats and rounds an HSL triple', () => {
    expect(hslString({ h: 345.4, s: 84.2, l: 58.9 })).toBe('345 84% 59%')
  })
  it('normalizes an out-of-range hue', () => {
    expect(hslString({ h: -85, s: 50, l: 50 })).toBe('275 50% 50%')
  })
})

describe('hslToRgb', () => {
  it('converts pure white', () => {
    expect(hslToRgb({ h: 0, s: 0, l: 100 })).toEqual([255, 255, 255])
  })
  it('converts pure black', () => {
    expect(hslToRgb({ h: 0, s: 0, l: 0 })).toEqual([0, 0, 0])
  })
  it('converts a fully saturated red', () => {
    expect(hslToRgb({ h: 0, s: 100, l: 50 })).toEqual([255, 0, 0])
  })
})

describe('relativeLuminance + contrastRatio', () => {
  it('gives white the maximum luminance', () => {
    expect(relativeLuminance([255, 255, 255])).toBeCloseTo(1, 5)
  })
  it('gives black the minimum luminance', () => {
    expect(relativeLuminance([0, 0, 0])).toBeCloseTo(0, 5)
  })
  it('computes a 21:1 ratio between pure black and pure white', () => {
    const ratio = contrastRatio(relativeLuminance([255, 255, 255]), relativeLuminance([0, 0, 0]))
    expect(ratio).toBeCloseTo(21, 0)
  })
})

describe('pickForeground', () => {
  it('picks white text on a dark, saturated background', () => {
    const bg = { h: 345, s: 84, l: 30 }
    expect(pickForeground(bg, 260)).toEqual(WHITE)
  })

  it('picks dark ink on a very light pastel background', () => {
    const bg = { h: 345, s: 55, l: 88 }
    const result = pickForeground(bg, 260)
    expect(result).toEqual(darkInk(260))
  })

  it('always returns a choice that meets or gets closest to AA contrast', () => {
    for (const l of [10, 30, 50, 70, 90]) {
      const bg = { h: 200, s: 60, l }
      const choice = pickForeground(bg, 200 + 275)
      expect(hslContrast(bg, choice)).toBeGreaterThan(0)
    }
  })

  it('meets AA contrast for a vivid primary', () => {
    const bg = { h: 345, s: 84, l: 55 }
    const choice = pickForeground(bg, 345 + 275)
    expect(hslContrast(bg, choice)).toBeGreaterThanOrEqual(WCAG_AA_CONTRAST - 0.1)
  })
})
