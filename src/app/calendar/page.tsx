'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppData } from '@/hooks/useAppData'
import { MonthCalendar } from '@/components/calendar/month-calendar'
import { DayDetailSheet } from '@/components/calendar/day-detail-sheet'
import { HelpButton } from '@/components/help/contextual-help'
import { Button } from '@/components/ui/button'

export default function CalendarPage() {
  const { classify, logs, loaded, today } = useAppData()
  // `month` is resolved after mount: a static export is prerendered at build
  // time, so initializing from `new Date()` would mismatch the server HTML.
  const [month, setMonth] = useState<Date | null>(null)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    setMonth(new Date())
  }, [])

  const symptomDates = new Set(logs.filter((log) => log.symptoms.length > 0).map((log) => log.date))
  const noteDates = new Set(logs.filter((log) => log.note).map((log) => log.date))

  const navigate = useCallback((dir: 1 | -1) => {
    setDirection(dir)
    setMonth((prev) => {
      if (!prev) return prev
      const next = new Date(prev)
      next.setMonth(next.getMonth() + dir)
      return next
    })
  }, [])

  const navigateRef = useRef(navigate)
  useEffect(() => {
    navigateRef.current = navigate
  }, [navigate])

  const goToToday = () => {
    const now = new Date()
    setDirection(month && today > format(month, 'yyyy-MM-dd') ? -1 : 1)
    setMonth(now)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') navigateRef.current(-1)
      if (e.key === 'ArrowRight') navigateRef.current(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Calendar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tap a day to log, or swipe to browse months.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <HelpButton screen="calendar" label="Help about the calendar" />
        </div>
      </header>

      <section
        aria-label="Month calendar"
        data-tour="month-grid"
        className="rounded-card border border-border/60 bg-card p-4 shadow-soft sm:p-5"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold capitalize" aria-live="polite">
            {month ? format(month, 'MMMM yyyy') : '\u00A0'}
          </h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="iconSm"
              aria-label="Previous month"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="ghost"
              size="iconSm"
              aria-label="Next month"
              onClick={() => navigate(1)}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>

        {loaded && month ? (
          <MonthCalendar
            month={month}
            selectedDate={selectedDate}
            classify={classify}
            hasSymptoms={(date) => symptomDates.has(date)}
            hasNote={(date) => noteDates.has(date)}
            direction={direction}
            onNavigate={navigate}
            onDaySelect={(date) => setSelectedDate(date)}
            onDayLongPress={(date) => setSelectedDate(date)}
          />
        ) : (
          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="flex justify-center py-0.5">
                <div className="aspect-square w-full max-w-[52px] animate-pulse rounded-full bg-muted" />
              </div>
            ))}
          </div>
        )}
      </section>

      <section
        aria-label="Calendar legend"
        data-tour="calendar-legend"
        className="rounded-card border border-border/60 bg-card p-4 shadow-soft"
      >
        <h2 className="mb-3 font-display text-sm font-semibold tracking-tight">Legend</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs text-muted-foreground sm:flex sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2">
          <LegendDot color="hsl(var(--period))" label="Period" />
          <LegendDot color="hsl(var(--predicted))" label="Predicted period" />
          <LegendDot color="hsl(var(--ovulation))" label="Ovulation" />
          <LegendDot color="hsl(var(--fertile))" label="Fertile window" />
          <LegendDot color="hsl(var(--muted-foreground))" label="Logged symptoms" />
          <LegendBar label="Notes" />
          <LegendToday label="Today" />
          <LegendSelected label="Selected day" />
        </div>
      </section>

      <DayDetailSheet date={selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)} />
    </div>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="size-2.5 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
      {label}
    </span>
  )
}

function LegendBar({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-[2px] w-3 rounded-full bg-muted-foreground/70" aria-hidden="true" />
      {label}
    </span>
  )
}

function LegendToday({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="size-2.5 rounded-full ring-1 ring-ring"
        aria-hidden="true"
      />
      {label}
    </span>
  )
}

function LegendSelected({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="size-2.5 rounded-full bg-background ring-2 ring-ring ring-offset-2 ring-offset-background"
        aria-hidden="true"
      />
      {label}
    </span>
  )
}
