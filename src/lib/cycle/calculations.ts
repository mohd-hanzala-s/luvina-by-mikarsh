import {
  addDays,
  compareAsc,
  differenceInCalendarDays,
  isBefore,
  isSameDay,
  parseISO,
  subDays,
} from 'date-fns'
import { toPeriodSpans } from '@/lib/db/cycles'
import { mean, standardDeviation } from '@/lib/utils'
import type {
  Cycle,
  CyclePhase,
  CyclePrediction,
  CycleState,
  CycleStats,
  DayKind,
  PeriodSpan,
  Settings,
} from '@/types'

/**
 * Cycle calculation engine.
 *
 * All predictions are estimates produced locally from logged periods. Nothing
 * here is medical advice — ovulation and fertile window values are statistical
 * predictions based on the luteal phase assumption.
 */

/** Distance in days between a date and the most recent period start. */
export function currentCycleDay(start: string, today: string): number {
  return differenceInCalendarDays(parseISO(today), parseISO(start)) + 1
}

/** Cycle lengths between consecutive period starts. */
export function computeCycleLengths(periodStarts: string[]): number[] {
  const lengths: number[] = []
  for (let i = 1; i < periodStarts.length; i++) {
    lengths.push(differenceInCalendarDays(parseISO(periodStarts[i]), parseISO(periodStarts[i - 1])))
  }
  return lengths
}

export function computeStats(cycles: Cycle[]): CycleStats {
  const spans = toPeriodSpans(cycles)
  const starts = spans.map((s) => s.start)
  const lengths = computeCycleLengths(starts)
  // Only completed periods count towards the average period length; an open
  // (ongoing) period has no known end date and must not count as 1 day.
  const periodLengths = cycles
    .filter((c) => c.endDate !== null)
    .map((c) => {
      const end = c.endDate as string
      return differenceInCalendarDays(parseISO(end), parseISO(c.startDate)) + 1
    })

  const avgCycle = mean(lengths)
  const avgPeriod = mean(periodLengths)
  const longestCycle = lengths.length ? Math.max(...lengths) : null
  const shortestCycle = lengths.length ? Math.min(...lengths) : null

  let consistencyScore: number | null = null
  if (avgCycle !== null && avgCycle > 0) {
    const cv = standardDeviation(lengths) / avgCycle
    consistencyScore = Math.round(clamp01(1 - cv / 0.5) * 100)
  }

  return {
    averageCycle: avgCycle === null ? null : Math.round(avgCycle),
    averagePeriod: avgPeriod === null ? null : Math.round(avgPeriod),
    averageDelay: computeAverageDelay(starts),
    longestCycle,
    shortestCycle,
    cyclesLogged: Math.max(0, lengths.length),
    consistencyScore,
    predictionAccuracy: computePredictionAccuracy(starts),
    cycleLengths: lengths,
  }
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v))
}

/**
 * Mean number of days a period arrived late (positive difference between
 * actual and predicted start), computed only when enough history exists.
 */
function computeAverageDelay(periodStarts: string[]): number | null {
  if (periodStarts.length < 2) return null
  const delays: number[] = []
  for (let i = 1; i < periodStarts.length; i++) {
    const prediction = predictNextStart(periodStarts.slice(0, i))
    if (!prediction) continue
    const actual = parseISO(periodStarts[i])
    const predicted = parseISO(prediction)
    if (isBefore(predicted, actual)) {
      delays.push(differenceInCalendarDays(actual, predicted))
    }
  }
  return delays.length ? Math.round(mean(delays) ?? 0) : null
}

/**
 * Percentage of period arrivals that landed within ±2 days of the prediction
 * made at the time (only periods with prior history are counted).
 */
function computePredictionAccuracy(periodStarts: string[]): number | null {
  if (periodStarts.length < 3) return null
  let within = 0
  let total = 0
  for (let i = 2; i < periodStarts.length; i++) {
    const prediction = predictNextStart(periodStarts.slice(0, i))
    if (!prediction) continue
    const diff = Math.abs(
      differenceInCalendarDays(parseISO(periodStarts[i]), parseISO(prediction)),
    )
    total += 1
    if (diff <= 2) within += 1
  }
  return total ? Math.round((within / total) * 100) : null
}

/** Predict the next period start from prior starts using the running average. */
export function predictNextStart(periodStarts: string[], fallbackDays = 28): string | null {
  if (periodStarts.length === 0) return null
  const lengths = computeCycleLengths(periodStarts)
  const avg = lengths.length ? Math.round(mean(lengths) ?? fallbackDays) : fallbackDays
  return formatISO(addDays(parseISO(periodStarts.at(-1) as string), Math.max(1, avg)))
}

export function computePrediction(
  periods: PeriodSpan[],
  stats: CycleStats,
  settings: Pick<Settings, 'cycleLengthDefault' | 'periodLengthDefault' | 'lutealPhaseDays' | 'fertileWindowDays'>,
): CyclePrediction | null {
  if (periods.length === 0) return null
  const avgCycle = stats.averageCycle ?? settings.cycleLengthDefault
  const luteal = Math.max(1, settings.lutealPhaseDays)
  const fertileBefore = Math.max(1, settings.fertileWindowDays)

  const lastStart = periods.at(-1)?.start as string
  const predictedNextStart = formatISO(
    addDays(parseISO(lastStart), Math.max(avgCycle, 1)),
  )
  const ovulationDay = formatISO(subDays(parseISO(predictedNextStart), luteal))
  const fertileWindowStart = formatISO(subDays(parseISO(ovulationDay), fertileBefore))
  const fertileWindowEnd = ovulationDay
  const mostFertileStart = formatISO(subDays(parseISO(ovulationDay), 2))
  const mostFertileEnd = ovulationDay

  return {
    predictedNextStart,
    ovulationDay,
    fertileWindowStart,
    fertileWindowEnd,
    mostFertileStart,
    mostFertileEnd,
    lutealPhaseDays: luteal,
  }
}

