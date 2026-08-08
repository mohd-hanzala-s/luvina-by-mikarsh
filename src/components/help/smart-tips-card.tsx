'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, X } from 'lucide-react'
import { SMART_TIPS, type SmartTip } from '@/lib/help/content'
import { dismissTip } from '@/lib/db/settings'
import { isBackupStale } from '@/lib/backup/backup'
import { useAppData } from '@/hooks/useAppData'
import { useAppStore } from '@/store/appStore'
import { hapticFeedback } from '@/lib/utils'
import { Button } from '@/components/ui/button'

/**
 * Contextual smart tips for the home screen. Exactly one relevant tip shows
 * at a time (first match wins), and each tip can be dismissed forever. Tips
 * never nag: they only appear when they have something genuinely useful to
 * say given the current state of the app.
 */
export function SmartTipsCard() {
  const router = useRouter()
  const { settings, logs, stats, cycles, today } = useAppData()
  const setRequestProductTour = useAppStore((s) => s.setRequestProductTour)
  const setRequestBackupPrompt = useAppStore((s) => s.setRequestBackupPrompt)

  const dismissed = useMemo(() => new Set(settings?.dismissedTips ?? []), [settings?.dismissedTips])

  const tip = useMemo(() => {
    const hasCycles = cycles.length > 0
    const hasTodayLog = logs.some((log) => log.date === today && (log.flow !== 'none' || log.symptoms.length > 0 || log.mood !== null))
    const hasAnyData = cycles.length > 0 || logs.length > 0

    const candidates: { tip: SmartTip; applicable: boolean }[] = [
      {
        tip: SMART_TIPS.find((t) => t.id === 'try-tour')!,
        applicable: !settings?.productTourSeen,
      },
      {
        tip: SMART_TIPS.find((t) => t.id === 'complete-checkin')!,
        applicable: hasCycles && !hasTodayLog,
      },
      {
        tip: SMART_TIPS.find((t) => t.id === 'backup-reminder')!,
        applicable: hasAnyData && isBackupStale(settings?.lastBackupAt ?? null),
      },
      {
        tip: SMART_TIPS.find((t) => t.id === 'enable-notifications')!,
        applicable: settings?.notificationsEnabled === false,
      },
      {
        tip: SMART_TIPS.find((t) => t.id === 'explore-insights')!,
        applicable: (stats.cyclesLogged ?? 0) >= 2,
      },
    ]

    return candidates.find((c) => c.applicable && !dismissed.has(c.tip.id))?.tip ?? null
  }, [settings, dismissed, logs, stats, cycles, today])

  if (!tip) return null

  const handleAction = () => {
    hapticFeedback(true)
    switch (tip.id) {
      case 'try-tour':
        setRequestProductTour(true)
        break
      case 'backup-reminder':
        setRequestBackupPrompt(true)
        router.push('/settings')
        break
      case 'complete-checkin':
        router.push('/calendar')
        break
      default:
        router.push(tip.action?.href ?? '/settings')
    }
  }

  const handleDismiss = () => {
    hapticFeedback(true)
    void dismissTip(tip.id)
  }

  return (
    <AnimatePresence>
      <motion.div
        key={tip.id}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="flex items-start gap-3 rounded-card border border-accent/40 bg-accent/15 p-4 shadow-soft"
        role="status"
      >
        <span aria-hidden="true" className="text-2xl leading-none">
          {tip.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{tip.title}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{tip.body}</p>
          {tip.action && (
            <Button variant="link" size="sm" className="mt-1 h-auto px-0 text-xs" onClick={handleAction}>
              {tip.action.label}
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Button>
          )}
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss tip"
          className="rounded-xl p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
