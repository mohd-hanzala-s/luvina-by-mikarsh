'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { db } from '@/lib/db/db'
import { getSettings, setPersonalProfile, setName, updateSettings } from '@/lib/db/settings'
import { startPeriod } from '@/lib/db/cycles'
import {
  GOALS,
  HEALTH_CONDITIONS,
  MAX_NAME_LENGTH,
  PRIVACY_CHOICES,
  REGULARITY_OPTIONS,
} from '@/constants'
import { hapticFeedback } from '@/lib/utils'
import { Logo } from '@/components/layout/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const WELCOME = 0
const ABOUT = 1
const CYCLE = 2
const HEALTH = 3
const GOALS_STEP = 4
const PRIVACY = 5

const STEP_LABELS = [
  'Welcome',
  'About you',
  'Your cycle',
  'Health',
  'Goals',
  'Privacy',
]

export function OnboardingDialog() {
  const settingsRow = useLiveQuery(() => db.settings.get(1), [])
  const [step, setStep] = useState(WELCOME)
  const [name, setNameLocal] = useState('')
  const [age, setAge] = useState('')
  const [cycleLength, setCycleLength] = useState(28)
  const [periodLength, setPeriodLength] = useState(5)
  const [lastPeriod, setLastPeriod] = useState('')
  const [regularity, setRegularity] = useState<'regular' | 'irregular' | 'unsure' | null>(null)
  const [conditions, setConditions] = useState<string[]>([])
  const [goals, setGoals] = useState<string[]>([])
  const [privacy, setPrivacy] = useState<'local' | 'cloud' | 'undecided' | null>(null)
  const [saving, setSaving] = useState(false)
  const [skipped, setSkipped] = useState(false)

  // Ensure a settings row exists so useLiveQuery below resolves to a real
  // object instead of undefined — otherwise `open` stays false forever.
  useEffect(() => {
    void getSettings()
  }, [])

  const open = Boolean(
    settingsRow && !settingsRow.onBoardingDone && !settingsRow.nameCaptureDismissed && !skipped,
  )

  const lastPeriodRef = useRef<HTMLInputElement>(null)

  const toggle = (list: string[], value: string, setter: (next: string[]) => void) => {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
    hapticFeedback(true)
  }

  const finish = async (didSkip: boolean) => {
    setSaving(true)
    try {
      const trimmedName = name.trim()
      if (didSkip) {
        await updateSettings({ onBoardingDone: true, nameCaptureDismissed: true })
        toast('No worries. We\u2019ll learn your cycle over time and personalize the experience as data becomes available.')
        return
      }
      await Promise.all([
        setName(trimmedName.length ? trimmedName : null),
        updateSettings({ onBoardingDone: true, nameCaptureDismissed: true }),
        setPersonalProfile({
          age: age.trim() && Number(age.trim()) > 0 ? Math.round(Number(age.trim())) : null,
          regularity,
          healthConditions: conditions,
          goals,
          privacyChoice: privacy,
        }),
        updateSettings({ cycleLengthDefault: cycleLength, periodLengthDefault: periodLength }),
      ])
      if (lastPeriod) {
        await startPeriod(lastPeriod)
      }
      hapticFeedback(true)
      if (trimmedName) {
        toast.success(`Welcome, ${trimmedName}! Your cycle journey starts now.`)
      } else {
        toast.success('Welcome! Your cycle journey starts now.')
      }
    } finally {
      setSaving(false)
      setSkipped(true)
    }
  }

  const next = () => setStep((s) => Math.min(PRIVACY, s + 1))
  const back = () => setStep((s) => Math.max(WELCOME, s - 1))

  const stepContent = (() => {
    switch (step) {
      case WELCOME:
        return <WelcomeStep onNext={next} onSkip={() => void finish(true)} />
      case ABOUT:
        return (
          <AboutStep
            name={name}
            age={age}
            regularity={regularity}
            onName={setNameLocal}
            onAge={setAge}
            onRegularity={setRegularity}
          />
        )
      case CYCLE:
        return (
          <CycleStep
            cycleLength={cycleLength}
            periodLength={periodLength}
            lastPeriod={lastPeriod}
            onCycleLength={setCycleLength}
            onPeriodLength={setPeriodLength}
            onLastPeriod={setLastPeriod}
            inputRef={lastPeriodRef}
          />
        )
      case HEALTH:
        return (
          <ChipsStep
            title="Any health conditions?"
            description="Optional — pick all that apply. Luvina tailors its language to you, but never diagnoses."
            options={HEALTH_CONDITIONS}
            selected={conditions}
            onToggle={(value) => toggle(conditions, value, setConditions)}
          />
        )
      case GOALS_STEP:
        return (
          <ChipsStep
            title="What are your goals?"
            description="Pick any — you can change these anytime in Settings."
            options={GOALS}
            selected={goals}
            onToggle={(value) => toggle(goals, value, setGoals)}
          />
        )
      case PRIVACY:
        return (
          <PrivacyStep
            value={privacy}
            onChange={setPrivacy}
            onFinish={() => void finish(false)}
            saving={saving}
          />
        )
      default:
        return null
    }
  })()

  return (
    <Dialog open={open} onOpenChange={() => void finish(true)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <Logo className="size-11" />
          <DialogTitle>
            {step === WELCOME ? 'Welcome to Luvina' : STEP_LABELS[step]}
          </DialogTitle>
          {step === WELCOME ? (
            <DialogDescription>
              Your private companion for understanding your cycle.
            </DialogDescription>
          ) : (
            <DialogDescription className="sr-only">{STEP_LABELS[step]}</DialogDescription>
          )}
        </DialogHeader>

        {step > WELCOME && (
          <div className="mx-auto flex w-full max-w-[260px] items-center gap-1">
            {STEP_LABELS.slice(1).map((_, index) => (
              <span
                key={index}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  index < step ? 'bg-primary' : index === step ? 'bg-primary/40' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        )}

                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.18 }}
                    style={{ willChange: 'transform, opacity' }}
            className="max-h-[50vh] overflow-y-auto px-1"
          >
            {stepContent}
          </motion.div>
        </AnimatePresence>

        {step > WELCOME && step < PRIVACY && (
          <div className="flex items-center justify-between pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={back} disabled={saving}>
              <ArrowLeft aria-hidden="true" />
              Back
            </Button>
            <Button type="button" size="sm" onClick={next} disabled={saving}>
              Next
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function WelcomeStep({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  return (
    <div className="space-y-4 text-center">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Track your period, symptoms and moods. Luvina learns your rhythm and offers gentle
        predictions and insights — <span className="font-medium text-foreground">all stored
        privately on this device.</span>
      </p>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { emoji: '🔒', title: 'Local-first' },
          { emoji: '📉', title: 'Predictions' },
          { emoji: '💡', title: 'Personal insights' },
        ].map((item) => (
          <div key={item.title} className="rounded-card bg-muted/60 p-3">
            <span className="block text-xl" aria-hidden="true">
              {item.emoji}
            </span>
            <span className="mt-1 block text-[11px] font-medium text-muted-foreground">
              {item.title}
            </span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button onClick={onNext}>
          <Sparkles aria-hidden="true" />
          Get started
        </Button>
        <Button variant="ghost" onClick={onSkip}>
          Skip setup
        </Button>
      </div>
    </div>
  )
}

function AboutStep({
  name,
  age,
  regularity,
  onName,
  onAge,
  onRegularity,
}: {
  name: string
  age: string
  regularity: 'regular' | 'irregular' | 'unsure' | null
  onName: (value: string) => void
  onAge: (value: string) => void
  onRegularity: (value: 'regular' | 'irregular' | 'unsure') => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="onboarding-name">What should we call you?</Label>
        <Input
          id="onboarding-name"
          className="mt-1.5"
          placeholder="e.g. Aanya (optional)"
          value={name}
          maxLength={MAX_NAME_LENGTH}
          onChange={(e) => onName(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="onboarding-age">Age (optional)</Label>
        <Input
          id="onboarding-age"
          className="mt-1.5"
          type="number"
          inputMode="numeric"
          min={10}
          max={120}
          placeholder="e.g. 27"
          value={age}
          onChange={(e) => onAge(e.target.value)}
        />
      </div>
      <div>
        <Label className="mb-1.5 block">Is your cycle usually regular?</Label>
        <div className="flex flex-wrap gap-2">
          {REGULARITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={regularity === option.value}
              onClick={() => onRegularity(option.value)}
              className={
                regularity === option.value
                  ? 'h-10 rounded-full border border-primary bg-primary/10 px-3.5 text-sm font-medium text-primary transition-all active:scale-95'
                  : 'h-10 rounded-full border border-border px-3.5 text-sm font-medium text-muted-foreground transition-all hover:bg-accent active:scale-95'
              }
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function CycleStep({
  cycleLength,
  periodLength,
  lastPeriod,
  onCycleLength,
  onPeriodLength,
  onLastPeriod,
  inputRef,
}: {
  cycleLength: number
  periodLength: number
  lastPeriod: string
  onCycleLength: (value: number) => void
  onPeriodLength: (value: number) => void
  onLastPeriod: (value: string) => void
  inputRef: React.Ref<HTMLInputElement>
}) {
  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <Label>Average cycle length</Label>
          <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
            {cycleLength} days
          </span>
        </div>
        <Slider
          min={18}
          max={45}
          step={1}
          value={[cycleLength]}
          onValueChange={([v]) => onCycleLength(v)}
          aria-label="Average cycle length"
        />
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <Label>Period length</Label>
          <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
            {periodLength} days
          </span>
        </div>
        <Slider
          min={2}
          max={10}
          step={1}
          value={[periodLength]}
          onValueChange={([v]) => onPeriodLength(v)}
          aria-label="Period length"
        />
      </div>
      <div>
        <Label htmlFor="onboarding-last-period">Last period start date (optional)</Label>
        <Input
          id="onboarding-last-period"
          ref={inputRef}
          className="mt-1.5"
          type="date"
          max={new Date().toISOString().slice(0, 10)}
          value={lastPeriod}
          onChange={(e) => onLastPeriod(e.target.value)}
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          We&apos;ll use this to start your very first prediction.
        </p>
      </div>
    </div>
  )
}

function ChipsStep({
  title,
  description,
  options,
  selected,
  onToggle,
}: {
  title: string
  description: string
  options: { value: string; label: string }[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base">{title}</Label>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option.value)
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(option.value)}
              className={
                active
                  ? 'flex min-h-[44px] items-center gap-1.5 rounded-full border border-primary bg-primary/10 px-3.5 text-sm font-medium text-primary transition-all active:scale-95'
                  : 'flex min-h-[44px] items-center gap-1.5 rounded-full border border-border px-3.5 text-sm font-medium text-muted-foreground transition-all hover:bg-accent active:scale-95'
              }
            >
              {active && <Check className="size-3.5" aria-hidden="true" />}
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function PrivacyStep({
  value,
  onChange,
  onFinish,
  saving,
}: {
  value: 'local' | 'cloud' | 'undecided' | null
  onChange: (value: 'local' | 'cloud' | 'undecided') => void
  onFinish: () => void
  saving: boolean
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base">How should your data stay safe?</Label>
        <p className="mt-0.5 text-xs text-muted-foreground">
          However you choose, Luvina never uploads anything without your explicit action.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {PRIVACY_CHOICES.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={
              value === option.value
                ? 'min-h-[44px] rounded-full border border-primary bg-primary/10 px-3.5 text-sm font-medium text-primary transition-all active:scale-95'
                : 'min-h-[44px] rounded-full border border-border px-3.5 text-sm font-medium text-muted-foreground transition-all hover:bg-accent active:scale-95'
            }
          >
            {option.label}
          </button>
        ))}
      </div>
      <Button className="w-full" size="lg" onClick={onFinish} disabled={saving}>
        <Check aria-hidden="true" />
        {saving ? 'Finishing up…' : 'Let\u2019s go'}
      </Button>
    </div>
  )
}
