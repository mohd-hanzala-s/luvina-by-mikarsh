'use client'

import { CalendarHeart, Droplets } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { PHASE_ACCENTS, PHASE_LABELS } from '@/constants'
import { cn, formatShortDate } from '@/lib/utils'
import type { CycleState } from '@/types'
import { Progress } from '@/components/ui/progress'

export function CycleHero({ state }: { state: CycleState }) {
  const { cycleDay, phase, daysUntilPeriod, periodProgress, prediction, stats } = state

  if (cycleDay === null) {
    return (
      <div className="relative overflow-hidden rounded-card border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/10 p-6 shadow-soft">
        <h2 className="font-display text-xl font-semibold">Welcome to Luvina</h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          Track your first period to unlock cycle predictions, ovulation estimates and
          insights. Everything is stored privately on this device.
        </p>
      </div>
    )
  }

  const accent = PHASE_ACCENTS[phase] ?? 'var(--primary)'
  const predictedDate = prediction?.predictedNextStart
  const ovulationDate = prediction?.ovulationDay

  return (
    <div
      className="relative overflow-hidden rounded-card border bg-card p-6 shadow-soft"
      style={{ borderColor: `hsl(var(--border))` }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 size-52 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: accent }}
      />

      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Cycle day</p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-5xl font-bold tabular-nums tracking-tight">
              {cycleDay}
            </span>
            {daysUntilPeriod !== null && (
              <span className="text-sm font-medium text-muted-foreground">
                {daysUntilPeriod === 0
                  ? 'period expected today'
                  : `period in ${daysUntilPeriod} day${daysUntilPeriod === 1 ? '' : 's'}`}
              </span>
            )}
          </p>
        </div>

        <span
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
          style={{ backgroundColor: `hsl(var(--muted))`, color: accent }}
        >
          <span className="size-2 rounded-full" style={{ backgroundColor: accent }} aria-hidden="true" />
          {PHASE_LABELS[phase] ?? phase}
        </span>
      </div>

      {phase === 'period' && periodProgress !== null && (
        <div className="relative mt-4">
          <Progress value={periodProgress} />
          <p className="mt-1.5 text-xs text-muted-foreground">
            About {periodProgress}% through your typical period
          </p>
        </div>
      )}

      <div className="relative mt-5 flex flex-wrap gap-2">
        {predictedDate && (
          <StatChip
            icon={<CalendarHeart className="size-3.5" aria-hidden="true" />}
            label="Next period"
            value={format(parseISO(predictedDate), 'MMM d')}
          />
        )}
        {ovulationDate && (
          <StatChip
            icon={<Droplets className="size-3.5" aria-hidden="true" />}
            label="Ovulation est."
            value={formatShortDate(ovulationDate)}
          />
        )}
        {stats.averageCycle !== null && (
          <StatChip label="Avg cycle" value={`${stats.averageCycle} days`} />
        )}
        {stats.averagePeriod !== null && (
          <StatChip label="Avg period" value={`${stats.averagePeriod} days`} />
        )}
      </div>
    </div>
  )
}

function StatChip({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode
  label: string
  value: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-pill bg-muted px-3 py-1.5 text-xs')}>
      {icon}
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </span>
  )
}
