import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/lib/db/db'
import {
  deleteCycle,
  endPeriod,
  getCycles,
  isPeriodDay,
  startPeriod,
  toPeriodSpans,
  updateCycle,
} from '@/lib/db/cycles'
import { getLog, setFlow, toggleSymptom, upsertLog } from '@/lib/db/logs'
import { getSettings, updateSettings } from '@/lib/db/settings'
import { createReminder, deleteReminder, getReminders, updateReminder } from '@/lib/db/reminders'

async function resetDb() {
  await db.transaction('rw', db.cycles, db.logs, db.reminders, db.settings, async () => {
    await db.cycles.clear()
    await db.logs.clear()
    await db.reminders.clear()
    await db.settings.clear()
  })
}

describe('cycles repository', () => {
  beforeEach(resetDb)

  it('starts a period and returns a stable id', async () => {
    const id = await startPeriod('2024-01-01')
    const cycle = await db.cycles.get(id)
    expect(cycle?.startDate).toBe('2024-01-01')
    expect(cycle?.endDate).toBeNull()
  })

  it('ends an open period on the given date', async () => {
    await startPeriod('2024-01-01')
    await endPeriod('2024-01-05')
    const cycles = await getCycles()
    expect(cycles[0].endDate).toBe('2024-01-05')
  })

  it('starts a new period and closes the previous one the day before', async () => {
    await startPeriod('2024-01-01')
    await startPeriod('2024-02-01')
    const cycles = await getCycles()
    expect(cycles).toHaveLength(2)
    const first = cycles.find((c) => c.startDate === '2024-01-01')
    expect(first?.endDate).toBe('2024-01-31')
    const second = cycles.find((c) => c.startDate === '2024-02-01')
    expect(second?.endDate).toBeNull()
  })

  it('updates a cycle and rejects an end before start', async () => {
    const id = await startPeriod('2024-01-01')
    await updateCycle(id, { endDate: '2024-01-07' })
    expect((await db.cycles.get(id))?.endDate).toBe('2024-01-07')
    await expect(updateCycle(id, { endDate: '2023-12-01' })).rejects.toThrow(/end date/i)
  })

  it('rejects updating a cycle that no longer exists instead of silently no-op-ing', async () => {
    const id = await startPeriod('2024-01-01')
    await deleteCycle(id)
    await expect(updateCycle(id, { endDate: '2024-01-07' })).rejects.toThrow(/no longer exists/i)
  })

  it('deletes a cycle', async () => {
    const id = await startPeriod('2024-01-01')
    await deleteCycle(id)
    expect(await db.cycles.count()).toBe(0)
  })

  it('reports whether a date falls inside a logged period', () => {
    const spans = toPeriodSpans([{ id: 1, startDate: '2024-01-01', endDate: '2024-01-05', createdAt: 0, updatedAt: 0 }])
    expect(isPeriodDay(spans, '2024-01-01')).toBe(true)
    expect(isPeriodDay(spans, '2024-01-05')).toBe(true)
    expect(isPeriodDay(spans, '2024-01-06')).toBe(false)
  })
})

describe('logs repository', () => {
  beforeEach(resetDb)

  it('upserts a log and persists patches', async () => {
    await upsertLog('2024-01-02', { note: 'first', flow: 'light' })
    await upsertLog('2024-01-02', { mood: 'good' })
    const log = await getLog('2024-01-02')
    expect(log?.note).toBe('first')
    expect(log?.flow).toBe('light')
    expect(log?.mood).toBe('good')
  })

  it('trims and caps notes to the maximum length', async () => {
    await upsertLog('2024-01-02', { note: '   padded   ' })
    expect((await getLog('2024-01-02'))?.note).toBe('padded')

    await upsertLog('2024-01-02', { note: 'x'.repeat(500) })
    expect((await getLog('2024-01-02'))?.note?.length).toBe(400)
  })

  it('sets flow and toggles symptoms', async () => {
    await setFlow('2024-01-02', 'heavy')
    await toggleSymptom('2024-01-02', 'cramps')
    await toggleSymptom('2024-01-02', 'fatigue')
    let log = await getLog('2024-01-02')
    expect(log?.flow).toBe('heavy')
    expect(log?.symptoms).toContain('cramps')
    expect(log?.symptoms).toContain('fatigue')

    await toggleSymptom('2024-01-02', 'cramps')
    log = await getLog('2024-01-02')
    expect(log?.symptoms).not.toContain('cramps')
  })
})

describe('settings repository', () => {
  beforeEach(resetDb)

  it('returns defaults when no row exists', async () => {
    const settings = await getSettings()
    expect(settings.cycleLengthDefault).toBe(28)
    expect(settings.id).toBe(1)
  })

  it('persists patches and keeps defaults for unspecified fields', async () => {
    await updateSettings({ cycleLengthDefault: 32 })
    const settings = await getSettings()
    expect(settings.cycleLengthDefault).toBe(32)
    expect(settings.periodLengthDefault).toBe(5)
  })
})

describe('reminders repository', () => {
  beforeEach(resetDb)

  it('creates, updates and deletes reminders', async () => {
    const id = await createReminder({
      type: 'hydration',
      title: 'Drink water',
      time: '14:00',
      daysBefore: 0,
      repeat: 'daily',
      enabled: true,
    })
    expect(await getReminders()).toHaveLength(1)

    await updateReminder(id, { enabled: false, title: 'Updated' })
    const reminders = await getReminders()
    expect(reminders[0].enabled).toBe(false)
    expect(reminders[0].title).toBe('Updated')

    await deleteReminder(id)
    expect(await getReminders()).toHaveLength(0)
  })
})
