'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { CalendarHeart, ChevronRight, Droplets, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAppData } from '@/hooks/useAppData'
import { deleteCycle, updateCycle } from '@/lib/db/cycles'
import type { Cycle, DayLog } from '@/types'
import { formatShortDate, pluralize } from '@/lib/utils'
import { HelpButton } from '@/components/help/contextual-help'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import type { CycleHistoryEntry } from '@/lib/cycle/calculations'

export default function HistoryPage() {
  const { history, cycles, logs, loaded } = useAppData()
  const [selected, setSelected] = useState<CycleHistoryEntry | null>(null)

  if (!loaded) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <span className="flex size-16 items-center justify-center rounded-card bg-primary/10 text-primary">
          <CalendarHeart className="size-8" aria-hidden="true" />
        </span>
        <h1 className="font-display text-xl font-semibold">Your story starts here</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          No cycles yet — that&apos;s okay. Once you start tracking periods, your cycle history will
          appear here as a timeline.
        </p>
        <Button asChild variant="outline">
          <Link href="/calendar">Open the calendar</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">History</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tap any cycle to review or edit it.
          </p>
        </div>
        <HelpButton screen="history" label="Help about history" />
      </header>

      <ol className="relative space-y-4 before:absolute before:inset-y-2 before:left-[19px] before:w-px before:bg-border/70">
        {history.map((entry) => (
          <HistoryCard
            key={entry.key}
            entry={entry}
            logs={logs}
            onOpen={() => setSelected(entry)}
          />
        ))}
      </ol>

      <CycleDetailSheet
        key={selected?.key ?? 'none'}
        entry={selected}
        cycles={cycles}
        logs={logs}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  )
}

function HistoryCard({
  entry,
  logs,
  onOpen,
}: {
  entry: CycleHistoryEntry
  logs: DayLog[]
  onOpen: () => void
}) {
  const rangeLogs = logs.filter((log) => log.date >= entry.start && log.date <= entry.end)
  const hasNotes = rangeLogs.some((log) => log.note)

  return (
    <li className="cv-auto">
      <button
        type="button"
        onClick={onOpen}
        className="group flex w-full items-center gap-4 rounded-card border border-border/60 bg-card p-4 text-left shadow-soft transition-all hover:border-primary/40 hover:shadow-lifted"
      >
        <span
          aria-hidden="true"
          className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-4 ring-background"
        >
          <Droplets className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-display text-base font-semibold">
              {format(parseISO(entry.start), 'MMMM yyyy')}
            </span>
            {entry.isOngoing && <Badge variant="soft">Ongoing</Badge>}
          </span>
          <span className="mt-0.5 block text-sm text-muted-foreground">
            {formatShortDate(entry.start)} · {pluralize(entry.length, 'day')} cycle
            {entry.periodLength > 1 && ` · ${pluralize(entry.periodLength, 'day')} period`}
          </span>
          {hasNotes && (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
              has notes
            </span>
          )}
        </span>
        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </button>
    </li>
  )
}

function CycleDetailSheet({
  entry,
  cycles,
  logs,
  onOpenChange,
}: {
  entry: CycleHistoryEntry | null
  cycles: Cycle[]
  logs: DayLog[]
  onOpenChange: (open: boolean) => void
}) {
  const cycle = entry ? cycles.find((c) => c.startDate === entry.start) : undefined
  const [startDate, setStartDate] = useState(entry?.start ?? '')
  const [endDate, setEndDate] = useState(entry?.end ?? '')
  const [dirty, setDirty] = useState(false)

  if (!entry || !cycle) return null

  const rangeLogs = logs.filter((log) => log.date >= entry.start && log.date <= entry.end)
  const symptomCounts = new Map<string, number>()
  for (const log of rangeLogs) {
    for (const symptom of log.symptoms) {
      symptomCounts.set(symptom, (symptomCounts.get(symptom) ?? 0) + 1)
    }
  }
  const topSymptoms = [...symptomCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([s]) => s)

  const handleSave = async () => {
    const cycleId = cycle.id
    try {
      await updateCycle(cycleId, { startDate, endDate })
      toast.success('Cycle updated')
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update this cycle.')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteCycle(cycle.id)
      toast.success('Cycle removed')
      onOpenChange(false)
    } catch {
      toast.error('Could not remove this cycle.')
    }
  }

  return (
    <Sheet open={entry !== null} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[92dvh] overflow-y-auto rounded-t-3xl p-0">
        <div className="mx-auto h-1.5 w-10 rounded-full bg-muted-foreground/25" />
        <SheetHeader className="px-6 pt-4">
          <SheetTitle>Cycle of {format(parseISO(entry.start), 'MMMM yyyy')}</SheetTitle>
          <SheetDescription>
            {entry.isOngoing
              ? 'This cycle is still in progress.'
              : `${pluralize(entry.length, 'day')} long · ${pluralize(entry.periodLength, 'day')} period`}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-6 pb-8 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="cycle-start">Start date</Label>
              <Input
                id="cycle-start"
                type="date"
                className="mt-2"
                value={startDate}
                max={endDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  setDirty(true)
                }}
              />
            </div>
            <div>
              <Label htmlFor="cycle-end">End date</Label>
              <Input
                id="cycle-end"
                type="date"
                className="mt-2"
                value={endDate}
                min={startDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  setDirty(true)
                }}
              />
            </div>
          </div>

          {topSymptoms.length > 0 && (
            <section>
              <Label className="mb-2 block">Common symptoms</Label>
              <div className="flex flex-wrap gap-2">
                {topSymptoms.map((s) => (
                  <Badge key={s} variant="secondary" className="capitalize">
                    {s}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          <p className="text-xs text-muted-foreground">
            {rangeLogs.length > 0
              ? `${pluralize(rangeLogs.length, 'logged day')} in this cycle.`
              : 'No daily entries logged in this cycle.'}
          </p>

          <div className="flex gap-2 pt-2">
            <Button className="flex-1" disabled={!dirty} onClick={handleSave}>
              Save changes
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive">
                  <Trash2 aria-hidden="true" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this cycle?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes the period starting {formatShortDate(entry.start)} and updates
                    your predictions. Daily notes for those dates are kept.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
