import { db } from '@/lib/db/db'
import type { Reminder } from '@/types'

export async function getReminders(): Promise<Reminder[]> {
  return db.reminders.orderBy('time').toArray()
}

export async function getReminder(id: number): Promise<Reminder | undefined> {
  return db.reminders.get(id)
}

export async function createReminder(
  input: Omit<Reminder, 'id' | 'createdAt'>,
): Promise<number> {
  return db.reminders.add({
    ...input,
    createdAt: Date.now(),
  } as Reminder)
}

export async function updateReminder(
  id: number,
  patch: Partial<Omit<Reminder, 'id' | 'createdAt'>>,
): Promise<void> {
  await db.reminders.update(id, patch)
}

export async function deleteReminder(id: number): Promise<void> {
  await db.reminders.delete(id)
}
