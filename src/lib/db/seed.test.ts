import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/lib/db/db'
import { seedSampleData } from '@/lib/db/seed'
import { computeStats, getCycleState } from '@/lib/cycle/calculations'
import { DEFAULT_SETTINGS } from '@/constants'
import { todayISO } from '@/lib/utils'

async function resetDb() {
  await db.transaction('rw', db.cycles, db.logs, db.reminders, db.settings, async () => {
    await db.cycles.clear()
    await db.logs.clear()
    await db.reminders.clear()
    await db.settings.clear()
  })
}

describe('seedSampleData', () => {
  beforeEach(resetDb)

  it('populates cycles, logs, reminders and settings', async () => {
    await seedSampleData()
    expect(await db.cycles.count()).toBe(6)
    expect(await db.logs.count()).toBeGreaterThan(20)
    expect(await db.reminders.count()).toBe(2)
    const settings = await db.settings.get(1)
    expect(settings?.onBoardingDone).toBe(true)
  })

  it('is deterministic across runs', async () => {
    await seedSampleData()
    const first = await db.cycles.toArray()
    await resetDb()
    await seedSampleData()
    const second = await db.cycles.toArray()
    expect(second.map((c) => c.startDate)).toEqual(first.map((c) => c.startDate))
  })

  it('produces a usable cycle state and stats', async () => {
    await seedSampleData()
    const cycles = await db.cycles.toArray()
    const stats = computeStats(cycles)
    expect(stats.cyclesLogged).toBe(5)
    expect(stats.averageCycle).toBeGreaterThan(20)
    expect(stats.longestCycle).not.toBeNull()

    const state = getCycleState(cycles, todayISO(), DEFAULT_SETTINGS)
    expect(state.cycleDay).not.toBeNull()
    expect(['period', 'follicular', 'fertile', 'ovulation', 'luteal']).toContain(state.phase)
  })
})
