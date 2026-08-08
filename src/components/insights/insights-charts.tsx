'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

/**
 * Isolated in its own module so the insights page can `next/dynamic`
 * import it with `ssr: false`. Recharts is one of the heaviest
 * dependencies in the app (SVG chart primitives + d3 internals); pulling
 * it out of the initial page chunk means the stat cards above the fold
 * render and hydrate first, and the chart bundle only loads afterward.
 * ResponsiveContainer also relies on ResizeObserver, so client-only
 * rendering avoids a hydration mismatch on the static export besides.
 */

const tickStyle = { fontSize: 12, fill: 'hsl(var(--muted-foreground))' }
const tooltipCursor = { fill: 'hsl(var(--muted) / 0.4)', radius: 8 }
const tooltipContentStyle = {
  background: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 12,
  fontSize: 12,
}

export function CycleTrendChart({
  data,
  averageCycle,
}: {
  data: { name: string; length: number }[]
  averageCycle: number | null
}) {
  if (data.length === 0) {
    return <p className="py-16 text-center text-sm text-muted-foreground">Not enough data yet.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis dataKey="name" tick={tickStyle} axisLine={false} tickLine={false} />
        <YAxis tick={tickStyle} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip cursor={tooltipCursor} contentStyle={tooltipContentStyle} />
        <ReferenceLine y={averageCycle ?? undefined} stroke="hsl(var(--primary))" strokeDasharray="4 4" />
        <Bar dataKey="length" radius={[6, 6, 0, 0]} maxBarSize={28}>
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={entry.length === averageCycle ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.45)'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function PeriodDaysChart({ data }: { data: { label: string; days: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis dataKey="label" tick={tickStyle} axisLine={false} tickLine={false} />
        <YAxis tick={tickStyle} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip cursor={tooltipCursor} contentStyle={tooltipContentStyle} />
        <Bar dataKey="days" fill="hsl(var(--period))" radius={[6, 6, 0, 0]} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  )
}
