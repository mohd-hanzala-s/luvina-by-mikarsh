'use client'

import { ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import { isBackupStale } from '@/lib/backup/backup'
import { useAppStore } from '@/store/appStore'

interface BackupNudgeBannerProps {
  lastBackupAt: number | null
  /** Resolved client-side `Date`; `null` until after mount (see HomePage). */
  now: Date | null
}

/**
 * Home-screen nudge shown when the user has real data on this device but no
 * recent encrypted backup. Tapping it hands off to the Backup section's
 * create-backup dialog via the shared UI store.
 */
export function BackupNudgeBanner({ lastBackupAt, now }: BackupNudgeBannerProps) {
  const setRequestBackupPrompt = useAppStore((state) => state.setRequestBackupPrompt)

  if (!now || !isBackupStale(lastBackupAt, now)) return null

  return (
    <div className="flex items-center gap-3 rounded-card border border-warning/30 bg-warning/10 p-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-input bg-warning/15 text-warning">
        <ShieldAlert className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">
          {lastBackupAt ? "You haven't backed up in a while" : "You haven't backed up yet"}
        </p>
        <p className="text-xs text-muted-foreground">
          Your data only lives on this device — back it up before switching devices or browsers.
        </p>
      </div>
      <Link
        href="/settings"
        onClick={() => setRequestBackupPrompt(true)}
        className="shrink-0 text-sm font-medium text-primary hover:underline"
      >
        Back up now
      </Link>
    </div>
  )
}
