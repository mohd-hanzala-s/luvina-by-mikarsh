'use client'

import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { CalendarDays, Check, Pill, Stethoscope } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { toast } from 'sonner'
import { db } from '@/lib/db/db'
import { deleteCycle, endPeriod, isPeriodDay, startPeriod } from '@/lib/db/cycles'
import {
  deleteLog,
  setEnergy,
  setFlow,
  setHydration,
  setMood,
  setPain,
  setSleep,
  toggleSymptom,
  upsertLog,
} from '@/lib/db/logs'
import { DAY_KIND_COLORS, FLOW_LEVELS, MOODS, SYMPTOMS } from '@/constants'
import { cn, formatShortDate, hapticFeedback } from '@/lib/utils'
import { useAppData } from '@/hooks/useAppData'
import type { EnergyLevel, FlowLevel, HydrationLevel, Mood, PainLevel } from '@/types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

const MOOD_EMOJI: Record<Mood, string> = {
  great: '🌟',
  good: '😊',
  okay: '😐',
  low: '😕',
  sad: '😢',
}

const ENERGY_LABELS = ['Drained', 'Low', 'Okay', 'Energetic', 'Buzzing']
const PAIN_LABELS = ['None', 'Mild', 'Uncomfortable', 'Noticeable', 'Strong', 'Severe']

const HYDRATION_OPTIONS: { value: HydrationLevel; label: string; emoji: string }[] = [
  { value: 'low', label: 'Low', emoji: '💧' },
  { value: 'okay', label: 'Okay', emoji: '💦' },
  { value: 'great', label: 'Great', emoji: '🌊' },
]

interface DayDetailSheetProps {
  date: string | null
  onOpenChange: (open: boolean) => void
}

