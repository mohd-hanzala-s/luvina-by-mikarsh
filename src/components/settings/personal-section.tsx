'use client'

import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Cake, HeartHandshake, Ruler, Scale, ShieldQuestion, Target, Waves } from 'lucide-react'
import { toast } from 'sonner'
import { db } from '@/lib/db/db'
import { setPersonalProfile } from '@/lib/db/settings'
import { GOALS, HEALTH_CONDITIONS, PRIVACY_CHOICES, REGULARITY_OPTIONS } from '@/constants'
import { hapticFeedback } from '@/lib/utils'
import { SettingsSection, SettingsRow } from '@/components/settings/settings-card'
import { Input } from '@/components/ui/input'

export function PersonalSection() {
  const row = useLiveQuery(() => db.settings.get(1), [])
  const settings = row ?? null

  const [age, setAge] = useState('')
  const [dob, setDob] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')

  useEffect(() => {
    setAge(settings?.age ? String(settings.age) : '')
    setDob(settings?.dateOfBirth ?? '')
    setHeight(settings?.heightCm ? String(settings.heightCm) : '')
    setWeight(settings?.weightKg ? String(settings.weightKg) : '')
  }, [settings?.age, settings?.dateOfBirth, settings?.heightCm, settings?.weightKg])

  const conditions = settings?.healthConditions ?? []
  const goals = settings?.goals ?? []

  const save = async (patch: Parameters<typeof setPersonalProfile>[0]) => {
    await setPersonalProfile(patch)
  }

  const handleNumberBlur = (key: 'age' | 'heightCm' | 'weightKg', value: string) => {
    const trimmed = value.trim()
    if (!trimmed) {
      void save({ [key]: null })
      return
    }
    const num = Number(trimmed)
    if (!Number.isFinite(num) || num <= 0) {
      toast.error('Please enter a positive number')
      return
    }
    void save({ [key]: Math.round(num) })
  }

  const toggle = (key: 'healthConditions' | 'goals', value: string) => {
    const current = key === 'healthConditions' ? conditions : goals
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
    void save({ [key]: next })
    hapticFeedback(true)
  }

  return (
    <SettingsSection
      title="Personal profile"
      description="Optional details that make insights feel more personal. Everything stays on this device."
    >
      <SettingsRow
        icon={<Cake className="size-4 text-primary" aria-hidden="true" />}
        title="Age"
        description="Used for general, non-medical guidance."
        right={
          <Input
            aria-label="Age"
            type="number"
            inputMode="numeric"
            min={10}
            max={120}
            placeholder="Optional"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            onBlur={() => handleNumberBlur('age', age)}
            className="h-10 w-24"
          />
        }
      />
      <SettingsRow
        icon={<Cake className="size-4" aria-hidden="true" />}
        title="Date of birth"
        description="Optional — used only to say happy birthday."
        right={
          <Input
            aria-label="Date of birth"
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            onBlur={() => void save({ dateOfBirth: dob.trim() || null })}
            className="h-10 w-40"
          />
        }
      />
      <SettingsRow
        icon={<Ruler className="size-4" aria-hidden="true" />}
        title="Height"
        description="Optional, in centimetres."
        right={
          <Input
            aria-label="Height in centimetres"
            type="number"
            inputMode="numeric"
            placeholder="cm"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            onBlur={() => handleNumberBlur('heightCm', height)}
            className="h-10 w-24"
          />
        }
      />
      <SettingsRow
        icon={<Scale className="size-4" aria-hidden="true" />}
        title="Weight"
        description="Optional, in kilograms."
        right={
          <Input
            aria-label="Weight in kilograms"
            type="number"
            inputMode="numeric"
            placeholder="kg"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onBlur={() => handleNumberBlur('weightKg', weight)}
            className="h-10 w-24"
          />
        }
      />
      <SettingsRow
        icon={<Waves className="size-4" aria-hidden="true" />}
        title="Cycle regularity"
        description="How regular is your cycle usually?"
        right={
          <div className="flex flex-wrap justify-end gap-1.5">
            {REGULARITY_OPTIONS.map((option) => {
              const active = settings?.regularity === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => void save({ regularity: active ? null : option.value })}
                  className={
                    active
                      ? 'h-9 rounded-full border border-primary bg-primary/10 px-3 text-xs font-medium text-primary transition-all active:scale-95'
                      : 'h-9 rounded-full border border-border px-3 text-xs font-medium text-muted-foreground transition-all hover:bg-accent active:scale-95'
                  }
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        }
      />
      <SettingsRow
        icon={<HeartHandshake className="size-4" aria-hidden="true" />}
        title="Health conditions"
        description="Optional — helps Luvina tailor its supportive language."
        right={
          <div className="flex flex-wrap justify-end gap-1.5">
            {HEALTH_CONDITIONS.map((option) => {
              const active = conditions.includes(option.value)
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle('healthConditions', option.value)}
                  className={
                    active
                      ? 'h-9 rounded-full border border-primary bg-primary/10 px-3 text-xs font-medium text-primary transition-all active:scale-95'
                      : 'h-9 rounded-full border border-border px-3 text-xs font-medium text-muted-foreground transition-all hover:bg-accent active:scale-95'
                  }
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        }
      />
      <SettingsRow
        icon={<Target className="size-4" aria-hidden="true" />}
        title="Your goals"
        description="What would you like Luvina to help with?"
        right={
          <div className="flex flex-wrap justify-end gap-1.5">
            {GOALS.map((option) => {
              const active = goals.includes(option.value)
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle('goals', option.value)}
                  className={
                    active
                      ? 'h-9 rounded-full border border-primary bg-primary/10 px-3 text-xs font-medium text-primary transition-all active:scale-95'
                      : 'h-9 rounded-full border border-border px-3 text-xs font-medium text-muted-foreground transition-all hover:bg-accent active:scale-95'
                  }
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        }
      />
      <SettingsRow
        icon={<ShieldQuestion className="size-4" aria-hidden="true" />}
        title="Backup preference"
        description="How would you like to keep your data safe?"
        right={
          <div className="flex flex-wrap justify-end gap-1.5">
            {PRIVACY_CHOICES.map((option) => {
              const active = settings?.privacyChoice === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => void save({ privacyChoice: active ? null : option.value })}
                  className={
                    active
                      ? 'h-9 rounded-full border border-primary bg-primary/10 px-3 text-xs font-medium text-primary transition-all active:scale-95'
                      : 'h-9 rounded-full border border-border px-3 text-xs font-medium text-muted-foreground transition-all hover:bg-accent active:scale-95'
                  }
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        }
      />
    </SettingsSection>
  )
}
