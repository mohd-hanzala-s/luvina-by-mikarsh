'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { CalendarDays, ChevronLeft, ChevronRight, FileText, Image as ImageIcon, Bell, Plus, Trash2, LayoutGrid } from 'lucide-react'
import { useAppData } from '@/hooks/useAppData'
import { MonthCalendar } from '@/components/calendar/month-calendar'
import { DayDetailSheet } from '@/components/calendar/day-detail-sheet'
import { UpcomingReminderCard } from '@/components/home/upcoming-reminder-card'
import { HelpButton } from '@/components/help/contextual-help'
import { Button } from '@/components/ui/button'
import { getNextUpcomingReminder } from '@/lib/reminders/upcoming'
import { MOODS, FLOW_LEVELS, SYMPTOMS } from '@/constants'
import { hapticFeedback } from '@/lib/utils'
import { deleteReminder, updateReminder } from '@/lib/db/reminders'
import type { DayLog } from '@/types'
import { db } from '@/lib/db/db'
import { useLiveQuery } from 'dexie-react-hooks'

export default function CalendarPage() {
  const { classify, logs, reminders, prediction, loaded, today } = useAppData()

  const [viewFilter, setViewFilter] = useState<'calendar' | 'notes' | 'reminders'>('calendar')
  const [month, setMonth] = useState<Date | null>(null)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const haptics = useLiveQuery(() => db.settings.get(1), [])?.hapticsEnabled ?? true

  useEffect(() => {
    setMonth(new Date())
  }, [])

  const upcoming = useMemo(
    () => getNextUpcomingReminder(reminders, prediction?.predictedNextStart ?? null, today),
    [reminders, prediction, today],
  )

  const symptomDates = new Set(logs.filter((log) => log.symptoms.length > 0).map((log) => log.date))
  const noteDates = new Set(logs.filter((log) => log.note || (log.images && log.images.length > 0)).map((log) => log.date))

  // Sort logs by date descending for the Date-Wise Notes timeline
  const sortedLogs = useMemo(() => {
    return [...logs]
      .filter((log) => log.note || log.flow !== 'none' || log.symptoms.length > 0 || (log.images && log.images.length > 0))
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  }, [logs])

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

  const showCalendar = viewFilter === 'calendar'
  const showNotes = viewFilter === 'notes'
  const showReminders = viewFilter === 'reminders'

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="space-y-4 text-center sm:text-left">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">Calendar, Notes &amp; Reminders</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your period calendar, date-wise journal notes, and cycle reminders all on one unified screen.
            </p>
          </div>
          <HelpButton screen="calendar" label="Help about calendar, notes and reminders" />
        </div>

        {/* Centered Segmented View Toggle Bar */}
        <div className="mx-auto flex max-w-sm items-center justify-center gap-1 rounded-full border border-border/80 bg-muted p-1 shadow-soft">
          <button
            type="button"
            onClick={() => {
              hapticFeedback(haptics)
              setViewFilter('calendar')
            }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              viewFilter === 'calendar'
                ? 'bg-card text-foreground shadow-soft'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CalendarDays className="size-3.5 text-primary" />
            Calendar
          </button>

          <button
            type="button"
            onClick={() => {
              hapticFeedback(haptics)
              setViewFilter('notes')
            }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              viewFilter === 'notes'
                ? 'bg-card text-foreground shadow-soft'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="size-3.5 text-primary" />
            Notes
          </button>

          <button
            type="button"
            onClick={() => {
              hapticFeedback(haptics)
              setViewFilter('reminders')
            }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              viewFilter === 'reminders'
                ? 'bg-card text-foreground shadow-soft'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Bell className="size-3.5 text-primary" />
            Reminders
          </button>
        </div>
      </header>

      {/* SECTION 1: CALENDAR MONTH GRID */}
      {showCalendar && (
        <div className="space-y-4">
          <section
            aria-label="Month calendar"
            data-tour="month-grid"
            className="rounded-card border border-border/60 bg-card p-4 shadow-soft sm:p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base font-semibold capitalize" aria-live="polite">
                  {month ? format(month, 'MMMM yyyy') : '\u00A0'}
                </h2>
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Today
                </Button>
              </div>

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

          {/* Calendar Legend */}
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
              <LegendBar label="Notes / Photos" />
              <LegendToday label="Today" />
              <LegendSelected label="Selected day" />
            </div>
          </section>
        </div>
      )}

      {/* SECTION 2: DATE-WISE NOTES & JOURNAL LOG TIMELINE */}
      {showNotes && (
        <section aria-label="Date-wise notes" className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold">
              <FileText className="size-4 text-primary" />
              Date-Wise Journal Notes &amp; Attachments
            </h2>
            <Button size="sm" onClick={() => setSelectedDate(today)}>
              <Plus className="size-4" />
              Add Note
            </Button>
          </div>

          {sortedLogs.length > 0 ? (
            <div className="space-y-3">
              {sortedLogs.map((log) => (
                <DateLogCard
                  key={log.date}
                  log={log}
                  onSelect={() => setSelectedDate(log.date)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-card border border-dashed p-8 text-center text-muted-foreground">
              <FileText className="mx-auto size-8 opacity-50" />
              <p className="mt-2 text-sm font-medium">No journal notes logged yet.</p>
              <p className="mt-1 text-xs">Tap a date to add notes, symptoms, or photo documentation.</p>
              <Button size="sm" className="mt-4" onClick={() => setSelectedDate(today)}>
                Log Note Today
              </Button>
            </div>
          )}
        </section>
      )}

      {/* SECTION 3: REMINDERS & ALERTS */}
      {showReminders && (
        <section aria-label="Reminders" className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold">
              <Bell className="size-4 text-primary" />
              Reminders &amp; Alerts
            </h2>
          </div>

          <UpcomingReminderCard reminder={upcoming} />

          {reminders.length > 0 && (
            <div className="rounded-card border border-border/60 bg-card p-4 shadow-soft space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Reminders</p>
              <div className="divide-y divide-border/40">
                {reminders.map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateReminder(r.id, { enabled: !r.enabled })}
                        className={`size-4 rounded border transition-colors ${
                          r.enabled ? 'bg-primary border-primary text-primary-foreground' : 'border-border'
                        }`}
                      >
                        {r.enabled && '✓'}
                      </button>
                      <span className={r.enabled ? 'font-medium' : 'text-muted-foreground line-through'}>
                        {r.title} ({r.time})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteReminder(r.id)}
                      className="text-muted-foreground hover:text-destructive p-1"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <DayDetailSheet date={selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)} />
    </div>
  )
}

function DateLogCard({ log, onSelect }: { log: DayLog; onSelect: () => void }) {
  const flowObj = FLOW_LEVELS.find((f) => f.value === log.flow)
  const moodObj = MOODS.find((m) => m.value === log.mood)

  return (
    <div
      onClick={onSelect}
      className="group relative cursor-pointer overflow-hidden rounded-card border border-border/70 bg-card p-4 shadow-soft transition-all hover:border-primary/40 hover:shadow-lifted"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-sm font-semibold text-foreground">
            {format(parseISO(log.date), 'EEEE, MMMM d, yyyy')}
          </h3>

          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
            {log.flow !== 'none' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 font-semibold text-primary">
                {flowObj?.label}
              </span>
            )}

            {log.mood && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2.5 py-0.5 font-semibold text-accent-foreground">
                {moodObj?.label}
              </span>
            )}

            {log.symptoms.map((sym) => {
              const match = SYMPTOMS.find((s) => s.value === sym)
              return (
                <span key={sym} className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                  {match?.label ?? sym}
                </span>
              )
            })}
          </div>
        </div>

        {log.images && log.images.length > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
            <ImageIcon className="size-3.5" />
            {log.images.length}
          </span>
        )}
      </div>

      {log.note && (
        <p className="mt-2.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          &ldquo;{log.note}&rdquo;
        </p>
      )}

      {log.images && log.images.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {log.images.map((imgUrl, idx) => (
            <img
              key={idx}
              src={imgUrl}
              alt="Attached photo documentation"
              className="size-14 shrink-0 rounded-xl object-cover border border-border"
            />
          ))}
        </div>
      )}
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
      <span className="size-2.5 rounded-full ring-1 ring-ring" aria-hidden="true" />
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
