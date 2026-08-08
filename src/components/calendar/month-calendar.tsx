'use client'

import { memo, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { eachDayOfInterval, endOfMonth, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from 'date-fns'
import { DAY_KIND_COLORS } from '@/constants'
import { cn } from '@/lib/utils'
import type { DayKind } from '@/types'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface MonthCalendarProps {
  month: Date
  selectedDate: string | null
  classify: (date: string) => DayKind
  hasSymptoms: (date: string) => boolean
  hasNote: (date: string) => boolean
  direction: 1 | -1
  onNavigate: (direction: 1 | -1) => void
  onDaySelect: (date: string) => void
  onDayLongPress: (date: string) => void
}

/**
 * The centerpiece calendar. Renders a swipeable month grid with color-coded
 * days. Swipe or use the header arrows to change months; tap to select and
 * long-press to open quick actions.
 */
export function MonthCalendar({
  month,
  selectedDate,
  classify,
  hasSymptoms,
  hasNote,
  direction,
  onNavigate,
  onDaySelect,
  onDayLongPress,
}: MonthCalendarProps) {
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressFired = useRef(false)

  const monthStart = startOfMonth(month)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const gridEnd = endOfMonth(month)
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })
  const monthKey = format(month, 'yyyy-MM')

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStart.current = { x: touch.clientX, y: touch.clientY }
    const cell = (e.target as HTMLElement).closest<HTMLElement>('[data-date]')
    const date = cell?.dataset.date
    longPressFired.current = false
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true
      if (touchStart.current && date) {
        onDayLongPress(date)
      }
    }, 500)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
    const start = touchStart.current
    if (!start || longPressFired.current) {
      touchStart.current = null
      return
    }
    const touch = e.changedTouches[0]
    const dx = touch.clientX - start.x
    const dy = touch.clientY - start.y
    if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      onNavigate(dx < 0 ? 1 : -1)
    }
    touchStart.current = null
  }

  // A single delegated handler for the whole grid, rather than one bound
  // closure per day cell. This keeps DayCell's props free of per-render
  // function identities, so wrapping it in `memo` actually prevents
  // re-rendering the ~35 unaffected cells whenever only the selected date
  // changes (e.g. tapping a different day).
  const handleClick = (e: React.MouseEvent) => {
    const cell = (e.target as HTMLElement).closest<HTMLElement>('[data-date]')
    if (cell?.dataset.date) onDaySelect(cell.dataset.date)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    const cell = (e.target as HTMLElement).closest<HTMLElement>('[data-date]')
    if (cell?.dataset.date) {
      e.preventDefault()
      onDayLongPress(cell.dataset.date)
    }
  }

  return (
    <div
      className="select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <div className="mb-1 grid grid-cols-7" aria-hidden="true">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="pb-1 text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
          >
            {day[0]}
          </div>
        ))}
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={monthKey}
            custom={direction}
            initial={{ x: direction * 48, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -48, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="grid grid-cols-7 gap-y-1"
            aria-label={`Calendar for ${format(month, 'MMMM yyyy')}`}
          >
            {days.map((day) => {
              const iso = format(day, 'yyyy-MM-dd')
              const inMonth = isSameMonth(day, month)
              const kind = classify(iso)
              const isSelected = selectedDate === iso
              const isToday = isSameDay(day, new Date())
              const symptoms = hasSymptoms(iso)
              const note = hasNote(iso)

              return (
                <DayCell
                  key={iso}
                  iso={iso}
                  day={day}
                  inMonth={inMonth}
                  kind={kind}
                  isToday={isToday}
                  isSelected={isSelected}
                  hasSymptoms={symptoms}
                  hasNote={note}
                />
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

const DayCell = memo(function DayCell({
  iso,
  day,
  inMonth,
  kind,
  isToday,
  isSelected,
  hasSymptoms,
  hasNote,
}: {
  iso: string
  day: Date
  inMonth: boolean
  kind: DayKind
  isToday: boolean
  isSelected: boolean
  hasSymptoms: boolean
  hasNote: boolean
}) {
  const filled = kind === 'period' || kind === 'ovulation'
  const ringed = kind === 'predicted'
  const style = DAY_KIND_COLORS[kind]

  return (
    <div className="flex justify-center py-0.5">
      <button
        type="button"
        aria-label={format(day, 'EEEE, MMMM d, yyyy')}
        aria-pressed={isSelected}
        aria-current={isToday ? 'date' : undefined}
        data-date={iso}
        className={cn(
          'relative flex aspect-square w-full max-w-[52px] items-center justify-center rounded-full text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-90',
          !inMonth && 'opacity-35',
          isToday && !isSelected && 'ring-1 ring-ring',
          isSelected && 'ring-2 ring-ring ring-offset-2 ring-offset-background',
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
        {filled ? (
          <span className="font-semibold" style={{ color: style.ring }}>
            {day.getDate()}
          </span>
        ) : (
          <span
            className={cn(
              'tabular-nums',
              kind === 'past' || kind === 'neutral' ? 'text-muted-foreground' : 'text-foreground',
            )}
          >
            {day.getDate()}
          </span>
        )}
        {hasSymptoms && (
          <span
            className="absolute bottom-1 size-1 rounded-full"
            style={{
              backgroundColor:
                kind === 'neutral' ? 'hsl(var(--muted-foreground))' : style.ring,
            }}
            aria-hidden="true"
          />
        )}
        {hasNote && (
          <span
            className="absolute bottom-[2px] h-[2px] w-2 rounded-full bg-muted-foreground/70"
            aria-hidden="true"
          />
        )}
      </button>
    </div>
  )
})
