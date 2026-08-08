import Dexie from 'dexie'
import type { Cycle, DayLog, Reminder, Settings } from '@/types'

export interface LuvinaDatabase extends Dexie {
  cycles: Dexie.Table<Cycle, number>
  logs: Dexie.Table<DayLog, string>
  reminders: Dexie.Table<Reminder, number>
  settings: Dexie.Table<Settings, number>
}

const db = new Dexie('luvina') as LuvinaDatabase

db.version(1).stores({
  cycles: '++id, startDate, endDate, createdAt',
  logs: 'date, flow, mood, *symptoms, createdAt',
  reminders: '++id, type, enabled',
  settings: '++id',
})

// v2: index `reminders.time` so reminders can be ordered by scheduled time.
db.version(2).stores({
  reminders: '++id, type, time, enabled',
})

export { db }
