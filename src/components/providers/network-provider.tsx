'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store/appStore'

/**
 * Tracks browser connectivity and surfaces the status in the store so the
 * UI can show a subtle offline indicator when the network drops.
 */
export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const setOnline = useAppStore((s) => s.setOnline)

  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    update()
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [setOnline])

  return <>{children}</>
}
