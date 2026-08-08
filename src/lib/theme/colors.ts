/**
 * Color math for the personalization theme engine.
 *
 * Everything here works in HSL because that's what the design system's CSS
 * variables already use (`--primary: 345 84% 58%` etc, wrapped in `hsl()` by
 * Tailwind). Keeping the math in the same space means we never lose
 * precision round-tripping between formats.
 */

export interface HSL {
  h: number
  s: number
  l: number
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Wrap a hue into the [0, 360) range, handling negative offsets. */
export function normalizeHue(hue: number): number {
  const wrapped = hue % 360
  return wrapped < 0 ? wrapped + 360 : wrapped
}

/** Format an HSL triple as the space-separated string Tailwind's `hsl()` wrapper expects. */
export function hslString({ h, s, l }: HSL): string {
  return `${Math.round(normalizeHue(h))} ${Math.round(clamp(s, 0, 100))}% ${Math.round(clamp(l, 0, 100))}%`
}

/** Convert a `#RRGGBB` hex color to HSL. */
export function hexToHsl(hex: string): HSL {
  const normalized = hex.replace('#', '')
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized
  const r = parseInt(full.slice(0, 2), 16) / 255
  const g = parseInt(full.slice(2, 4), 16) / 255
  const b = parseInt(full.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  let h = 0
  if (delta !== 0) {
    if (max === r) h = 60 * (((g - b) / delta) % 6)
    else if (max === g) h = 60 * ((b - r) / delta + 2)
    else h = 60 * ((r - g) / delta + 4)
  }
  const l = (max + min) / 2
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))

  return { h: normalizeHue(h), s: s * 100, l: l * 100 }
}

export function hslToRgb({ h, s, l }: HSL): [number, number, number] {
  const hue = normalizeHue(h)
  const sat = clamp(s, 0, 100) / 100
  const light = clamp(l, 0, 100) / 100

  const c = (1 - Math.abs(2 * light - 1)) * sat
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
  const m = light - c / 2

  let r = 0
  let g = 0
  let b = 0
  if (hue < 60) [r, g, b] = [c, x, 0]
  else if (hue < 120) [r, g, b] = [x, c, 0]
  else if (hue < 180) [r, g, b] = [0, c, x]
  else if (hue < 240) [r, g, b] = [0, x, c]
  else if (hue < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]

  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)]
}

/** WCAG relative luminance of an sRGB color. */
export function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (value: number) => {
    const c = value / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  const [rl, gl, bl] = [channel(r), channel(g), channel(b)]
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl
}

/** WCAG contrast ratio between two relative luminance values (always >= 1). */
export function contrastRatio(luminanceA: number, luminanceB: number): number {
  const lighter = Math.max(luminanceA, luminanceB)
  const darker = Math.min(luminanceA, luminanceB)
  return (lighter + 0.05) / (darker + 0.05)
}

/** WCAG contrast ratio between two HSL colors. */
export function hslContrast(a: HSL, b: HSL): number {
  return contrastRatio(relativeLuminance(hslToRgb(a)), relativeLuminance(hslToRgb(b)))
}

/** Minimum contrast ratio for WCAG AA on normal-sized text. */
export const WCAG_AA_CONTRAST = 4.5

export const WHITE: HSL = { h: 0, s: 0, l: 100 }

/** A near-black "ink" color tinted toward a hue, used as the dark-text alternative to white. */
export function darkInk(hue: number): HSL {
  return { h: normalizeHue(hue), s: 22, l: 8 }
}

/**
 * Choose whichever of white or a hue-tinted dark ink gives at least AA
 * contrast (4.5:1) against `background`. If neither reaches AA (only
 * possible for background lightness values in the narrow mid-gray band),
 * falls back to whichever wins by the larger margin so text stays as
 * readable as possible.
 */
export function pickForeground(background: HSL, inkHue: number): HSL {
  const dark = darkInk(inkHue)
  const whiteContrast = hslContrast(background, WHITE)
  const darkContrast = hslContrast(background, dark)

  if (whiteContrast >= WCAG_AA_CONTRAST) return WHITE
  if (darkContrast >= WCAG_AA_CONTRAST) return dark
  return whiteContrast >= darkContrast ? WHITE : dark
}

/**
 * Nudge a color's lightness (keeping its hue/saturation) just far enough that
 * it reaches WCAG AA (4.5:1) against one of the given target colors. Used for
 * the primary color so buttons and text accents always clear the threshold —
 * brand colors that already pass are returned unchanged. If no lightness
 * value in range passes, the original is returned (the closest-possible
 * choice). Passing a single target (e.g. white for light-mode text accents)
 * nudges specifically for that target.
 */
export function ensureAaColor(color: HSL, inkHue: number, targets?: HSL[]): HSL {
  const candidates = targets?.length ? targets : [WHITE, darkInk(inkHue)]
  const reachesAa = (candidate: HSL, variant: HSL) =>
    hslContrast(variant, candidate) >= WCAG_AA_CONTRAST

  if (candidates.some((c) => reachesAa(c, color))) return color

  for (let step = 1; step <= 45; step++) {
    for (const direction of [1, -1]) {
      const variant: HSL = { ...color, l: clamp(color.l + direction * step, 4, 96) }
      if (candidates.some((c) => reachesAa(c, variant))) return variant
    }
  }

  return color
}
