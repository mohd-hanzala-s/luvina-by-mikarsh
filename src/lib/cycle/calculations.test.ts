import { describe, expect, it } from 'vitest'
import {
  buildCycleHistory,
  classifyDay,
  computeCycleLengths,
  computePrediction,
  computeStats,
  currentCycleDay,
  getCycleState,
  predictNextStart,
} from '@/lib/cycle/calculations'
import { toPeriodSpans } from '@/lib/db/cycles'
import type { Cycle, PeriodSpan, Settings } from '@/types'

const settings: Pick<Settings, 'cycleLengthDefault' | 'periodLengthDefault' | 'lutealPhaseDays' | 'fertileWindowDays'> = {
  cycleLengthDefault: 28,
  periodLengthDefault: 5,
  lutealPhaseDays: 14,
  fertileWindowDays: 5,
}

function cycle(startDate: string, endDate: string | null, id = 1): Cycle {
  return { id, startDate, endDate, createdAt: 0, updatedAt: 0 }
}

describe('currentCycleDay', () => {
  it('counts days from the period start, inclusive', () => {
    expect(currentCycleDay('2024-01-01', '2024-01-01')).toBe(1)
    expect(currentCycleDay('2024-01-01', '2024-01-10')).toBe(10)
    expect(currentCycleDay('2024-01-01', '2024-01-28')).toBe(28)
  })
})

describe('computeCycleLengths', () => {
  it('computes gaps between consecutive starts', () => {
    expect(computeCycleLengths(['2024-01-01', '2024-01-29', '2024-02-27'])).toEqual([28, 29])
  })

  it('returns an empty array for fewer than two starts', () => {
    expect(computeCycleLengths(['2024-01-01'])).toEqual([])
    expect(computeCycleLengths([])).toEqual([])
  })
})

describe('computeStats', () => {
  it('computes averages, extremes and counts from completed cycles', () => {
    const cycles = [
      cycle('2024-01-01', '2024-01-05'), // 5-day period
      cycle('2024-01-28', '2024-02-01'), // 27-day cycle, 5-day period
      cycle('2024-02-27', '2024-03-02'), // 30-day cycle, 5-day period
    ]
    const stats = computeStats(cycles)
    expect(stats.cyclesLogged).toBe(2)
    expect(stats.longestCycle).toBe(30)
    expect(stats.shortestCycle).toBe(27)
    expect(stats.averageCycle).toBe(29) // round((27 + 30) / 2)
    expect(stats.averagePeriod).toBe(5)
    expect(stats.consistencyScore).not.toBeNull()
    expect(stats.predictionAccuracy).not.toBeNull()
  })

  it('excludes an ongoing period from the average period length', () => {
    const cycles = [cycle('2024-01-01', null)]
    const stats = computeStats(cycles)
    expect(stats.averagePeriod).toBeNull()
    expect(stats.cyclesLogged).toBe(0)
  })

  it('does not count a single period as a cycle', () => {
    const stats = computeStats([cycle('2024-01-01', '2024-01-05')])
    expect(stats.cyclesLogged).toBe(0)
    expect(stats.averageCycle).toBeNull()
    expect(stats.averagePeriod).toBe(5)
  })

  it('returns empty stats for no data', () => {
    const stats = computeStats([])
    expect(stats.averageCycle).toBeNull()
    expect(stats.averagePeriod).toBeNull()
    expect(stats.longestCycle).toBeNull()
    expect(stats.shortestCycle).toBeNull()
    expect(stats.cyclesLogged).toBe(0)
  })
})

describe('predictNextStart', () => {
  it('adds the average cycle length to the last start', () => {
    expect(predictNextStart(['2024-01-01', '2024-01-29'])).toBe('2024-02-26')
  })

  it('returns null with no history', () => {
    expect(predictNextStart([])).toBeNull()
  })

  it('uses the fallback length when there is only one period', () => {
    expect(predictNextStart(['2024-01-01'], 30)).toBe('2024-01-31')
  })
})

describe('toPeriodSpans', () => {
  it('merges adjacent and overlapping periods', () => {
    const spans = toPeriodSpans([
      cycle('2024-01-01', '2024-01-05'),
      cycle('2024-01-05', '2024-01-08'),
    ])
    expect(spans).toHaveLength(1)
    expect(spans[0].start).toBe('2024-01-01')
    expect(spans[0].end).toBe('2024-01-08')
  })

  it('keeps separate periods distinct', () => {
    const spans = toPeriodSpans([
      cycle('2024-01-01', '2024-01-05'),
      cycle('2024-02-01', '2024-02-05'),
    ])
    expect(spans).toHaveLength(2)
    expect(spans[0].length).toBe(5)
    expect(spans[1].length).toBe(5)
  })

  it('treats an open period as starting on its start date', () => {
    const spans = toPeriodSpans([cycle('2024-01-01', null)])
    expect(spans).toEqual([{ start: '2024-01-01', end: '2024-01-01', length: 1 }])
  })
})

