export type FlowLevel = 'none' | 'light' | 'medium' | 'heavy'

export type Mood = 'great' | 'good' | 'okay' | 'low' | 'sad'

export type EnergyLevel = 1 | 2 | 3 | 4 | 5

export type PainLevel = 0 | 1 | 2 | 3 | 4 | 5

export type HydrationLevel = 'low' | 'okay' | 'great'

export type Symptom =
  | 'cramps'
  | 'backPain'
  | 'headache'
  | 'fatigue'
  | 'moodSwings'
  | 'acne'
  | 'bloating'
  | 'cravings'
  | 'tenderBreasts'
  | 'spotting'

export type ReminderType = 'period' | 'medication' | 'hydration' | 'doctor' | 'custom' | 'backup'

export type ThemePreference = 'system' | 'light' | 'dark'

/** A logged menstrual period. `endDate` is null while the period is ongoing. */
export interface Cycle {
  id: number
  startDate: string
  endDate: string | null
  createdAt: number
  updatedAt: number
}

/** Per-day journal data. The date is the primary key (ISO `yyyy-MM-dd`). */
export interface DayLog {
  date: string
  flow: FlowLevel
  symptoms: Symptom[]
  mood: Mood | null
  energy?: EnergyLevel | null
  pain?: PainLevel | null
  sleep?: number | null
  hydration?: HydrationLevel | null
  note: string | null
  medication: string | null
  doctorVisit: string | null
  /** Base64 / Blob data URLs for attached image documentation (flow, discharge, notes). */
  images?: string[]
  createdAt: number
  updatedAt: number
}

export interface Reminder {
  id: number
  type: ReminderType
  title: string
  time: string
  /** Days before the predicted period that a "period" reminder should fire. */
  daysBefore: number
  /** When the reminder should repeat. */
  repeat: 'daily' | 'none'
  enabled: boolean
  createdAt: number
}

export interface Settings {
  id: number
  theme: ThemePreference
  cycleLengthDefault: number
  periodLengthDefault: number
  lutealPhaseDays: number
  fertileWindowDays: number
  notificationsEnabled: boolean
  hapticsEnabled: boolean
  lastBackupAt: number | null
  onBoardingDone: boolean
  /** What to call the person using the app. Null until they provide one. */
  name: string | null
  /** True once the first-run name prompt has been answered or skipped, so it never asks again. */
  nameCaptureDismissed: boolean
  /** Selected theme preset id, or `'custom'` when using the custom hue/saturation fields below. */
  themeId: string
  /** Primary hue (0-359) used when `themeId === 'custom'`. */
  customPrimaryHue: number
  /** Primary saturation (0-100) used when `themeId === 'custom'`. */
  customPrimarySaturation: number
  /** Accent hue (0-359) used when `themeId === 'custom'`. */
  customAccentHue: number
  /** Accent saturation (0-100) used when `themeId === 'custom'`. */
  customAccentSaturation: number
  /** Degrees added to the primary hue to derive the text/ink hue. */
  hueShift: number
  /** Optional age, used for personalized insight language. */
  age?: number | null
  /** Optional date of birth (ISO `yyyy-MM-dd`). */
  dateOfBirth?: string | null
  /** Optional height in centimetres. */
  heightCm?: number | null
  /** Optional weight in kilograms. */
  weightKg?: number | null
  /** How regular the person considers their cycle. */
  regularity?: 'regular' | 'irregular' | 'unsure' | null
  /** Health conditions the person has chosen to track (empty = none). */
  healthConditions?: string[]
  /** Personal goals chosen during setup. */
  goals?: string[]
  /** Privacy preference: local-only, cloud backup, or undecided. */
  privacyChoice?: 'local' | 'cloud' | 'undecided' | null
  /** Motion intensity: reduce animations, default, or make them lively. */
  animationIntensity?: 'reduced' | 'default' | 'lively'
  /** Whether the first-launch welcome walkthrough has been shown or skipped. */
  welcomeTourSeen?: boolean
  /** Whether the guided product tour has been completed or dismissed. */
  productTourSeen?: boolean
  /** Last app version the user has seen, used to surface "What's New". */
  lastSeenVersion?: string | null
  /** Whether the current version's "What's New" has been dismissed. */
  whatsNewDismissed?: boolean
  /** Ids of smart tips the user has dismissed. */
  dismissedTips?: string[]
  /** Email of the Google account connected for Drive backups, or null. */
  driveEmail?: string | null
  /**
   * Backup passphrase remembered on this device so automatic Drive backups
   * can encrypt without re-asking. Never exported inside backups.
   */
  drivePassphrase?: string | null
  /** Timestamp of the last successful upload to Google Drive. */
  lastDriveBackupAt?: number | null
  /** Whether automatic Drive backups are enabled. */
  driveAutoBackup?: boolean
  /** Stree Protocol emergency contact details for emergency dialing. */
  emergencyContactName?: string | null
  emergencyContactPhone?: string | null
  emergencyContactRelation?: string | null
  createdAt: number
  updatedAt: number
}

/** Lifecycle phases used across the UI. */
export type CyclePhase = 'period' | 'follicular' | 'fertile' | 'ovulation' | 'luteal' | 'predicted'

/** Color classification for a single calendar day. */
export type DayKind = 'period' | 'predicted' | 'ovulation' | 'fertile' | 'past' | 'neutral'

/** The exported, encrypted backup payload (plaintext schema). */
export interface BackupData {
  app: 'luvina'
  schemaVersion: number
  exportedAt: string
  cycles: Cycle[]
  logs: DayLog[]
  reminders: Reminder[]
  settings: Pick<
    Settings,
    | 'cycleLengthDefault'
    | 'periodLengthDefault'
    | 'lutealPhaseDays'
    | 'fertileWindowDays'
    | 'notificationsEnabled'
    | 'hapticsEnabled'
    | 'onBoardingDone'
    | 'nameCaptureDismissed'
    | 'theme'
    | 'name'
    | 'themeId'
    | 'customPrimaryHue'
    | 'customPrimarySaturation'
    | 'customAccentHue'
    | 'customAccentSaturation'
    | 'hueShift'
    | 'age'
    | 'dateOfBirth'
    | 'heightCm'
    | 'weightKg'
    | 'regularity'
    | 'healthConditions'
    | 'goals'
    | 'privacyChoice'
    | 'animationIntensity'
    | 'welcomeTourSeen'
    | 'productTourSeen'
    | 'lastSeenVersion'
    | 'whatsNewDismissed'
    | 'dismissedTips'
    | 'driveEmail'
    | 'lastDriveBackupAt'
    | 'driveAutoBackup'
  >
}

export interface CycleStats {
  averageCycle: number | null
  averagePeriod: number | null
  averageDelay: number | null
  longestCycle: number | null
  shortestCycle: number | null
  cyclesLogged: number
  consistencyScore: number | null
  predictionAccuracy: number | null
  cycleLengths: number[]
}

export interface CyclePrediction {
  predictedNextStart: string
  ovulationDay: string
  fertileWindowStart: string
  fertileWindowEnd: string
  mostFertileStart: string
  mostFertileEnd: string
  lutealPhaseDays: number
}

export interface CycleState {
  cycleDay: number | null
  phase: CyclePhase
  daysUntilPeriod: number | null
  daysIntoPeriod: number | null
  periodProgress: number | null
  currentCycleStart: string | null
  prediction: CyclePrediction | null
  stats: CycleStats
}

/** A resolved period with computed start/end dates. */
export interface PeriodSpan {
  start: string
  end: string
  length: number
}

export interface NavItem {
  href: string
  label: string
  icon: string
}
