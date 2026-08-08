import { compareAsc, differenceInCalendarDays, format, parseISO, subDays } from 'date-fns'
import { db } from '@/lib/db/db'
import type { Cycle, PeriodSpan } from '@/types'

/**
 * Cycles repository.
 * A cycle is a logged period: a start date and (once ended) an end date.
 */

export async function getCycles(): Promise<Cycle[]> {
  return db.cycles.orderBy('startDate').toArray()
}

/** Start a new period. Ends any currently open period first. */
export async function startPeriod(startDate: string): Promise<number> {
  const now = Date.now()
  return db.transaction('rw', db.cycles, async () => {
    await endOpenPeriodIfNeeded(startDate)
    const id = await db.cycles.add({
      startDate,
      endDate: null,
      createdAt: now,
      updatedAt: now,
    } as Cycle)
    return id
  })
}

/** End the most recent open period (if any) on the given date. */
export async function endPeriod(endDate: string): Promise<void> {
  const open = await db.cycles
    .filter((c) => c.endDate === null)
    .sortBy('startDate')
    .then((list) => list.at(-1))
  if (!open) return
  const safeEnd = ensureEndAfterStart(open.startDate, endDate)
  await db.cycles.update(open.id, { endDate: safeEnd, updatedAt: Date.now() })
}

async function endOpenPeriodIfNeeded(startDate: string): Promise<void> {
  const open = await db.cycles
    .filter((c) => c.endDate === null)
    .sortBy('startDate')
    .then((list) => list.at(-1))
  if (!open || open.startDate === startDate) return
  const end = subDays(parseISO(startDate), 1)
  const safeEnd = ensureEndAfterStart(open.startDate, format(end, 'yyyy-MM-dd'))
  await db.cycles.update(open.id, {
    endDate: safeEnd,
    updatedAt: Date.now(),
  })
}

/** Edit a period's start and/or end dates. */
export async function updateCycle(
  id: number,
  patch: { startDate?: string; endDate?: string | null },
): Promise<void> {
  const existing = await db.cycles.get(id)
  if (!existing) {
    throw new Error('This period no longer exists — it may have been deleted elsewhere.')
  }
  const next = {
    startDate: patch.startDate ?? existing.startDate,
    endDate: patch.endDate === undefined ? existing.endDate : patch.endDate,
  }
  if (next.endDate && compareAsc(parseISO(next.endDate), parseISO(next.startDate)) < 0) {
    throw new Error('End date must be on or after the start date.')
  }
  await db.cycles.update(id, { ...next, updatedAt: Date.now() })
}

export async function deleteCycle(id: number): Promise<void> {
  await db.cycles.delete(id)
}

/**
 * Convert cycles to contiguous period spans, resolving overlaps and gaps
 * between adjacent logged periods.
 */
export function toPeriodSpans(cycles: Cycle[]): PeriodSpan[] {
  const sorted = [...cycles].sort((a, b) => compareAsc(parseISO(a.startDate), parseISO(b.startDate)))
  const spans: PeriodSpan[] = []
  for (const cycle of sorted) {
    const start = cycle.startDate
    const rawEnd = cycle.endDate ?? start
    const end = ensureEndAfterStart(start, rawEnd)
    const prev = spans.at(-1)
    if (prev && differenceInCalendarDays(parseISO(start), parseISO(prev.end)) <= 1) {
      // Adjacent or overlapping — merge into the previous span.
      prev.end = end
      prev.length = differenceInCalendarDays(parseISO(prev.end), parseISO(prev.start)) + 1
    } else {
      spans.push({
        start,
        end,
        length: differenceInCalendarDays(parseISO(end), parseISO(start)) + 1,
      })
    }
  }
  return spans
}

function ensureEndAfterStart(start: string, end: string): string {
  if (compareAsc(parseISO(end), parseISO(start)) < 0) return start
  return end
}

/** True when the given date falls inside any logged period. */
export function isPeriodDay(spans: PeriodSpan[], date: string): boolean {
  return spans.some((span) => {
    const d = parseISO(date)
    return compareAsc(d, parseISO(span.start)) >= 0 && compareAsc(d, parseISO(span.end)) <= 0
  })
}
