import { addDays, format, subDays } from 'date-fns'
import { db } from '@/lib/db/db'
import { updateSettings } from '@/lib/db/settings'
import { createReminder } from '@/lib/db/reminders'
import type { Cycle, DayLog, Symptom } from '@/types'

/**
 * Deterministic sample data used to explore the app and to smoke-test the UI.
 * Seeded so the same data is produced on every run.
 */

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const iso = (d: Date) => format(d, 'yyyy-MM-dd')

export async function seedSampleData(): Promise<void> {
  const rng = mulberry32(20260804)
  const today = new Date()

  const periods: { start: Date; end: Date; length: number }[] = []
  let cursor = subDays(today, 165)
  for (let i = 0; i < 6; i++) {
    const length = 4 + Math.floor(rng() * 3) // 4-6 days
    const start = cursor
    const end = addDays(start, length - 1)
    periods.push({ start, end, length })
    cursor = addDays(end, 26 + Math.floor(rng() * 5)) // 26-30 day cycles
  }

  const now = Date.now()
  const todayIso = iso(today)
  const lastPeriod = periods.at(-1) as { start: Date; end: Date }
  const lastIsOpen = todayIso >= iso(lastPeriod.start) && todayIso <= iso(lastPeriod.end)
  const cycles: Omit<Cycle, 'id'>[] = periods.map((p, i) => ({
    startDate: iso(p.start),
    endDate: i === periods.length - 1 && lastIsOpen ? null : iso(p.end),
    createdAt: now,
    updatedAt: now,
  }))

  // Logs: symptoms during period days, moods/notes throughout.
  const logs: DayLog[] = []
  for (const period of periods) {
    for (let d = 0; d < period.length; d++) {
      const date = addDays(period.start, d)
      const symptoms: Symptom[] = []
      if (d === 0 || d === 1) {
        symptoms.push('cramps', 'fatigue')
        if (rng() > 0.5) symptoms.push('backPain')
      } else if (d === 2) {
        symptoms.push('headache')
      } else if (d === period.length - 1) {
        symptoms.push('spotting')
      }
      if (rng() > 0.7) symptoms.push('bloating')
      logs.push({
        date: iso(date),
        flow: d === 0 ? 'heavy' : d <= period.length - 2 ? 'medium' : 'light',
        symptoms,
        mood: ['great', 'good', 'okay', 'low'][Math.floor(rng() * 4)] as DayLog['mood'],
        note: d === 1 ? 'Slept well, a little achy in the morning.' : null,
        medication: d === 0 ? 'Ibuprofen 400 mg' : null,
        doctorVisit: null,
        createdAt: now,
        updatedAt: now,
      })
    }
  }

  // A couple of mid-cycle notes.
  const midCycle = addDays(periods[2].start, 14)
  logs.push({
    date: iso(midCycle),
    flow: 'none',
    symptoms: [],
    mood: 'great',
    note: 'Feeling energetic today. Long walk at lunch.',
    medication: null,
    doctorVisit: null,
    createdAt: now,
    updatedAt: now,
  })

  await db.transaction('rw', db.cycles, db.logs, db.reminders, async () => {
    await db.cycles.clear()
    await db.logs.clear()
    await db.reminders.clear()
    if (cycles.length) await db.cycles.bulkAdd(cycles as never[])
    if (logs.length) await db.logs.bulkAdd(logs as never[])
  })

  await createReminder({
    type: 'period',
    title: 'Your period is expected soon',
    time: '09:00',
    daysBefore: 2,
    repeat: 'none',
    enabled: true,
  })
  await createReminder({
    type: 'hydration',
    title: 'Drink a glass of water',
    time: '14:00',
    daysBefore: 0,
    repeat: 'daily',
    enabled: true,
  })

  await updateSettings({
    onBoardingDone: true,
    nameCaptureDismissed: true,
    welcomeTourSeen: true,
    productTourSeen: true,
  })
}
