'use client'

import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db/db'
import { toPeriodSpans } from '@/lib/db/cycles'
import {
  buildCycleHistory,
  classifyDay,
  computePrediction,
  computeStats,
  getCycleState,
} from '@/lib/cycle/calculations'
import { DEFAULT_SETTINGS } from '@/constants'
import { useToday } from '@/hooks/useToday'
import type { Cycle, DayKind, PeriodSpan, Settings } from '@/types'

/**
 * Central data hook. Reads IndexedDB reactively (via useLiveQuery) and
 * derives every calculation the UI needs, so components never duplicate
 * domain logic.
 */
export function useAppData() {
  const rawCycles = useLiveQuery(() => db.cycles.orderBy('startDate').toArray(), [])
  const rawLogs = useLiveQuery(() => db.logs.toArray(), [])
  const rawReminders = useLiveQuery(() => db.reminders.toArray(), [])
  const rawSettings = useLiveQuery(() => db.settings.get(1), [])

  const cycles = useMemo<Cycle[]>(() => rawCycles ?? [], [rawCycles])
  const logs = useMemo(() => rawLogs ?? [], [rawLogs])
  const reminders = useMemo(() => rawReminders ?? [], [rawReminders])
  const settings = (rawSettings as Settings | undefined) ?? null

  const loaded =
    rawCycles !== undefined &&
    rawLogs !== undefined &&
    rawReminders !== undefined &&
    rawSettings !== undefined

  const settingsDefaults = useMemo(
    () => ({
      cycleLengthDefault: settings?.cycleLengthDefault ?? DEFAULT_SETTINGS.cycleLengthDefault,
      periodLengthDefault: settings?.periodLengthDefault ?? DEFAULT_SETTINGS.periodLengthDefault,
      lutealPhaseDays: settings?.lutealPhaseDays ?? DEFAULT_SETTINGS.lutealPhaseDays,
      fertileWindowDays: settings?.fertileWindowDays ?? DEFAULT_SETTINGS.fertileWindowDays,
    }),
    [
      settings?.cycleLengthDefault,
      settings?.periodLengthDefault,
      settings?.lutealPhaseDays,
      settings?.fertileWindowDays,
    ],
  )

  const today = useToday()

  const periods: PeriodSpan[] = useMemo(() => toPeriodSpans(cycles), [cycles])
  const stats = useMemo(() => computeStats(cycles), [cycles])
  const prediction = useMemo(
    () => computePrediction(periods, stats, settingsDefaults),
    [periods, stats, settingsDefaults],
  )
  const cycleState = useMemo(
    () => getCycleState(cycles, today, settingsDefaults),
    [cycles, today, settingsDefaults],
  )
  const history = useMemo(() => buildCycleHistory(cycles, today), [cycles, today])

  const classify = useMemo(
    () => (date: string): DayKind =>
      classifyDay(date, periods, prediction, stats.averagePeriod ?? settingsDefaults.periodLengthDefault, today),
    [periods, prediction, stats.averagePeriod, settingsDefaults, today],
  )

  return {
    cycles,
    logs,
    reminders,
    settings,
    loaded,
    periods,
    stats,
    prediction,
    cycleState,
    history,
    classify,
    today,
  }
}

export type AppData = ReturnType<typeof useAppData>
