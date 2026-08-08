'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { eachDayOfInterval, endOfMonth, format, parseISO, startOfMonth, subMonths } from 'date-fns'
import { CalendarRange, Gauge, Target } from 'lucide-react'
import { useAppData } from '@/hooks/useAppData'
import { HelpButton } from '@/components/help/contextual-help'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

// Recharts (~heaviest dependency in the app) only loads once these mount,
// well after the initial page paint/hydration. See insights-charts.tsx.
const CycleTrendChart = dynamic(
  () => import('@/components/insights/insights-charts').then((m) => m.CycleTrendChart),
  { ssr: false, loading: () => <Skeleton className="h-[220px]" /> },
)
const PeriodDaysChart = dynamic(
  () => import('@/components/insights/insights-charts').then((m) => m.PeriodDaysChart),
  { ssr: false, loading: () => <Skeleton className="h-[220px]" /> },
)

export default function InsightsPage() {
  const { stats, periods, history, loaded } = useAppData()

  const monthlyPeriodDays = useMemo(() => {
    const months: { label: string; days: number }[] = []
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i))
      const monthEnd = endOfMonth(subMonths(now, i))
      const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
      const periodDays = days.filter((day) => {
        const iso = format(day, 'yyyy-MM-dd')
        return periods.some((p) => p.start <= iso && iso <= p.end)
      }).length
      months.push({ label: format(monthStart, 'MMM'), days: periodDays })
    }
    return months
  }, [periods])

  const cycleTrend = useMemo(
    () =>
      [...history]
        .reverse()
        .map((entry) => ({
          name: format(parseISO(entry.start), 'MMM'),
          length: entry.length,
        }))
        .filter((entry) => entry.length > 0),
    [history],
  )

  if (!loaded) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-10 w-40" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (stats.cyclesLogged === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <span className="flex size-16 items-center justify-center rounded-card bg-primary/10 text-primary">
          <Target className="size-8" aria-hidden="true" />
        </span>
        <h1 className="font-display text-xl font-semibold">Your insights are getting ready</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Track a few cycles and Luvina will reveal your averages, consistency and prediction
          accuracy here — computed privately on this device.
        </p>
        <Button asChild variant="outline">
          <Link href="/calendar">Log your first period</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Insights</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Calculated locally from your logged cycles. Not medical advice.
          </p>
        </div>
        <HelpButton screen="insights" label="Help about insights" />
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <HighlightStat
          icon={<CalendarRange className="size-4" aria-hidden="true" />}
          label="Average cycle"
          value={stats.averageCycle === null ? '—' : `${stats.averageCycle} days`}
          info="Mean length between consecutive period start dates over your logged history."
        />
        <HighlightStat
          icon={<Target className="size-4" aria-hidden="true" />}
          label="Prediction accuracy"
          value={stats.predictionAccuracy === null ? '—' : `${stats.predictionAccuracy}%`}
          info="Percentage of past periods that started within ±2 days of Luvina's prediction."
        />
        <div className="rounded-card border border-border/60 bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between gap-2 text-sm font-medium text-muted-foreground">
            <div className="flex items-center gap-2">
              <Gauge className="size-4" aria-hidden="true" />
              Consistency
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4">
            <Ring value={stats.consistencyScore ?? 0} />
            <p className="text-xs leading-relaxed text-muted-foreground">
              {consistencyLabel(stats.consistencyScore)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="Avg period" value={stats.averagePeriod === null ? '—' : `${stats.averagePeriod} d`} />
        <MiniStat label="Avg delay" value={stats.averageDelay === null ? '—' : `${stats.averageDelay} d`} />
        <MiniStat label="Longest" value={stats.longestCycle === null ? '—' : `${stats.longestCycle} d`} />
        <MiniStat label="Shortest" value={stats.shortestCycle === null ? '—' : `${stats.shortestCycle} d`} />
      </div>

      {/* Methodology & Medical Transparency Note */}
      <div className="rounded-card border border-primary/20 bg-primary/5 p-4 text-xs text-muted-foreground">
        <h3 className="font-medium text-foreground">How calculations work</h3>
        <p className="mt-1 leading-relaxed">
          All metrics are calculated locally on your device using standard statistical models.
          Predictions adapt over time as you log more cycles. These figures are informational estimates
          and do not constitute medical diagnosis or contraceptive advice.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2" data-tour="insights-charts">
        <ChartCard title="Cycle length trend" subtitle="Days per completed cycle">
          <CycleTrendChart data={cycleTrend} averageCycle={stats.averageCycle} />
        </ChartCard>

        <ChartCard title="Period days" subtitle="Days per month, last 12 months">
          <PeriodDaysChart data={monthlyPeriodDays} />
        </ChartCard>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        All insights are estimates computed from your logged data. Cycle patterns vary
        person to person — consult a healthcare professional for anything medical.
      </p>
    </div>
  )
}

function HighlightStat({
  icon,
  label,
  value,
  info,
}: {
  icon: React.ReactNode
  label: string
  value: string
  info?: string
}) {
  return (
    <div className="rounded-card border border-border/60 bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between gap-2 text-sm font-medium text-muted-foreground">
        <div className="flex items-center gap-2">
          {icon}
          {label}
        </div>
      </div>
      <p className="mt-2 font-display text-3xl font-bold tabular-nums tracking-tight">{value}</p>
      {info && <p className="mt-2 text-xs text-muted-foreground">{info}</p>}
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-border/60 bg-card p-4 shadow-soft">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-lg font-semibold tabular-nums">{value}</p>
    </div>
  )
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-card border border-border/60 bg-card p-5 shadow-soft">
      <h2 className="font-display text-base font-semibold">{title}</h2>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function Ring({ value }: { value: number }) {
  const radius = 30
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - value / 100)
  const color = value >= 70 ? 'hsl(var(--fertile))' : value >= 45 ? 'hsl(var(--period))' : 'hsl(var(--destructive))'
  return (
    <div className="relative size-20 shrink-0" role="img" aria-label={`Consistency ${value} percent`}>
      <svg viewBox="0 0 72 72" className="size-20 -rotate-90">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums">
        {value}
      </span>
    </div>
  )
}

function consistencyLabel(score: number | null): string {
  if (score === null) return 'Log more cycles to see how regular your cycle is.'
  if (score >= 80) return 'Very regular — your cycle lengths are highly consistent.'
  if (score >= 60) return 'Fairly regular — most cycles land close to your average.'
  if (score >= 40) return 'Some variation — cycle length varies a bit between months.'
  return 'Irregular — cycle length varies noticeably. Estimates are less precise.'
}
