import { db } from '@/lib/db/db'
import { MAX_NOTE_LENGTH } from '@/constants'
import type { DayLog, EnergyLevel, FlowLevel, HydrationLevel, Mood, PainLevel, Symptom } from '@/types'

/**
 * Daily journal repository.
 * Each calendar day can carry a mood, energy, pain, sleep, hydration, flow,
 * symptoms and free text.
 */

const emptyLog = (date: string): DayLog => ({
  date,
  flow: 'none',
  symptoms: [],
  mood: null,
  energy: null,
  pain: null,
  sleep: null,
  hydration: null,
  note: null,
  medication: null,
  doctorVisit: null,
  createdAt: Date.now(),
  updatedAt: Date.now(),
})

export async function getLog(date: string): Promise<DayLog | undefined> {
  return db.logs.get(date)
}

export async function getLogs(): Promise<DayLog[]> {
  return db.logs.toArray()
}

function normalizeNote(value: string | null | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.slice(0, MAX_NOTE_LENGTH)
}

/** Merge a patch into an existing log (or create it). */
export async function upsertLog(
  date: string,
  patch: Partial<
    Pick<
      DayLog,
      | 'flow'
      | 'symptoms'
      | 'mood'
      | 'energy'
      | 'pain'
      | 'sleep'
      | 'hydration'
      | 'note'
      | 'medication'
      | 'doctorVisit'
    >
  >,
): Promise<void> {
  await db.transaction('rw', db.logs, async () => {
    const existing = await db.logs.get(date)
    if (!existing) {
      const log: DayLog = {
        ...emptyLog(date),
        ...patch,
        note: normalizeNote(patch.note),
        medication: normalizeNote(patch.medication),
        doctorVisit: normalizeNote(patch.doctorVisit),
      }
      await db.logs.put(log)
      return
    }
    await db.logs.update(date, {
      ...patch,
      note: patch.note === undefined ? existing.note : normalizeNote(patch.note),
      medication:
        patch.medication === undefined ? existing.medication : normalizeNote(patch.medication),
      doctorVisit:
        patch.doctorVisit === undefined ? existing.doctorVisit : normalizeNote(patch.doctorVisit),
      updatedAt: Date.now(),
    })
  })
}

export async function setFlow(date: string, flow: FlowLevel): Promise<void> {
  await upsertLog(date, { flow })
}

export async function toggleSymptom(date: string, symptom: Symptom): Promise<void> {
  const existing = await db.logs.get(date)
  const symptoms = existing?.symptoms ?? []
  const next = symptoms.includes(symptom)
    ? symptoms.filter((s) => s !== symptom)
    : [...symptoms, symptom]
  await upsertLog(date, { symptoms: next })
}

export async function setMood(date: string, mood: Mood | null): Promise<void> {
  await upsertLog(date, { mood })
}

export async function setEnergy(date: string, energy: EnergyLevel | null): Promise<void> {
  await upsertLog(date, { energy })
}

export async function setPain(date: string, pain: PainLevel | null): Promise<void> {
  await upsertLog(date, { pain })
}

export async function setSleep(date: string, sleep: number | null): Promise<void> {
  await upsertLog(date, { sleep })
}

export async function setHydration(date: string, hydration: HydrationLevel | null): Promise<void> {
  await upsertLog(date, { hydration })
}

export async function deleteLog(date: string): Promise<void> {
  await db.logs.delete(date)
}
