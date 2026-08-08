import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getNextUpcomingReminder } from '@/lib/reminders/upcoming'
import type { Reminder } from '@/types'

const base = (): Reminder => ({
  id: 1,
  type: 'custom',
  title: 'Custom',
  time: '09:00',
  daysBefore: 0,
  repeat: 'none',
  enabled: true,
  createdAt: 0,
})

describe('getNextUpcomingReminder', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2024, 0, 10, 12, 0, 0)) // Wed 2024-01-10 12:00 local
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the next daily reminder today if not yet passed', () => {
    const reminder: Reminder = { ...base(), time: '15:00', repeat: 'daily' }
    const upcoming = getNextUpcomingReminder([reminder], null, '2024-01-10')
    expect(upcoming).not.toBeNull()
    expect(upcoming?.at.getHours()).toBe(15)
    expect(upcoming?.date).toBe('2024-01-10')
  })

  it('skips a daily reminder whose time has already passed today', () => {
    const reminder: Reminder = { ...base(), time: '08:00', repeat: 'daily' }
    const upcoming = getNextUpcomingReminder([reminder], null, '2024-01-10')
    expect(upcoming?.date).toBe('2024-01-11')
  })

  it('does not show a one-time reminder as upcoming tomorrow once its time has passed today', () => {
    // Matches `buildSchedule` in lib/notifications.ts, which only ever
    // schedules a `repeat: 'none'` ("Once") reminder for the current day.
    const reminder: Reminder = { ...base(), time: '08:00', repeat: 'none' }
    const upcoming = getNextUpcomingReminder([reminder], null, '2024-01-10')
    expect(upcoming).toBeNull()
  })

  it('ignores disabled reminders', () => {
    const reminder: Reminder = { ...base(), time: '23:00', enabled: false }
    expect(getNextUpcomingReminder([reminder], null, '2024-01-10')).toBeNull()
  })

  it('picks the soonest reminder across multiple entries', () => {
    const later: Reminder = { ...base(), id: 1, time: '18:00', repeat: 'daily' }
    const sooner: Reminder = { ...base(), id: 2, time: '13:00', repeat: 'daily' }
    const upcoming = getNextUpcomingReminder([later, sooner], null, '2024-01-10')
    expect(upcoming?.at.getHours()).toBe(13)
  })

  it('anchors a period reminder to the predicted start minus daysBefore', () => {
    const reminder: Reminder = { ...base(), type: 'period', title: 'Period soon', daysBefore: 2 }
    const upcoming = getNextUpcomingReminder([reminder], '2024-01-20', '2024-01-10')
    expect(upcoming).not.toBeNull()
    expect(upcoming?.date).toBe('2024-01-18')
    expect(upcoming?.at.getHours()).toBe(9)
  })

  it('ignores a period reminder whose target has already passed', () => {
    const reminder: Reminder = { ...base(), type: 'period', daysBefore: 2 }
    expect(getNextUpcomingReminder([reminder], '2024-01-09', '2024-01-10')).toBeNull()
  })
})
