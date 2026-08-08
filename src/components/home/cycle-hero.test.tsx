import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CycleHero } from '@/components/home/cycle-hero'
import type { CycleState } from '@/types'

const emptyStats = {
  averageCycle: null,
  averagePeriod: null,
  averageDelay: null,
  longestCycle: null,
  shortestCycle: null,
  cyclesLogged: 0,
  consistencyScore: null,
  predictionAccuracy: null,
  cycleLengths: [],
}

const baseState: CycleState = {
  cycleDay: 12,
  phase: 'luteal',
  daysUntilPeriod: 16,
  daysIntoPeriod: null,
  periodProgress: null,
  currentCycleStart: '2024-01-01',
  prediction: {
    predictedNextStart: '2024-01-29',
    ovulationDay: '2024-01-15',
    fertileWindowStart: '2024-01-10',
    fertileWindowEnd: '2024-01-15',
    mostFertileStart: '2024-01-13',
    mostFertileEnd: '2024-01-15',
    lutealPhaseDays: 14,
  },
  stats: {
    ...emptyStats,
    averageCycle: 28,
    averagePeriod: 5,
  },
}

describe('CycleHero', () => {
  it('shows the cycle day, phase and days until the next period', () => {
    render(<CycleHero state={baseState} />)
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('Luteal phase')).toBeInTheDocument()
    expect(screen.getByText(/period in 16 days/i)).toBeInTheDocument()
  })

  it('shows the predicted period and ovulation estimates', () => {
    render(<CycleHero state={baseState} />)
    expect(screen.getByText(/Next period/i)).toBeInTheDocument()
    expect(screen.getByText(/Ovulation est\./i)).toBeInTheDocument()
  })

  it('shows averages from stats', () => {
    render(<CycleHero state={baseState} />)
    expect(screen.getByText('Avg cycle')).toBeInTheDocument()
    expect(screen.getByText('28 days')).toBeInTheDocument()
    expect(screen.getByText('Avg period')).toBeInTheDocument()
    expect(screen.getByText('5 days')).toBeInTheDocument()
  })

  it('renders a welcome state without a logged cycle', () => {
    render(
      <CycleHero
        state={{
          cycleDay: null,
          phase: 'predicted',
          daysUntilPeriod: null,
          daysIntoPeriod: null,
          periodProgress: null,
          currentCycleStart: null,
          prediction: null,
          stats: emptyStats,
        }}
      />,
    )
    expect(screen.getByText(/track your first period/i)).toBeInTheDocument()
  })
})