export function DayDetailSheet({ date, onOpenChange }: DayDetailSheetProps) {
  const { periods, classify, haptics } = useDayDetailContext()

  const log = useLiveQuery(() => (date ? db.logs.get(date) : undefined), [date])
  const open = date !== null

  const [noteDraft, setNoteDraft] = useState('')
  const [medicationDraft, setMedicationDraft] = useState('')
  const [doctorDraft, setDoctorDraft] = useState('')
  const [energyDraft, setEnergyDraft] = useState(3)
  const [painDraft, setPainDraft] = useState(0)
  const [sleepDraft, setSleepDraft] = useState(7)
  const [hydrationDraft, setHydrationDraft] = useState<HydrationLevel | null>(null)

  useEffect(() => {
    setNoteDraft(log?.note ?? '')
    setMedicationDraft(log?.medication ?? '')
    setDoctorDraft(log?.doctorVisit ?? '')
  }, [log?.note, log?.medication, log?.doctorVisit, date])

  useEffect(() => {
    setEnergyDraft(log?.energy ?? 3)
    setPainDraft(log?.pain ?? 0)
    setSleepDraft(log?.sleep ?? 7)
    setHydrationDraft(log?.hydration ?? null)
  }, [log?.energy, log?.pain, log?.sleep, log?.hydration, date])

  if (!date) return null

  const kind = classify(date)
  const inPeriod = isPeriodDay(periods, date)
  const colors = DAY_KIND_COLORS[kind]
  const flow: FlowLevel = log?.flow ?? 'none'

  const flushTextFields = () => {
    return upsertLog(date, {
      note: noteDraft,
      medication: medicationDraft,
      doctorVisit: doctorDraft,
    })
  }

  const handleDone = async () => {
    await flushTextFields()
    hapticFeedback(haptics)
    onOpenChange(false)
  }

  const handleStartPeriod = async () => {
    await startPeriod(date)
    hapticFeedback(haptics)
    toast.success('Period started')
    onOpenChange(false)
  }

  const handleEndPeriod = async () => {
    await endPeriod(date)
    hapticFeedback(haptics)
    toast.success('Period ended')
    onOpenChange(false)
  }

  const handleDeleteLog = async () => {
    await deleteLog(date)
    toast.success('Entry removed')
  }

  const handleDeletePeriod = async () => {
    const spans = periods.filter((p) => p.start <= date && date <= p.end)
    if (spans.length === 0) return
    const match = spans[0]
    const id = await db.cycles
      .where('startDate')
      .equals(match.start)
      .first()
      .then((c) => c?.id)
    if (id) await deleteCycle(id)
    hapticFeedback(haptics)
    toast.success('Period removed')
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[92dvh] overflow-y-auto rounded-t-3xl p-0">
        <div className="mx-auto h-1.5 w-10 rounded-full bg-muted-foreground/25" />
        <SheetHeader className="px-6 pt-4">
          <SheetTitle className="flex items-center gap-2 text-lg">
            {format(parseISO(date), 'EEEE, MMMM d')}
            <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
              Quick Check-In
            </span>
          </SheetTitle>
          <SheetDescription className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
              <span className="size-2 rounded-full" style={{ backgroundColor: colors.ring }} />
              {colors.label}
            </span>
            {kind === 'predicted' && <span className="text-xs italic">Estimate</span>}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-6 pb-8 pt-4">
          {/* Period quick action */}
          <div className="flex gap-2">
            {!inPeriod ? (
              <Button className="flex-1" onClick={handleStartPeriod}>
                <CalendarDays aria-hidden="true" />
                Start period
              </Button>
            ) : (
              <Button className="flex-1" onClick={handleEndPeriod}>
                <CalendarDays aria-hidden="true" />
                End period
              </Button>
            )}
          </div>

          {/* Mood (emoji, quick tap) */}
          <section aria-label="Mood">
            <Label className="mb-2 block">How are you feeling?</Label>
            <div className="grid grid-cols-5 gap-2">
              {MOODS.map((mood) => {
                const selected = log?.mood === mood.value
                return (
                  <button
                    key={mood.value}
                    type="button"
                    aria-pressed={selected}
                    aria-label={`Mood: ${mood.label}`}
                    onClick={() => {
                      void setMood(date, selected ? null : mood.value)
                      hapticFeedback(haptics)
                    }}
                    className={cn(
                      'flex h-14 flex-col items-center justify-center gap-0.5 rounded-2xl border text-sm font-medium transition-all active:scale-90',
                      selected
                        ? 'border-primary bg-primary/10 text-primary shadow-soft'
                        : 'border-border text-muted-foreground hover:bg-accent',
                    )}
                  >
                    <span
                      className={cn(
                        'text-2xl transition-transform duration-150',
                        selected && 'scale-110',
                      )}
                      aria-hidden="true"
                    >
                      {MOOD_EMOJI[mood.value]}
                    </span>
                    <span className="text-[11px]">{mood.label}</span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Flow */}
          <section aria-label="Flow">
            <Label className="mb-2 block">Flow</Label>
            <div className="flex flex-wrap gap-2">
              {FLOW_LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  aria-pressed={flow === level.value}
                  onClick={() => {
                    void setFlow(date, level.value)
                    hapticFeedback(haptics)
                  }}
                  className={cn(
                    'h-10 rounded-full border px-4 text-sm font-medium transition-all active:scale-95',
                    flow === level.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:bg-accent',
                  )}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </section>

          {/* Energy */}
          <section aria-label="Energy">
            <div className="mb-2 flex items-center justify-between">
              <Label>Energy</Label>
              <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
                {ENERGY_LABELS[energyDraft - 1]}
              </span>
            </div>
            <Slider
              min={1}
              max={5}
              step={1}
              value={[energyDraft]}
              onValueChange={([v]) => setEnergyDraft(v)}
              onValueCommit={([v]) => {
                void setEnergy(date, v as EnergyLevel)
                hapticFeedback(haptics)
              }}
              aria-label="Energy level"
            />
          </section>

          {/* Sleep */}
          <section aria-label="Sleep">
            <div className="mb-2 flex items-center justify-between">
              <Label>Sleep</Label>
              <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
                {sleepDraft} hrs
              </span>
            </div>
            <Slider
              min={4}
              max={12}
              step={1}
              value={[sleepDraft]}
              onValueChange={([v]) => setSleepDraft(v)}
              onValueCommit={([v]) => {
                void setSleep(date, v)
                hapticFeedback(haptics)
              }}
              aria-label="Hours slept"
            />
          </section>

          {/* Pain */}
          <section aria-label="Pain">
            <div className="mb-2 flex items-center justify-between">
              <Label>Pain</Label>
              <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
                {PAIN_LABELS[painDraft]}
              </span>
            </div>
            <Slider
              min={0}
              max={5}
              step={1}
              value={[painDraft]}
              onValueChange={([v]) => setPainDraft(v)}
              onValueCommit={([v]) => {
                void setPain(date, v as PainLevel)
                hapticFeedback(haptics)
              }}
              aria-label="Pain level"
            />
          </section>

          {/* Hydration */}
          <section aria-label="Hydration">
            <Label className="mb-2 block">Hydration</Label>
            <div className="flex flex-wrap gap-2">
              {HYDRATION_OPTIONS.map((option) => {
                const selected = hydrationDraft === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      const next = selected ? null : option.value
                      setHydrationDraft(next)
                      void setHydration(date, next)
                      hapticFeedback(haptics)
                    }}
                    className={cn(
                      'flex h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-all active:scale-95',
                      selected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:bg-accent',
                    )}
                  >
                    <span aria-hidden="true">{option.emoji}</span>
                    {option.label}
                  </button>
                )
              })}
            </div>
          </section>

          {/* Symptoms */}
          <section aria-label="Symptoms">
            <Label className="mb-2 block">Symptoms</Label>
            <div className="grid grid-cols-2 gap-2">
              {SYMPTOMS.map((symptom) => {
                const selected = log?.symptoms.includes(symptom.value) ?? false
                return (
                  <button
                    key={symptom.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      void toggleSymptom(date, symptom.value)
                      hapticFeedback(haptics)
                    }}
                    className={cn(
                      'flex items-center justify-center rounded-input border px-3 py-2.5 text-sm font-medium transition-all active:scale-95',
                      selected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:bg-accent',
                    )}
                  >
                    {symptom.label}
                  </button>
                )
              })}
            </div>
          </section>

          {/* Journal */}
          <section aria-label="Journal" className="space-y-4">
            <div>
              <Label htmlFor="day-note">Notes</Label>
              <Textarea
                id="day-note"
                className="mt-2"
                placeholder="How are you feeling?"
                value={noteDraft}
                maxLength={400}
                onChange={(e) => setNoteDraft(e.target.value)}
                onBlur={flushTextFields}
              />
            </div>
            <div>
              <Label htmlFor="day-medication" className="flex items-center gap-1.5">
                <Pill className="size-3.5 text-muted-foreground" aria-hidden="true" />
                Medication
              </Label>
              <Textarea
                id="day-medication"
                className="mt-2 min-h-[64px]"
                placeholder="e.g. Ibuprofen 400 mg, 10am"
                value={medicationDraft}
                maxLength={400}
                onChange={(e) => setMedicationDraft(e.target.value)}
                onBlur={flushTextFields}
              />
            </div>
            <div>
              <Label htmlFor="day-doctor" className="flex items-center gap-1.5">
                <Stethoscope className="size-3.5 text-muted-foreground" aria-hidden="true" />
                Doctor visit
              </Label>
              <Textarea
                id="day-doctor"
                className="mt-2 min-h-[64px]"
                placeholder="Appointments, notes for your doctor"
                value={doctorDraft}
                maxLength={400}
                onChange={(e) => setDoctorDraft(e.target.value)}
                onBlur={flushTextFields}
              />
            </div>
          </section>

          {/* Done */}
          <Button className="w-full" size="lg" onClick={handleDone}>
            <Check aria-hidden="true" />
            Done
          </Button>

          {/* Danger zone */}
          <section className="space-y-2 border-t border-border/60 pt-4">
            {log && (log.note || log.symptoms.length > 0 || log.flow !== 'none') && (
              <Button variant="ghost" className="w-full text-destructive" onClick={handleDeleteLog}>
                Clear this day&apos;s entry
              </Button>
            )}
            {inPeriod && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" className="w-full text-destructive">
                    Remove this period
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove this period?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This deletes the logged period on {formatShortDate(date)} and recalculates
                      your predictions. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeletePeriod}>Remove</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </section>
        </div>
      </SheetContent>
    </Sheet>
  )
}

/** Small context helper so the sheet can be used from multiple screens. */
function useDayDetailContext() {
  const { periods, classify, today } = useAppData()
  const haptics = useLiveQuery(() => db.settings.get(1), [])?.hapticsEnabled ?? true
  return { periods, classify, today, haptics }
}
