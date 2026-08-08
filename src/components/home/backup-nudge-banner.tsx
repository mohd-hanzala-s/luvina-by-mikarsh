'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldAlert, X } from 'lucide-react'
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
 * recent encrypted backup. Auto-fades out smoothly after 12 seconds to move content up.
 */
export function BackupNudgeBanner({ lastBackupAt, now }: BackupNudgeBannerProps) {
  const setRequestBackupPrompt = useAppStore((state) => state.setRequestBackupPrompt)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
    }, 12000)
    return () => clearTimeout(timer)
  }, [])

  const shouldShow = Boolean(now && isBackupStale(lastBackupAt, now) && visible)

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, height: 0, scale: 0.96 }}
          animate={{ opacity: 1, height: 'auto', scale: 1 }}
          exit={{ opacity: 0, height: 0, scale: 0.95, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <div className="flex items-center gap-3 rounded-card border border-warning/30 bg-warning/10 p-4 shadow-soft">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-input bg-warning/15 text-warning">
              <ShieldAlert className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">
                {lastBackupAt ? "You haven't backed up in a while" : "You haven't backed up yet"}
              </p>
              <p className="text-xs text-muted-foreground">
                Your data lives only on this device — back it up to prevent data loss.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/settings"
                onClick={() => setRequestBackupPrompt(true)}
                className="shrink-0 text-xs font-semibold text-primary hover:underline"
              >
                Back up now
              </Link>
              <button
                type="button"
                onClick={() => setVisible(false)}
                className="text-muted-foreground hover:text-foreground p-1"
                aria-label="Dismiss banner"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
