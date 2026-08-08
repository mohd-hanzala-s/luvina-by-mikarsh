'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { exportBackup } from '@/lib/backup/service'
import { setLastDriveBackupAt } from '@/lib/db/settings'
import { requestDriveToken, shouldAutoBackup, uploadBackupToDrive } from '@/lib/drive/drive'
import type { Settings } from '@/types'

/**
 * Automatic Drive backup: once per session, when the app opens with a
 * connected account, a remembered passphrase and a stale last upload, a fresh
 * encrypted backup is silently uploaded. Silent auth failures (expired Google
 * session) are ignored — the next open retries.
 */
export function useDriveAutoBackup(settings: Settings | null) {
  const ranRef = useRef(false)

  useEffect(() => {
    if (!settings || ranRef.current) return
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return
    if (typeof navigator.onLine === 'boolean' && !navigator.onLine) return
    if (!shouldAutoBackup(settings)) return

    ranRef.current = true
    let cancelled = false

    const run = async () => {
      try {
        const token = await requestDriveToken({ silent: true })
        if (cancelled) return
        const payload = await exportBackup(settings.drivePassphrase as string)
        const fileName = `luvina-drive-${new Date().toISOString().slice(0, 10)}.json`
        await uploadBackupToDrive(token, payload, fileName)
        await setLastDriveBackupAt(Date.now())
        if (!cancelled) toast.success('Google Drive backup updated')
      } catch {
        // Expected when the Google session expired or the device is offline.
        // No toast — this must never nag.
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [settings])
}
