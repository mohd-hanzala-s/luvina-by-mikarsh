import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/lib/db/db'
import {
  getSettings,
  setDriveAutoBackup,
  setDriveConnection,
  setDrivePassphrase,
  setLastDriveBackupAt,
} from '@/lib/db/settings'
import { exportBackup, importBackup } from '@/lib/backup/service'

async function resetDb() {
  await db.transaction('rw', db.settings, async () => {
    await db.settings.clear()
  })
}

describe('drive backup settings', () => {
  beforeEach(resetDb)

  it('persists the drive connection fields', async () => {
    await getSettings()
    await setDriveConnection('me@example.com')
    await setDrivePassphrase('secret-passphrase')
    await setLastDriveBackupAt(1_234_567)
    await setDriveAutoBackup(true)

    const settings = await getSettings()
    expect(settings.driveEmail).toBe('me@example.com')
    expect(settings.drivePassphrase).toBe('secret-passphrase')
    expect(settings.lastDriveBackupAt).toBe(1_234_567)
    expect(settings.driveAutoBackup).toBe(true)
  })

  it('clears the drive connection on disconnect', async () => {
    await getSettings()
    await setDriveConnection('me@example.com')
    await setDriveConnection(null)

    const settings = await getSettings()
    expect(settings.driveEmail).toBeNull()
  })

  it('exports drive metadata but never the passphrase', async () => {
    await getSettings()
    await setDriveConnection('me@example.com')
    await setDrivePassphrase('secret-passphrase')
    await setLastDriveBackupAt(1_234_567)
    await setDriveAutoBackup(true)

    const payload = await exportBackup('backup-password-123')
    const data = await importBackup(payload, 'backup-password-123')

    expect(data.settings.driveEmail).toBe('me@example.com')
    expect(data.settings.lastDriveBackupAt).toBe(1_234_567)
    expect(data.settings.driveAutoBackup).toBe(true)
    expect(data.settings).not.toHaveProperty('drivePassphrase')
  })
})
