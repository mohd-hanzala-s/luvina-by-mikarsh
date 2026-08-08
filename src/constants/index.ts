import type { FlowLevel, Mood, NavItem, ReminderType, Symptom } from '@/types'

export const APP_NAME = 'Luvina'
export const APP_MAKER = 'Mikarsh'
export const APP_FULL_NAME = 'Luvina by Mikarsh'
export const APP_TAGLINE = 'Understand your cycle. Embrace your flow.'
export const APP_VERSION = '1.0.0'

/** Backup file format identifier + schema version for future migrations. */
export const BACKUP_FORMAT = 'luvina-backup'
export const BACKUP_SCHEMA_VERSION = 1
export const KDF_ITERATIONS = 310_000

export const DEFAULT_SETTINGS = {
  cycleLengthDefault: 28,
  periodLengthDefault: 5,
  lutealPhaseDays: 14,
  fertileWindowDays: 5,
  notificationsEnabled: true,
  hapticsEnabled: true,
} as const

/** Accepted password length for encrypted backups. */
export const BACKUP_PASSWORD_MIN_LENGTH = 8

/** Title used for the auto-managed daily backup reminder. */
export const BACKUP_REMINDER_TITLE = 'Back up your data'
/** Default fire time for the daily backup reminder (24h "HH:mm"). */
export const BACKUP_REMINDER_DEFAULT_TIME = '20:00'
/** A backup is considered stale after this many hours since `lastBackupAt`. */
export const BACKUP_STALE_HOURS = 24

/**
 * Google OAuth client id used for Drive backups. Configure it at build time
 * via `NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID` (see docs/google-drive-setup.md).
 * Empty means Drive backup is disabled in this build.
 */
export const GOOGLE_DRIVE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID ?? ''

/** OAuth scope: create/read files the app has created, never browse the whole Drive. */
export const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file'

export const MAX_NOTE_LENGTH = 400
export const MAX_TITLE_LENGTH = 80
export const MAX_NAME_LENGTH = 40

/** Bounds for the custom theme hue/saturation sliders. */
export const HUE_MIN = 0
export const HUE_MAX = 359
export const SATURATION_MIN = 10
export const SATURATION_MAX = 100

export const MOODS: { value: Mood; label: string }[] = [
  { value: 'great', label: 'Great' },
  { value: 'good', label: 'Good' },
  { value: 'okay', label: 'Okay' },
  { value: 'low', label: 'Low' },
  { value: 'sad', label: 'Sad' },
]

export const SYMPTOMS: { value: Symptom; label: string; emoji?: string }[] = [
  { value: 'cramps', label: '🌸 Cramps' },
  { value: 'backPain', label: '🌙 Back pain' },
  { value: 'headache', label: '☁️ Headache' },
  { value: 'fatigue', label: '🥱 Fatigue' },
  { value: 'moodSwings', label: '🌿 Mood swings' },
  { value: 'acne', label: '✨ Skin glow/acne' },
  { value: 'bloating', label: '🧸 Bloating' },
  { value: 'cravings', label: '🍫 Cravings' },
  { value: 'tenderBreasts', label: '🎀 Tender breasts' },
  { value: 'spotting', label: '💧 Spotting' },
]

export const FLOW_LEVELS: { value: FlowLevel; label: string; emoji?: string }[] = [
  { value: 'none', label: '✨ None' },
  { value: 'light', label: '💧 Light' },
  { value: 'medium', label: '💦 Medium' },
  { value: 'heavy', label: '🌊 Heavy' },
]

export const REGULARITY_OPTIONS: { value: 'regular' | 'irregular' | 'unsure'; label: string }[] = [
  { value: 'regular', label: 'Regular' },
  { value: 'irregular', label: 'Irregular' },
  { value: 'unsure', label: 'Not sure yet' },
]

