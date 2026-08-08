import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MonthCalendar } from '@/components/calendar/month-calendar'
import type { DayKind } from '@/types'

function renderCalendar(overrides: Partial<Parameters<typeof MonthCalendar>[0]> = {}) {
  const props = {
    month: new Date(2024, 0, 1), // January 2024
    selectedDate: null,
    classify: (): DayKind => 'neutral',
    hasSymptoms: () => false,
    hasNote: () => false,
    direction: 1 as const,
    onNavigate: vi.fn(),
    onDaySelect: vi.fn(),
    onDayLongPress: vi.fn(),
    ...overrides,
  }
  return render(<MonthCalendar {...props} />)
}

describe('MonthCalendar', () => {
  it('renders the weekday header', () => {
    const { container } = renderCalendar()
    expect(container.querySelectorAll('.grid-cols-7')[0].textContent).toContain('S')
    expect(screen.getByLabelText(/Calendar for January 2024/i)).toBeInTheDocument()
  })

  it('calls onDaySelect when a day is clicked', async () => {
    const onDaySelect = vi.fn()
    renderCalendar({ onDaySelect })
    const user = userEvent.setup()
    await user.click(screen.getByLabelText(/January 1, 2024/i))
    expect(onDaySelect).toHaveBeenCalledWith('2024-01-01')
  })

  it('calls onDayLongPress on right click', async () => {
    const onDayLongPress = vi.fn()
    renderCalendar({ onDayLongPress })
    const user = userEvent.setup()
    await user.pointer({
      keys: '[MouseRight]',
      target: screen.getByLabelText(/January 10, 2024/i),
    })
    expect(onDayLongPress).toHaveBeenCalledWith('2024-01-10')
  })

  it('marks a logged day with a symptom dot', () => {
    const hasSymptoms = vi.fn((date: string) => date === '2024-01-05')
    renderCalendar({ hasSymptoms })
    const cell = screen.getByLabelText(/January 5, 2024/i)
    expect(cell.querySelector('span[aria-hidden="true"]')).toBeTruthy()
  })

  it('marks a day with a note bar', () => {
    const hasNote = vi.fn((date: string) => date === '2024-01-08')
    renderCalendar({ hasNote })
    const cell = screen.getByLabelText(/January 8, 2024/i)
    expect(cell.querySelector('span[aria-hidden="true"]')).toBeTruthy()
  })
})
