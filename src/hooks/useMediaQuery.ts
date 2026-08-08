'use client'

import { useEffect, useState } from 'react'

/**
 * Hydration-safe media query hook. Always reports `false` during the initial
 * render (matching the server snapshot for a static export) and only reports
 * the real value after the component mounts, so layout that depends on a
 * media query never causes a client/server mismatch.
 */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = () => setMatches(media.matches)
    setMatches(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/**
 * Desktop breakpoint. Deliberately 1024px (not the usual 768px) so tablets
 * in portrait — the bulk of real usage — keep the thumb-friendly bottom nav
 * and single-column flow instead of jumping into a mouse-oriented sidebar
 * layout. Only genuine desktop and landscape-tablet widths get the sidebar.
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)')
}

export { useMediaQuery }
