'use client'

import { useEffect, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db/db'
import { applyPalette, generatePalette } from '@/lib/theme/palette'

/**
 * Applies the persisted appearance mode (light/dark/system) *and* the
 * personalization theme (Royal Purple / Sunset Rose / Ocean Teal / custom) to
 * the document root.
 *
 * Two concerns are split into two effects on purpose: the light/dark class
 * only needs to change when the *effective* mode changes, while the palette
 * only needs to regenerate when the theme's color inputs change. Combining
 * them (or reading the whole settings row as a dependency) would recompute
 * and reapply on every unrelated settings write — e.g. changing cycle length
 * would otherwise thrash the CSS variables for no reason.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const row = useLiveQuery(() => db.settings.get(1), [])
  const preference = row?.theme ?? 'system'

  // Only the fields that actually feed the palette — see the note above.
  const themeId = row?.themeId
  const customPrimaryHue = row?.customPrimaryHue
  const customPrimarySaturation = row?.customPrimarySaturation
  const customAccentHue = row?.customAccentHue
  const customAccentSaturation = row?.customAccentSaturation
  const hueShift = row?.hueShift

  // Light/dark class + color-scheme.
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const effective = preference === 'system' ? (media.matches ? 'dark' : 'light') : preference
      document.documentElement.classList.toggle('dark', effective === 'dark')
      document.documentElement.style.colorScheme = effective
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [preference])

  // Palette (personalization). Re-applies whenever the resolved color
  // inputs change, or the effective light/dark mode flips.
  const transitionTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const effective = preference === 'system' ? (media.matches ? 'dark' : 'light') : preference
      const root = document.documentElement
      root.classList.add('theme-transitioning')
      applyPalette(
        generatePalette({
          themeId,
          primaryHue: customPrimaryHue,
          primarySaturation: customPrimarySaturation,
          accentHue: customAccentHue,
          accentSaturation: customAccentSaturation,
          hueShift,
          mode: effective,
        }),
      )
      clearTimeout(transitionTimeout.current)
      transitionTimeout.current = setTimeout(() => root.classList.remove('theme-transitioning'), 320)
    }
    apply()
    media.addEventListener('change', apply)
    return () => {
      media.removeEventListener('change', apply)
      clearTimeout(transitionTimeout.current)
    }
  }, [
    themeId,
    customPrimaryHue,
    customPrimarySaturation,
    customAccentHue,
    customAccentSaturation,
    hueShift,
    preference,
  ])

  return <>{children}</>
}
