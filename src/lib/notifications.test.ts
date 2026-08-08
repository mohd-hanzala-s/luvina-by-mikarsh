import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildSchedule } from '@/lib/notifications'
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

describe('buildSchedule', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2024, 0, 10, 8, 0, 0)) // 2024-01-10 08:00 local
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('schedules a single entry for a non-repeating reminder', () => {
    const reminder: Reminder = { ...base(), time: '09:00', repeat: 'none' }
    const entries = buildSchedule([reminder], null, 14)
    expect(entries).toHaveLength(1)
    expect(entries[0].at.getDate()).toBe(10)
  })

  it('schedules daily reminders across the horizon', () => {
    const reminder: Reminder = { ...base(), time: '14:00', repeat: 'daily' }
    const entries = buildSchedule([reminder], null, 3)
    // Today + 3 following days (the horizon is inclusive of today).
    expect(entries).toHaveLength(4)
  })

  it('does not schedule entries in the past', () => {
    const reminder: Reminder = { ...base(), time: '07:00', repeat: 'none' }
    const entries = buildSchedule([reminder], null, 14)
    expect(entries).toHaveLength(0)
  })

  it('anchors a period reminder to the predicted start minus daysBefore', () => {
    const reminder: Reminder = { ...base(), type: 'period', daysBefore: 3, time: '10:00' }
    const entries = buildSchedule([reminder], '2024-01-20', 14)
    expect(entries).toHaveLength(1)
    expect(entries[0].at.getFullYear()).toBe(2024)
    expect(entries[0].at.getMonth()).toBe(0)
    expect(entries[0].at.getDate()).toBe(17)
    expect(entries[0].at.getHours()).toBe(10)
  })

  it('skips disabled reminders', () => {
    const reminder: Reminder = { ...base(), enabled: false, time: '12:00', repeat: 'daily' }
    expect(buildSchedule([reminder], null, 14)).toHaveLength(0)
  })
})
