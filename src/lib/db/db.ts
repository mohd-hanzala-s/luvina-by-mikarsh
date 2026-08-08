import Dexie from 'dexie'
import type { Cycle, DayLog, Reminder, Settings } from '@/types'
import type { AuraSettings } from '@/types/aura'

export interface LuvinaDatabase extends Dexie {
  cycles: Dexie.Table<Cycle, number>
  logs: Dexie.Table<DayLog, string>
  reminders: Dexie.Table<Reminder, number>
  settings: Dexie.Table<Settings, number>
  auraSettings: Dexie.Table<AuraSettings, number>
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

// v3: Luvina Aura personal safety module configuration.
db.version(3).stores({
  auraSettings: '++id',
})

export { db }
