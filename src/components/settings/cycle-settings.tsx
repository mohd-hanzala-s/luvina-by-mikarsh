'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { CalendarClock, Droplets, Hourglass, Sprout } from 'lucide-react'
import { toast } from 'sonner'
import { DEFAULT_SETTINGS } from '@/constants'
import { db } from '@/lib/db/db'
import { updateSettings } from '@/lib/db/settings'
import { SettingsSection, SettingsRow } from '@/components/settings/settings-card'
import { Slider } from '@/components/ui/slider'

function PreferenceSlider({
  icon,
  title,
  description,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  icon: React.ReactNode
  title: string
  description: string
  value: number
  min: number
  max: number
  unit: string
  onChange: (value: number) => void
}) {
  return (
    <SettingsRow
      icon={icon}
      title={title}
      description={`${description} ${value} ${unit}${value === 1 ? '' : 's'}.`}
      right={
        <div className="flex w-40 flex-col gap-2">
          <Slider
            value={[value]}
            min={min}
            max={max}
            step={1}
            onValueChange={([v]) => onChange(v)}
            aria-label={`${title}: ${value} ${unit}`}
          />
          <span className="text-right text-xs font-semibold tabular-nums text-foreground/80">
            {value}
          </span>
        </div>
      }
    />
  )
}

export function CycleSettings() {
  const row = useLiveQuery(() => db.settings.get(1), [])
  // Fall back to built-in defaults when the settings row has not been
  // created yet (fresh install before any write), so the section renders.
  const settings = {
    ...DEFAULT_SETTINGS,
    ...(row ?? {}),
  }

  const save = async (patch: Parameters<typeof updateSettings>[0]) => {
    await updateSettings(patch)
    toast.success('Predictions updated')
  }

  return (
    <SettingsSection
      title="Cycle preferences"
      description="Used for predictions until your history is large enough to take over."
    >
      <PreferenceSlider
        icon={<CalendarClock className="size-4" aria-hidden="true" />}
        title="Cycle length"
        description="Expected length of a full cycle:"
        value={settings.cycleLengthDefault}
        min={18}
        max={45}
        unit="day"
        onChange={(v) => save({ cycleLengthDefault: v })}
      />
      <PreferenceSlider
        icon={<Droplets className="size-4" aria-hidden="true" />}
        title="Period length"
        description="Typical number of bleeding days:"
        value={settings.periodLengthDefault}
        min={2}
        max={10}
        unit="day"
        onChange={(v) => save({ periodLengthDefault: v })}
      />
      <PreferenceSlider
        icon={<Hourglass className="size-4" aria-hidden="true" />}
        title="Luteal phase"
        description="Days between ovulation and your next period:"
        value={settings.lutealPhaseDays}
        min={10}
        max={16}
        unit="day"
        onChange={(v) => save({ lutealPhaseDays: v })}
      />
      <PreferenceSlider
        icon={<Sprout className="size-4" aria-hidden="true" />}
        title="Fertile window"
        description="Days before ovulation considered fertile:"
        value={settings.fertileWindowDays}
        min={3}
        max={8}
        unit="day"
        onChange={(v) => save({ fertileWindowDays: v })}
      />
    </SettingsSection>
  )
}
