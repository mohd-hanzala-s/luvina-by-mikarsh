import { db } from '@/lib/db/db'
import { DEFAULT_SETTINGS } from '@/constants'
import { DEFAULT_HUE_SHIFT, DEFAULT_THEME_ID, getDefaultPreset } from '@/lib/theme/presets'
import type { Settings, ThemePreference } from '@/types'

/**
 * Settings repository. Settings live in a single Dexie row (id = 1) so they
 * are written and read through the same offline-friendly IndexedDB pipeline.
 */

export const SETTINGS_ROW_ID = 1

const DEFAULT_SETTINGS_ROW: Settings = {
  id: SETTINGS_ROW_ID,
  theme: 'light',
  cycleLengthDefault: DEFAULT_SETTINGS.cycleLengthDefault,
  periodLengthDefault: DEFAULT_SETTINGS.periodLengthDefault,
  lutealPhaseDays: DEFAULT_SETTINGS.lutealPhaseDays,
  fertileWindowDays: DEFAULT_SETTINGS.fertileWindowDays,
  notificationsEnabled: DEFAULT_SETTINGS.notificationsEnabled,
  hapticsEnabled: DEFAULT_SETTINGS.hapticsEnabled,
  lastBackupAt: null,
  onBoardingDone: false,
  name: null,
  nameCaptureDismissed: false,
  themeId: DEFAULT_THEME_ID,
  customPrimaryHue: getDefaultPreset().primaryHue,
  customPrimarySaturation: getDefaultPreset().primarySaturation,
  customAccentHue: getDefaultPreset().accentHue,
  customAccentSaturation: getDefaultPreset().accentSaturation,
  hueShift: DEFAULT_HUE_SHIFT,
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

export async function getSettings(): Promise<Settings> {
  const existing = await db.settings.get(SETTINGS_ROW_ID)
  if (existing) return existing
  await db.settings.put(DEFAULT_SETTINGS_ROW)
  return DEFAULT_SETTINGS_ROW
}

export async function updateSettings(
  patch: Partial<Omit<Settings, 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<void> {
  const current = await getSettings()
  await db.settings.put({
    ...current,
    ...patch,
    updatedAt: Date.now(),
  })
}

export async function setThemePreference(theme: ThemePreference): Promise<void> {
  await updateSettings({ theme })
}

export async function setLastBackupAt(timestamp: number): Promise<void> {
  await updateSettings({ lastBackupAt: timestamp })
}

/** Store the person's name (or clear it) and mark the first-run prompt as answered. */
export async function setName(name: string | null): Promise<void> {
  await updateSettings({ name, nameCaptureDismissed: true })
}

/** Switch to a curated preset by id. */
export async function setThemePreset(themeId: string): Promise<void> {
  await updateSettings({ themeId })
}

/** Apply custom hue/saturation values and switch to the `'custom'` theme so they take effect. */
export async function setCustomTheme(
  values: Partial<
    Pick<
      Settings,
      | 'customPrimaryHue'
      | 'customPrimarySaturation'
      | 'customAccentHue'
      | 'customAccentSaturation'
      | 'hueShift'
    >
  >,
): Promise<void> {
  await updateSettings({ ...values, themeId: 'custom' })
}

/** Reset personalization (theme + custom hue/saturation) back to Luvina's signature look. Does not touch the name. */
export async function resetPersonalization(): Promise<void> {
  const preset = getDefaultPreset()
  await updateSettings({
    themeId: DEFAULT_THEME_ID,
    customPrimaryHue: preset.primaryHue,
    customPrimarySaturation: preset.primarySaturation,
    customAccentHue: preset.accentHue,
    customAccentSaturation: preset.accentSaturation,
    hueShift: DEFAULT_HUE_SHIFT,
  })
}

export async function setAnimationIntensity(
  intensity: 'reduced' | 'default' | 'lively',
): Promise<void> {
  await updateSettings({ animationIntensity: intensity })
}

export async function setPersonalProfile(
  patch: Partial<
    Pick<
      Settings,
      'age' | 'dateOfBirth' | 'heightCm' | 'weightKg' | 'regularity' | 'healthConditions' | 'goals' | 'privacyChoice'
    >
  >,
): Promise<void> {
  await updateSettings(patch)
}

/** Mark the first-launch welcome walkthrough as seen (or skipped). */
export async function setWelcomeTourSeen(seen = true): Promise<void> {
  await updateSettings({ welcomeTourSeen: seen })
}

/** Mark the guided product tour as seen (completed or dismissed). */
export async function setProductTourSeen(seen = true): Promise<void> {
  await updateSettings({ productTourSeen: seen })
}

/** Record the app version the user has seen and clear the What's New flag for it. */
export async function setVersionSeen(version: string): Promise<void> {
  await updateSettings({ lastSeenVersion: version, whatsNewDismissed: true })
}

/** Dismiss a smart tip by id so it is not shown again. */
export async function dismissTip(tipId: string): Promise<void> {
  const current = await getSettings()
  const list = current.dismissedTips ?? []
  if (!list.includes(tipId)) {
    await updateSettings({ dismissedTips: [...list, tipId] })
  }
}

/** Store the Google account connected for Drive backups (or clear it). */
export async function setDriveConnection(email: string | null): Promise<void> {
  await updateSettings({ driveEmail: email })
}

/** Remember (or clear) the on-device passphrase used for automatic Drive backups. */
export async function setDrivePassphrase(passphrase: string | null): Promise<void> {
  await updateSettings({ drivePassphrase: passphrase })
}

/** Record the time of the last successful upload to Google Drive (or clear it). */
export async function setLastDriveBackupAt(timestamp: number | null): Promise<void> {
  await updateSettings({ lastDriveBackupAt: timestamp })
}

/** Toggle automatic Drive backups. */
export async function setDriveAutoBackup(enabled: boolean): Promise<void> {
  await updateSettings({ driveAutoBackup: enabled })
}
