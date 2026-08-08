'use client'

import { useState } from 'react'
import { useEffect } from 'react'
import { format } from 'date-fns'
import { Sparkles, CalendarDays, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { useAppData } from '@/hooks/useAppData'
import { CycleHero } from '@/components/home/cycle-hero'
import { BackupNudgeBanner } from '@/components/home/backup-nudge-banner'
import { DayDetailSheet } from '@/components/calendar/day-detail-sheet'
import { SmartTipsCard } from '@/components/help/smart-tips-card'
import { HelpButton } from '@/components/help/contextual-help'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Logo } from '@/components/layout/logo'
import { CompanionAvatar } from '@/components/ui/companion-avatar'
import { seedSampleData } from '@/lib/db/seed'
import { getGreeting, greetingWithName, hapticFeedback } from '@/lib/utils'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db/db'
import { CompanionCard } from '@/components/help/companion-card'
import { AuraDashboardCard } from '@/components/aura/aura-dashboard-card'

export default function HomePage() {
  const { cycleState, cycles, loaded, today, settings } =
    useAppData()
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const haptics = useLiveQuery(() => db.settings.get(1), [])?.hapticsEnabled ?? true

  // The current time is only known on the client. A static export is
  // prerendered once, so rendering `new Date()` directly would mismatch the
  // server HTML and fail hydration. Resolve it after mount instead.
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    if (typeof window !== 'undefined' && window.location.search.includes('checkin=1')) {
      setQuickAddOpen(true)
    }
  }, [])

  const hasCycles = cycles.length > 0
  // Fixed fallback hour keeps the prerendered/server markup deterministic;
  // the real greeting resolves once `now` is set on the client after mount.
  const hour = now?.getHours() ?? 12
  const greeting = greetingWithName(getGreeting(hour), settings?.name)

  const handleStartToday = async () => {
    hapticFeedback(haptics)
    setQuickAddOpen(true)
  }

  const handleLoadSample = async () => {
    await seedSampleData()
    hapticFeedback(haptics)
    toast.success('Sample data loaded')
  }

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground min-h-[1.25rem]">
            {now ? format(now, 'EEEE, MMMM d') : '\u00A0'}
          </p>
          <h1 className="mt-0.5 font-display text-2xl font-semibold tracking-tight">{greeting}</h1>
        </div>
        <HelpButton screen="home" label="Help about your dashboard" />
      </header>

      {loaded ? (
        hasCycles ? (
          <>
            <BackupNudgeBanner lastBackupAt={settings?.lastBackupAt ?? null} now={now} />

            <QuickCheckInCard onTap={handleStartToday} />

            <div data-tour="cycle-hero">
              <CycleHero state={cycleState} />
            </div>

            <CompanionCard compact />

            <AuraDashboardCard />

            <SmartTipsCard />
          </>
        ) : (
          <section
            aria-label="Getting started"
            data-tour="checkin-card"
            className="relative overflow-hidden rounded-card border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-6 shadow-soft sm:p-8"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-primary/10 blur-3xl"
            />
            <div className="relative max-w-lg space-y-5">
              <Logo className="size-12" />
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-semibold tracking-tight">
                  Welcome to Luvina
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  A private, offline-first companion for your cycle. Log your period and Luvina
                  will handle predictions, ovulation estimates and insights — all stored on this
                  device only. No account needed.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleStartToday}>
                  <CalendarDays aria-hidden="true" />
                  Log today
                </Button>
                <Button variant="outline" onClick={handleLoadSample}>
                  <Sparkles aria-hidden="true" />
                  Load sample data
                </Button>
              </div>
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
                No account, no tracking, no uploads.
              </p>
            </div>
          </section>
        )
      ) : (
        <HomeSkeleton />
      )}

      <DayDetailSheet date={quickAddOpen ? today : null} onOpenChange={setQuickAddOpen} />
    </div>
  )
}

function QuickCheckInCard({ onTap }: { onTap: () => void }) {
  return (
    <section aria-label="Quick check-in" className="cv-auto" data-tour="checkin-card">
      <button
        type="button"
        onClick={onTap}
        className="group relative flex w-full items-center gap-4 overflow-hidden rounded-card border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/15 p-5 text-left shadow-soft transition-all hover:shadow-lifted active:scale-[0.99]"
      >
        <CompanionAvatar className="size-14 ring-2 ring-primary/20 shrink-0" />
        <span className="min-w-0">
          <span className="block font-display text-base font-semibold">How are you today?</span>
          <span className="mt-0.5 block text-sm text-muted-foreground">
            Tap for your daily check-in with Luvi
          </span>
        </span>
        <span
          aria-hidden="true"
          className="ml-auto shrink-0 whitespace-nowrap rounded-full bg-[#F43F5E] px-5 py-2.5 text-center text-sm font-semibold text-white shadow-soft transition-all hover:bg-[#E11D48] active:scale-95"
        >
          Check in
        </span>
      </button>
    </section>
  )
}

function HomeSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-64 w-full" />
      <div className="grid gap-5 md:grid-cols-2">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    </div>
  )
}
