'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { eachDayOfInterval, format, startOfMonth, startOfWeek } from 'date-fns'
import { ChevronRight } from 'lucide-react'
import { DAY_KIND_COLORS } from '@/constants'
import { cn, todayISO } from '@/lib/utils'
import type { DayKind } from '@/types'

interface MiniCalendarProps {
  classify: (date: string) => DayKind
  onNavigateToMonth?: (date: string) => void
}

/**
 * A compact single-month preview of the calendar for the Home screen.
 * Shows the current month with the same color coding as the full calendar.
 */
export function MiniCalendar({ classify }: MiniCalendarProps) {
  const today = todayISO()
  const { days, monthLabel } = useMemo(() => {
    const start = new Date()
    const gridStart = startOfWeek(startOfMonth(start), { weekStartsOn: 0 })
    const days = eachDayOfInterval({
      start: gridStart,
      end: new Date(start.getFullYear(), start.getMonth() + 1, 0),
    })
    return { days, monthLabel: format(start, 'MMMM') }
  }, [])

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold">{monthLabel}</h2>
        <Link
          href="/calendar"
          className="inline-flex items-center gap-0.5 text-sm font-medium text-primary hover:underline"
        >
          Full calendar
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="grid grid-cols-7 gap-y-1" aria-label={`Calendar preview for ${monthLabel}`}>
        {days.map((day) => {
          const iso = format(day, 'yyyy-MM-dd')
          const kind = classify(iso)
          const filled = kind === 'period' || kind === 'ovulation'
          const ringed = kind === 'predicted'
          const style = DAY_KIND_COLORS[kind]
          const isToday = iso === today
          return (
            <div key={iso} className="flex justify-center">
              <span
                role="button"
                tabIndex={0}
                aria-label={`${format(day, 'EEEE, MMMM do')}${kind === 'period' ? ', period day' : kind === 'ovulation' ? ', ovulation day' : kind === 'predicted' ? ', predicted period' : ''}`}
                className={cn(
                  'flex size-8 items-center justify-center rounded-full text-[11px] font-medium tabular-nums',
                  kind === 'past' || kind === 'neutral' ? 'text-muted-foreground' : 'text-foreground',
                  isToday && 'ring-1 ring-ring',
                )}
                style={
                  filled
                    ? { backgroundColor: style.bg }
                    : ringed
                      ? { backgroundColor: style.bg, boxShadow: `inset 0 0 0 1.5px ${style.ring}` }
                      : kind === 'fertile'
                        ? { backgroundColor: style.bg }
                        : undefined
                }
              >
                {day.getDate()}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
