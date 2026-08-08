import { describe, expect, it } from 'vitest'
import { backupFileName, createBackup, isBackupStale, openBackup } from '@/lib/backup/backup'
import type { BackupData } from '@/types'

const sampleData: BackupData = {
  app: 'luvina',
  schemaVersion: 1,
  exportedAt: '2024-01-01T00:00:00.000Z',
  cycles: [{ id: 1, startDate: '2024-01-01', endDate: '2024-01-05', createdAt: 0, updatedAt: 0 }],
  logs: [
    {
      date: '2024-01-02',
      flow: 'medium',
      symptoms: ['cramps'],
      mood: 'okay',
      note: 'a note',
      medication: null,
      doctorVisit: null,
      createdAt: 0,
      updatedAt: 0,
    },
  ],
  reminders: [
    {
      id: 1,
      type: 'hydration',
      title: 'Drink water',
      time: '14:00',
      daysBefore: 0,
      repeat: 'daily',
      enabled: true,
      createdAt: 0,
    },
  ],
  settings: {
    cycleLengthDefault: 28,
    periodLengthDefault: 5,
    lutealPhaseDays: 14,
    fertileWindowDays: 5,
    notificationsEnabled: true,
    hapticsEnabled: true,
    onBoardingDone: true,
    nameCaptureDismissed: true,
    theme: 'system',
    name: 'Aanya',
    themeId: 'royal-purple',
    customPrimaryHue: 345,
    customPrimarySaturation: 84,
    customAccentHue: 292,
    customAccentSaturation: 70,
    hueShift: 275,
  },
}

describe('backup', () => {
  it('creates an encrypted envelope and restores the original data', async () => {
    const payload = await createBackup(sampleData, 'a-strong-passphrase')
    expect(payload).toContain('AES-GCM')

    const restored = await openBackup(payload, 'a-strong-passphrase')
    expect(restored).toEqual(sampleData)
  })

  it('produces ciphertext that does not contain the plaintext', async () => {
    const payload = await createBackup(sampleData, 'a-strong-passphrase')
    expect(payload).not.toContain('a note')
    expect(payload).not.toContain('Drink water')
  })

  it('rejects a wrong passphrase', async () => {
    const payload = await createBackup(sampleData, 'a-strong-passphrase')
    await expect(openBackup(payload, 'wrong')).rejects.toThrow(/password/i)
  })

  it('rejects non-Luvina files', async () => {
    await expect(openBackup('{"hello":"world"}', 'pw')).rejects.toThrow(/not a Luvina backup/i)
    await expect(openBackup('not json at all', 'pw')).rejects.toThrow(/not a valid Luvina backup/i)
  })

  it('rejects backups from a newer app version', async () => {
    const payload = await createBackup(sampleData, 'a-strong-passphrase')
    const newer = payload.replace('"version": 1', '"version": 999')
    await expect(openBackup(newer, 'a-strong-passphrase')).rejects.toThrow(/newer version/i)
  })

  it('validates the decrypted contents', async () => {
    const envelope = JSON.parse(await createBackup(sampleData, 'pw'))
    // Flip a single character in the ciphertext so the GCM auth tag fails.
    const corrupted = envelope.ciphertext.replace(/^./, envelope.ciphertext[0] === 'A' ? 'B' : 'A')
    const broken = { ...envelope, ciphertext: corrupted }
    await expect(openBackup(JSON.stringify(broken), 'pw')).rejects.toThrow()
  })

  it('generates a dated file name', () => {
    expect(backupFileName()).toMatch(/^luvina-backup-\d{4}-\d{2}-\d{2}\.json$/)
  })
})

describe('isBackupStale', () => {
  const now = new Date(2024, 0, 10, 12, 0, 0)

  it('is stale when a backup has never been made', () => {
    expect(isBackupStale(null, now)).toBe(true)
  })

  it('is not stale within the last 24 hours', () => {
    const oneHourAgo = now.getTime() - 60 * 60 * 1000
    expect(isBackupStale(oneHourAgo, now)).toBe(false)
  })

  it('is stale at exactly 24 hours', () => {
    const exactly24hAgo = now.getTime() - 24 * 60 * 60 * 1000
    expect(isBackupStale(exactly24hAgo, now)).toBe(true)
  })

  it('is stale well beyond 24 hours', () => {
    const threeDaysAgo = now.getTime() - 3 * 24 * 60 * 60 * 1000
    expect(isBackupStale(threeDaysAgo, now)).toBe(true)
  })
})
