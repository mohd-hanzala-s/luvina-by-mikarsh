import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/lib/db/db'
import { startPeriod } from '@/lib/db/cycles'
import { upsertLog } from '@/lib/db/logs'
import { createReminder } from '@/lib/db/reminders'
import { updateSettings } from '@/lib/db/settings'
import { clearAllData, exportBackup, importBackup } from '@/lib/backup/service'

async function resetDb() {
  await db.transaction('rw', db.cycles, db.logs, db.reminders, db.settings, async () => {
    await db.cycles.clear()
    await db.logs.clear()
    await db.reminders.clear()
    await db.settings.clear()
  })
}

describe('backup service', () => {
  beforeEach(async () => {
    await resetDb()
  })

  it('exports and restores cycles, logs, reminders and settings', async () => {
    await startPeriod('2024-01-01')
    await updateSettings({
      cycleLengthDefault: 30,
      name: 'Aanya',
      themeId: 'lavender-dream',
      onBoardingDone: true,
      nameCaptureDismissed: true,
      notificationsEnabled: false,
      hapticsEnabled: false,
    })
    await createReminder({
      type: 'hydration',
      title: 'Drink water',
      time: '14:00',
      daysBefore: 0,
      repeat: 'daily',
      enabled: true,
    })
    await upsertLog('2024-01-02', { flow: 'medium', note: 'hello world' })

    const payload = await exportBackup('correct passphrase')

    // Wipe the database, then restore from the backup.
    await clearAllData()
    expect(await db.cycles.count()).toBe(0)

    const restored = await importBackup(payload, 'correct passphrase')
    expect(restored.cycles).toHaveLength(1)
    expect(restored.logs).toHaveLength(1)

    expect(await db.cycles.count()).toBe(1)
    expect(await db.logs.count()).toBe(1)
    expect(await db.reminders.count()).toBe(1)
    const settings = await db.settings.get(1)
    expect(settings?.cycleLengthDefault).toBe(30)
    expect(settings?.name).toBe('Aanya')
    expect(settings?.themeId).toBe('lavender-dream')
    // Restoring a backup full of history must not force first-run
    // onboarding again, and must not silently reset these two toggles.
    expect(settings?.onBoardingDone).toBe(true)
    expect(settings?.nameCaptureDismissed).toBe(true)
    expect(settings?.notificationsEnabled).toBe(false)
    expect(settings?.hapticsEnabled).toBe(false)
  })

  it('fails to import with a wrong passphrase and keeps data intact', async () => {
    await startPeriod('2024-01-01')
    const payload = await exportBackup('correct passphrase')

    await expect(importBackup(payload, 'wrong passphrase')).rejects.toThrow()
    expect(await db.cycles.count()).toBe(1)
  })

  it('clears all data', async () => {
    await startPeriod('2024-01-01')
    await createReminder({
      type: 'custom',
      title: 'x',
      time: '09:00',
      daysBefore: 0,
      repeat: 'none',
      enabled: true,
    })
    await clearAllData()
    expect(await db.cycles.count()).toBe(0)
    expect(await db.reminders.count()).toBe(0)
  })
})