export const HEALTH_CONDITIONS: { value: string; label: string }[] = [
  { value: 'pcos', label: 'PCOS' },
  { value: 'endometriosis', label: 'Endometriosis' },
  { value: 'thyroid', label: 'Thyroid' },
  { value: 'pregnancy', label: 'Pregnancy' },
  { value: 'postpartum', label: 'Postpartum' },
  { value: 'perimenopause', label: 'Perimenopause' },
  { value: 'menopause', label: 'Menopause' },
]

export const GOALS: { value: string; label: string }[] = [
  { value: 'track', label: 'Track my cycle' },
  { value: 'pregnancy-plan', label: 'Plan a pregnancy' },
  { value: 'prevention', label: 'Prevent pregnancy' },
  { value: 'insights', label: 'Understand my health' },
  { value: 'symptoms', label: 'Track symptoms' },
]

export const PRIVACY_CHOICES: { value: 'local' | 'cloud' | 'undecided'; label: string }[] = [
  { value: 'local', label: 'Local only' },
  { value: 'cloud', label: 'Cloud backup' },
  { value: 'undecided', label: 'Decide later' },
]

export const ANIMATION_INTENSITY: { value: 'reduced' | 'default' | 'lively'; label: string }[] = [
  { value: 'reduced', label: 'Reduced' },
  { value: 'default', label: 'Default' },
  { value: 'lively', label: 'Lively' },
]

export const REMINDER_TYPES: { value: ReminderType; label: string }[] = [
  { value: 'period', label: 'Expected period' },
  { value: 'medication', label: 'Medication' },
  { value: 'hydration', label: 'Hydration' },
  { value: 'doctor', label: 'Doctor appointment' },
  { value: 'custom', label: 'Custom reminder' },
]

/** Color tokens used for the calendar (kept in sync with globals.css HSL vars). */
export const DAY_KIND_COLORS: Record<
  string,
  { dot: string; bg: string; ring: string; label: string }
> = {
  period: {
    dot: 'hsl(var(--period))',
    bg: 'hsl(var(--period) / 0.16)',
    ring: 'hsl(var(--period))',
    label: 'Period',
  },
  predicted: {
    dot: 'hsl(var(--predicted))',
    bg: 'hsl(var(--predicted) / 0.16)',
    ring: 'hsl(var(--predicted))',
    label: 'Predicted period',
  },
  ovulation: {
    dot: 'hsl(var(--ovulation))',
    bg: 'hsl(var(--ovulation) / 0.16)',
    ring: 'hsl(var(--ovulation))',
    label: 'Ovulation',
  },
  fertile: {
    dot: 'hsl(var(--fertile))',
    bg: 'hsl(var(--fertile) / 0.14)',
    ring: 'hsl(var(--fertile))',
    label: 'Fertile window',
  },
  past: {
    dot: 'hsl(var(--muted-foreground))',
    bg: 'hsl(var(--muted-foreground) / 0.1)',
    ring: 'hsl(var(--muted-foreground))',
    label: 'Past',
  },
  neutral: {
    dot: 'hsl(var(--muted-foreground))',
    bg: 'transparent',
    ring: 'transparent',
    label: 'Today',
  },
}

export const PHASE_LABELS: Record<string, string> = {
  period: 'Period',
  follicular: 'Follicular phase',
  fertile: 'Fertile window',
  ovulation: 'Ovulation',
  luteal: 'Luteal phase',
  predicted: 'Predicted period',
}

export const PHASE_ACCENTS: Record<string, string> = {
  period: 'var(--period)',
  follicular: 'var(--fertile)',
  fertile: 'var(--fertile)',
  ovulation: 'var(--ovulation)',
  luteal: 'var(--predicted)',
  predicted: 'var(--predicted)',
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/about', label: 'About', icon: 'info' },
  { href: '/calendar', label: 'Calendar', icon: 'calendar' },
  { href: '/', label: 'Home', icon: 'home' },
  { href: '/insights', label: 'Insights', icon: 'insights' },
  { href: '/settings', label: 'Settings', icon: 'settings' },
]
