'use client'

import { format, parseISO } from 'date-fns'
import type { Reminder } from '@/types'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

/**
 * Notification scheduling for installed PWAs.
 *
 * Notifications are requested and fired entirely on-device. While the app is
 * open, timers trigger native notifications at each reminder's scheduled
 * time. Where the browser supports Notification Triggers (Chromium-based
 * Android), notifications can also be scheduled to fire while the app is
 * closed. Otherwise scheduling degrades gracefully — no server involved.
 */

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  try {
    const result = await Notification.requestPermission()
    return result === 'granted'
  } catch {
    return false
  }
}

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator
}

let timers: ReturnType<typeof setTimeout>[] = []

/** Cancel every previously scheduled in-app notification timer. */
export function clearScheduledNotifications() {
  timers.forEach(clearTimeout)
  timers = []
}

interface ScheduleEntry {
  id: number
  title: string
  at: Date
}

function showNativeNotification(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  try {
    new Notification(title, { body, icon: `${basePath}/icons/icon-192.png`, tag: 'luvina' })
  } catch {
    /* Notification API unavailable */
  }
}

/** Build the concrete notification entries for the next N days. */
function buildSchedule(
  reminders: Reminder[],
  predictedPeriodStart: string | null,
  horizonDays = 14,
): ScheduleEntry[] {
  const entries: ScheduleEntry[] = []
  const now = new Date()

  for (const reminder of reminders) {
    if (!reminder.enabled) continue
    const [h, m] = reminder.time.split(':').map(Number)
    if (Number.isNaN(h) || Number.isNaN(m)) continue

    if (reminder.type === 'period' && predictedPeriodStart) {
      const target = addDaysLocal(parseISO(predictedPeriodStart), -reminder.daysBefore)
      entries.push({
        id: reminder.id,
        title: reminder.title,
        at: new Date(target.getFullYear(), target.getMonth(), target.getDate(), h, m, 0),
      })
      continue
    }

    // Daily reminders fire every day within the horizon.
    for (let d = 0; d <= horizonDays; d++) {
      const day = addDaysLocal(now, d)
      const at = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m, 0)
      if (at <= now) continue
      if (reminder.repeat === 'none' && d > 0) continue
      entries.push({ id: reminder.id, title: reminder.title, at })
    }
  }

  return entries
}

/**
 * Schedule in-app notification timers for the given reminders. Call on app
 * mount and whenever reminders or predictions change.
 */
export function scheduleReminderNotifications(
  reminders: Reminder[],
  predictedPeriodStart: string | null,
  enabled: boolean,
) {
  clearScheduledNotifications()
  if (!enabled || !notificationsSupported()) return

  const entries = buildSchedule(reminders, predictedPeriodStart)
  for (const entry of entries) {
    const delay = entry.at.getTime() - Date.now()
    if (delay <= 0) continue
    const timer = setTimeout(() => {
      showNativeNotification(
        entry.title,
        `Due ${format(entry.at, 'h:mm a')}`,
      )
    }, delay)
    timers.push(timer)
  }
}

function addDaysLocal(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export { buildSchedule }
