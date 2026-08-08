'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'
import { getSwUrl, isAndroidShell } from '@/lib/pwa'

/**
 * Listens for a newly installed service worker and invites the user to
 * reload to apply the fresh bundle. Stays silent while the worker is first
 * installed (no existing controller yet).
 *
 * Skips registration entirely inside the native Android shell — see
 * `isAndroidShell` for why a service worker there breaks navigation instead
 * of helping it — and unregisters any worker a previous build may have left
 * behind so it can't keep intercepting requests.
 */
export function usePwaUpdater() {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return

    if (isAndroidShell()) {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => regs.forEach((reg) => void reg.unregister()))
        .catch(() => undefined)
      return
    }

    const swUrl = getSwUrl()
    navigator.serviceWorker.register(swUrl).catch(() => undefined)

    let shown = false
    const onControllerChange = () => {
      if (shown) return
      shown = true
      toast('A new version of Luvina is available.', {
        description: 'Reload to apply the update.',
        action: {
          label: 'Reload',
          onClick: () => window.location.reload(),
        },
        duration: 10_000,
      })
    }

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)
    return () =>
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
  }, [])
}
