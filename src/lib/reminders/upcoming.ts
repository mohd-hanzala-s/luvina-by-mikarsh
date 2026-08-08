import { addDays, format, parseISO } from 'date-fns'
import type { Reminder } from '@/types'

export interface UpcomingReminder {
  title: string
  time: string
  date: string
  at: Date
}

const localDate = (d: Date) => format(d, 'yyyy-MM-dd')

/**
 * Find the next enabled reminder that will fire, used by the Home screen.
 * Period reminders are anchored to the predicted period start.
 */
export function getNextUpcomingReminder(
  reminders: Reminder[],
  predictedPeriodStart: string | null,
  today: string,
): UpcomingReminder | null {
  const now = new Date()
  const todayDate = parseISO(today)
  let best: UpcomingReminder | null = null

  for (const reminder of reminders) {
    if (!reminder.enabled) continue
    const [h, m] = reminder.time.split(':').map(Number)
    if (Number.isNaN(h) || Number.isNaN(m)) continue

    if (reminder.type === 'period' && predictedPeriodStart) {
      const target = addDays(parseISO(predictedPeriodStart), -reminder.daysBefore)
      if (target >= todayDate) {
        const at = new Date(target.getFullYear(), target.getMonth(), target.getDate(), h, m, 0)
        if (at > now) {
          const candidate: UpcomingReminder = {
            title: reminder.title,
            time: reminder.time,
            date: localDate(target),
            at,
          }
          if (!best || at < best.at) best = candidate
        }
      }
      continue
    }

    // Recurring ('daily') reminders: today if not yet passed, otherwise
    // tomorrow. One-time ('none' / "Once") reminders only ever get a timer
    // for the current day — see `buildSchedule` in `lib/notifications.ts` —
    // so mirror that here too: once today's time has passed, a 'none'
    // reminder has nothing upcoming, not "tomorrow".
    const days = reminder.repeat === 'none' ? [todayDate] : [todayDate, addDays(todayDate, 1)]
    for (const day of days) {
      const at = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m, 0)
      if (at <= now) continue
      const candidate: UpcomingReminder = {
        title: reminder.title,
        time: reminder.time,
        date: localDate(day),
        at,
      }
      if (!best || at < best.at) best = candidate
      break
    }
  }

  return best
}