/**
 * The current cycle state used by the Home screen: phase, cycle day and the
 * days remaining until the next expected period.
 */
export function getCycleState(
  cycles: Cycle[],
  today: string,
  settings: Pick<Settings, 'cycleLengthDefault' | 'periodLengthDefault' | 'lutealPhaseDays' | 'fertileWindowDays'>,
): CycleState {
  const stats = computeStats(cycles)
  const periods = toPeriodSpans(cycles)
  const prediction = computePrediction(periods, stats, settings)

  if (periods.length === 0) {
    return {
      cycleDay: null,
      phase: 'predicted',
      daysUntilPeriod: null,
      daysIntoPeriod: null,
      periodProgress: null,
      currentCycleStart: null,
      prediction: null,
      stats,
    }
  }

  const current = periods.at(-1) as PeriodSpan
  const todayDate = parseISO(today)
  // An open (ongoing) period is "in period" from its start until it is ended,
  // even though its computed span only covers a single day.
  const openCycle = [...cycles]
    .sort((a, b) => compareAsc(parseISO(a.startDate), parseISO(b.startDate)))
    .findLast((c) => c.endDate === null)
  const inPeriod = openCycle
    ? !isBefore(todayDate, parseISO(openCycle.startDate))
    : !isBefore(todayDate, parseISO(current.start)) && !isAfter(todayDate, parseISO(current.end))
  const cycleDay = currentCycleDay(current.start, today)
  const avgPeriod = stats.averagePeriod ?? settings.periodLengthDefault

  let phase: CyclePhase
  if (inPeriod) {
    phase = 'period'
  } else {
    phase = resolvePhase(todayDate, prediction)
  }

  const predictedStart = prediction?.predictedNextStart
  const daysUntilPeriod = predictedStart
    ? Math.max(0, differenceInCalendarDays(parseISO(predictedStart), todayDate))
    : null

  const daysIntoPeriod = inPeriod ? cycleDay : null
  const periodProgress = daysIntoPeriod ? Math.min(100, Math.round((daysIntoPeriod / avgPeriod) * 100)) : null

  return {
    cycleDay,
    phase,
    daysUntilPeriod,
    daysIntoPeriod,
    periodProgress,
    currentCycleStart: current.start,
    prediction,
    stats,
  }
}

function resolvePhase(today: Date, prediction: CyclePrediction | null): CyclePhase {
  if (!prediction) return 'luteal'
  const ovulation = parseISO(prediction.ovulationDay)
  const fertileStart = parseISO(prediction.fertileWindowStart)

  if (isSameDay(today, ovulation)) return 'ovulation'
  if (!isBefore(today, fertileStart) && isBefore(today, ovulation)) return 'fertile'
  if (isBefore(today, fertileStart)) return 'follicular'
  return 'luteal'
}

/**
 * Classify a calendar day into a display kind used for color coding.
 * Real logged periods always win over predictions.
 */
export function classifyDay(
  date: string,
  periods: PeriodSpan[],
  prediction: CyclePrediction | null,
  avgPeriod: number,
  today: string,
): DayKind {
  const d = parseISO(date)

  if (periods.some((p) => !isBefore(d, parseISO(p.start)) && !isAfter(d, parseISO(p.end)))) {
    return 'period'
  }

  if (prediction) {
    if (isSameDay(d, parseISO(prediction.ovulationDay))) return 'ovulation'
    if (
      !isBefore(d, parseISO(prediction.fertileWindowStart)) &&
      !isAfter(d, parseISO(prediction.fertileWindowEnd))
    ) {
      return 'fertile'
    }
    const predStart = parseISO(prediction.predictedNextStart)
    if (!isBefore(d, predStart) && !isAfter(d, addDays(predStart, Math.max(1, avgPeriod) - 1))) {
      return 'predicted'
    }
  }

  return isBefore(d, parseISO(today)) ? 'past' : 'neutral'
}

/** History timeline entry: one cycle from period start to the next start. */
export interface CycleHistoryEntry {
  key: string
  start: string
  end: string
  length: number
  periodLength: number
  isOngoing: boolean
}

export function buildCycleHistory(cycles: Cycle[], today: string): CycleHistoryEntry[] {
  const periods = toPeriodSpans(cycles)
  const starts = periods.map((p) => p.start)
  const entries: CycleHistoryEntry[] = []

  for (let i = 0; i < starts.length; i++) {
    const start = starts[i]
    const end = i + 1 < starts.length
      ? formatISO(subDays(parseISO(starts[i + 1]), 1))
      : formatISO(subDays(parseISO(today), 1))
    const length = i + 1 < starts.length
      ? differenceInCalendarDays(parseISO(starts[i + 1]), parseISO(start))
      : differenceInCalendarDays(parseISO(today), parseISO(start)) + 1
    entries.push({
      key: start,
      start,
      end,
      length,
      periodLength: periods[i].length,
      isOngoing: i === starts.length - 1,
    })
  }

  return entries.reverse()
}

function isAfter(d: Date, b: Date): boolean {
  return compareAsc(d, b) > 0
}

/** Local-friendly ISO formatter (`yyyy-MM-dd`). */
function formatISO(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
