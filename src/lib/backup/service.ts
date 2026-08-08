import { db } from '@/lib/db/db'
import { getCycles } from '@/lib/db/cycles'
import { getLogs } from '@/lib/db/logs'
import { getReminders } from '@/lib/db/reminders'
import { getSettings } from '@/lib/db/settings'
import { createBackup, openBackup } from '@/lib/backup/backup'
import type { BackupData } from '@/types'

/**
 * Backup orchestration: snapshot the entire local database, encrypt it, and
 * (on restore) replace local data with a decrypted snapshot.
 */

export async function exportBackup(passphrase: string): Promise<string> {
  const [cycles, logs, reminders, settings] = await Promise.all([
    getCycles(),
    getLogs(),
    getReminders(),
    getSettings(),
  ])

  const data: BackupData = {
    app: 'luvina',
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    cycles,
    logs,
    reminders,
    settings: {
      cycleLengthDefault: settings.cycleLengthDefault,
      periodLengthDefault: settings.periodLengthDefault,
      lutealPhaseDays: settings.lutealPhaseDays,
      fertileWindowDays: settings.fertileWindowDays,
      notificationsEnabled: settings.notificationsEnabled,
      hapticsEnabled: settings.hapticsEnabled,
      // Restoring a backup should not send someone with years of cycle
      // history back through first-run onboarding — carry the "already set
      // up" state along with the data it describes.
      onBoardingDone: settings.onBoardingDone,
      nameCaptureDismissed: settings.nameCaptureDismissed,
      theme: settings.theme,
      name: settings.name,
      themeId: settings.themeId,
      customPrimaryHue: settings.customPrimaryHue,
      customPrimarySaturation: settings.customPrimarySaturation,
      customAccentHue: settings.customAccentHue,
      customAccentSaturation: settings.customAccentSaturation,
      hueShift: settings.hueShift,
      age: settings.age,
      dateOfBirth: settings.dateOfBirth,
      heightCm: settings.heightCm,
      weightKg: settings.weightKg,
      regularity: settings.regularity,
      healthConditions: settings.healthConditions,
      goals: settings.goals,
      privacyChoice: settings.privacyChoice,
      animationIntensity: settings.animationIntensity,
      welcomeTourSeen: settings.welcomeTourSeen,
      productTourSeen: settings.productTourSeen,
      lastSeenVersion: settings.lastSeenVersion,
      whatsNewDismissed: settings.whatsNewDismissed,
      dismissedTips: settings.dismissedTips,
      driveEmail: settings.driveEmail,
      lastDriveBackupAt: settings.lastDriveBackupAt,
      driveAutoBackup: settings.driveAutoBackup,
    },
  }

  return createBackup(data, passphrase)
}

/** Restore the local database from a decrypted backup (destructive replace). */
export async function importBackup(payload: string, passphrase: string): Promise<BackupData> {
  const data = await openBackup(payload, passphrase)
  await db.transaction('rw', db.cycles, db.logs, db.reminders, db.settings, async () => {
    await db.cycles.clear()
    await db.logs.clear()
    await db.reminders.clear()
    await db.settings.clear()
    if (data.cycles.length) await db.cycles.bulkAdd(data.cycles as never[])
    if (data.logs.length) await db.logs.bulkAdd(data.logs as never[])
    if (data.reminders.length) await db.reminders.bulkAdd(data.reminders as never[])
    await db.settings.put({
      ...(await getSettings()),
      cycleLengthDefault: data.settings.cycleLengthDefault,
      periodLengthDefault: data.settings.periodLengthDefault,
      lutealPhaseDays: data.settings.lutealPhaseDays,
      fertileWindowDays: data.settings.fertileWindowDays,
      notificationsEnabled: data.settings.notificationsEnabled,
      hapticsEnabled: data.settings.hapticsEnabled,
      // Restores alongside the data it describes, so a backup full of
      // history doesn't get funneled back through first-run onboarding.
      onBoardingDone: data.settings.onBoardingDone,
      nameCaptureDismissed: data.settings.nameCaptureDismissed,
      // Personalization (name + theme) restores automatically too, so the
      // app feels like "yours" again immediately after importing a backup.
      theme: data.settings.theme,
      name: data.settings.name,
      themeId: data.settings.themeId,
      customPrimaryHue: data.settings.customPrimaryHue,
      customPrimarySaturation: data.settings.customPrimarySaturation,
      customAccentHue: data.settings.customAccentHue,
      customAccentSaturation: data.settings.customAccentSaturation,
      hueShift: data.settings.hueShift,
      age: data.settings.age,
      dateOfBirth: data.settings.dateOfBirth,
      heightCm: data.settings.heightCm,
      weightKg: data.settings.weightKg,
      regularity: data.settings.regularity,
      healthConditions: data.settings.healthConditions,
      goals: data.settings.goals,
      privacyChoice: data.settings.privacyChoice,
      animationIntensity: data.settings.animationIntensity,
      welcomeTourSeen: data.settings.welcomeTourSeen,
      productTourSeen: data.settings.productTourSeen,
      lastSeenVersion: data.settings.lastSeenVersion,
      whatsNewDismissed: data.settings.whatsNewDismissed,
      dismissedTips: data.settings.dismissedTips,
      // Drive connection metadata (not the passphrase — that stays device-local).
      driveEmail: data.settings.driveEmail,
      lastDriveBackupAt: data.settings.lastDriveBackupAt,
      driveAutoBackup: data.settings.driveAutoBackup,
      updatedAt: Date.now(),
    })
  })
  return data
}

/** Wipe all user data from the local database. */
export async function clearAllData(): Promise<void> {
  await db.transaction('rw', db.cycles, db.logs, db.reminders, db.settings, async () => {
    await db.cycles.clear()
    await db.logs.clear()
    await db.reminders.clear()
    await db.settings.clear()
  })
}