describe('computePrediction', () => {
  const periods: PeriodSpan[] = [{ start: '2024-01-01', end: '2024-01-05', length: 5 }]

  it('predicts the next start, ovulation and fertile window', () => {
    const prediction = computePrediction(periods, computeStats([cycle('2024-01-01', '2024-01-05')]), settings)
    expect(prediction).not.toBeNull()
    expect(prediction?.predictedNextStart).toBe('2024-01-29')
    expect(prediction?.ovulationDay).toBe('2024-01-15')
    expect(prediction?.fertileWindowStart).toBe('2024-01-10')
    expect(prediction?.fertileWindowEnd).toBe('2024-01-15')
    expect(prediction?.mostFertileStart).toBe('2024-01-13')
    expect(prediction?.mostFertileEnd).toBe('2024-01-15')
  })

  it('returns null without any periods', () => {
    expect(computePrediction([], computeStats([]), settings)).toBeNull()
  })
})

describe('getCycleState', () => {
  it('reports period phase and progress while on a period', () => {
    const state = getCycleState(
      [cycle('2024-01-01', null)],
      '2024-01-03',
      settings,
    )
    expect(state.phase).toBe('period')
    expect(state.cycleDay).toBe(3)
    expect(state.daysIntoPeriod).toBe(3)
    expect(state.periodProgress).toBe(60) // 3 / default 5
    expect(state.currentCycleStart).toBe('2024-01-01')
  })

  it('reports an empty state with no data', () => {
    const state = getCycleState([], '2024-01-03', settings)
    expect(state.cycleDay).toBeNull()
    expect(state.phase).toBe('predicted')
    expect(state.daysUntilPeriod).toBeNull()
    expect(state.prediction).toBeNull()
  })

  it('computes days until the next expected period', () => {
    const state = getCycleState(
      [cycle('2024-01-01', '2024-01-05')],
      '2024-01-10',
      settings,
    )
    expect(state.daysUntilPeriod).toBe(19) // predicted 2024-01-29
    expect(state.cycleDay).toBe(10)
  })
})

describe('classifyDay', () => {
  const periods: PeriodSpan[] = [{ start: '2024-01-01', end: '2024-01-05', length: 5 }]
  const prediction = computePrediction(periods, computeStats([cycle('2024-01-01', '2024-01-05')]), settings)

  it('classifies a logged period day', () => {
    expect(classifyDay('2024-01-03', periods, prediction, 5, '2024-01-10')).toBe('period')
  })

  it('classifies predicted period days', () => {
    expect(classifyDay('2024-01-29', periods, prediction, 5, '2024-01-10')).toBe('predicted')
    expect(classifyDay('2024-01-30', periods, prediction, 5, '2024-01-10')).toBe('predicted')
  })

  it('classifies ovulation and fertile days', () => {
    expect(classifyDay('2024-01-15', periods, prediction, 5, '2024-01-10')).toBe('ovulation')
    expect(classifyDay('2024-01-12', periods, prediction, 5, '2024-01-10')).toBe('fertile')
  })

  it('classifies past and neutral days', () => {
    expect(classifyDay('2024-01-08', periods, prediction, 5, '2024-01-10')).toBe('past')
    expect(classifyDay('2024-01-20', periods, prediction, 5, '2024-01-10')).toBe('neutral')
  })
})

describe('buildCycleHistory', () => {
  it('builds a reverse-chronological timeline of cycles', () => {
    const history = buildCycleHistory(
      [cycle('2024-01-01', '2024-01-05'), cycle('2024-01-28', '2024-02-01')],
      '2024-03-01',
    )
    expect(history).toHaveLength(2)
    expect(history[0].start).toBe('2024-01-28')
    expect(history[0].length).toBe(34) // ongoing: from start to today (2024-03-01)
    expect(history[0].isOngoing).toBe(true)
    expect(history[1].start).toBe('2024-01-01')
    expect(history[1].length).toBe(27) // gap to the next start (2024-01-28)
  })

  it('marks the most recent cycle as ongoing when it reaches today', () => {
    const history = buildCycleHistory([cycle('2024-02-01', '2024-02-05')], '2024-03-01')
    expect(history[0].isOngoing).toBe(true)
  })
})
