import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, startOfDay } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format an ISO date string (`yyyy-MM-dd`) as a human readable label. */
export function formatDate(iso: string, pattern = 'MMM d, yyyy'): string {
  return format(parseISO(iso), pattern)
}

export function formatShortDate(iso: string): string {
  return format(parseISO(iso), 'MMM d')
}

export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

export function todayISO(): string {
  return format(startOfDay(new Date()), 'yyyy-MM-dd')
}

/** Round-trip safe clamp for percentages. */
export function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value))
}

export function mean(values: number[]): number | null {
  if (values.length === 0) return null
  return values.reduce((a, b) => a + b, 0) / values.length
}

export function standardDeviation(values: number[]): number {
  const avg = mean(values)
  if (avg === null) return 0
  const variance = values.reduce((a, b) => a + (b - avg) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

/** Trigger the native haptic pulse where supported (e.g. iOS Safari). */
export function hapticFeedback(enabled = true) {
  if (!enabled || typeof navigator === 'undefined') return
  try {
    navigator.vibrate?.(10)
  } catch {
    /* not supported */
  }
}

/** Fallback for browsers without `navigator.onLine` access in workers. */
export function isOnline(): boolean {
  return typeof navigator === 'undefined' ? true : navigator.onLine
}

/** Convert a Date to `yyyy-MM-dd` using the local timezone. */
export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/** Pluralize a label based on a count. */
export function pluralize(count: number, singular: string, plural?: string): string {
  return `${count} ${count === 1 ? singular : (plural ?? `${singular}s`)}`
}

/**
 * Time-of-day greeting for a given hour (0–23, local time). Takes a plain
 * hour rather than a `Date` so callers can supply a fixed fallback during
 * server rendering / before hydration without risking a mismatch against
 * the client's actual clock.
 */
export function getGreeting(hour: number): string {
  if (hour < 5) return 'Good night'
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Good night'
}

/** Appends a name to a greeting when one is available, e.g. "Good morning, Aanya". */
export function greetingWithName(greeting: string, name?: string | null): string {
  return name ? `${greeting}, ${name}` : greeting
}
