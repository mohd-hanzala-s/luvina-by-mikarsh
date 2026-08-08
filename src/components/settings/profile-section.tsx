'use client'

import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Moon, Monitor, Sun, UserRound, Vibrate, WandSparkles } from 'lucide-react'
import { toast } from 'sonner'
import { db } from '@/lib/db/db'
import { useAppData } from '@/hooks/useAppData'
import { setAnimationIntensity, setName, setThemePreference, updateSettings } from '@/lib/db/settings'
import { ANIMATION_INTENSITY, MAX_NAME_LENGTH } from '@/constants'
import type { ThemePreference } from '@/types'
import { cn } from '@/lib/utils'
import { SettingsSection, SettingsRow } from '@/components/settings/settings-card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { PersonalizationPreview } from '@/components/theme/personalization-preview'

// "Default" maps to the existing `system` preference — it follows the
// device's light/dark setting, dressed in Luvina's signature palette just
// like the explicit Light and Dark choices.
const THEME_OPTIONS: { value: ThemePreference; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <Sun className="size-4" aria-hidden="true" /> },
  { value: 'dark', label: 'Dark', icon: <Moon className="size-4" aria-hidden="true" /> },
  { value: 'system', label: 'Default', icon: <Monitor className="size-4" aria-hidden="true" /> },
]

export function ProfileSection() {
  const { settings } = useAppData()
  const savedName = settings?.name ?? ''
  const [value, setValue] = useState(savedName)

  // Keep the field in sync if the name changes elsewhere (e.g. the
  // first-run prompt, or a backup restore).
  useEffect(() => {
    setValue(savedName)
  }, [savedName])

  const save = async () => {
    const trimmed = value.trim()
    if (trimmed === savedName) return
    await setName(trimmed.length ? trimmed : null)
    toast.success(trimmed.length ? 'Name updated' : 'Name cleared')
  }

  const row = useLiveQuery(() => db.settings.get(1), [])
  const appearance = row?.theme ?? 'system'
  const haptics = row?.hapticsEnabled ?? true
  const animationIntensity = row?.animationIntensity ?? 'default'

  const handleAppearance = async (next: ThemePreference) => {
    await setThemePreference(next)
  }

  const handleHaptics = async (next: boolean) => {
    await updateSettings({ hapticsEnabled: next })
    toast.success(next ? 'Haptics enabled' : 'Haptics disabled')
  }

  const handleAnimation = async (next: 'reduced' | 'default' | 'lively') => {
    await setAnimationIntensity(next)
  }

  return (
    <SettingsSection
      title="Profile"
      description="Everything here stays on this device."
      data-tour="settings-profile"
    >
      <SettingsRow
        icon={<UserRound className="size-4" aria-hidden="true" />}
        title="Your name"
        description="Used for the greeting on your homepage."
        right={
          <Input
            aria-label="Your name"
            placeholder="Not set"
            value={value}
            maxLength={MAX_NAME_LENGTH}
            onChange={(event) => setValue(event.target.value)}
            onBlur={save}
            onKeyDown={(event) => {
              if (event.key === 'Enter') event.currentTarget.blur()
            }}
            className="h-10 w-40"
          />
        }
      />

      <SettingsRow
        icon={<Sun className="size-4" aria-hidden="true" />}
        title="Appearance"
        right={
          <div className="flex flex-wrap gap-1 rounded-pill bg-muted p-1">
            {THEME_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={appearance === option.value}
                onClick={() => handleAppearance(option.value)}
                className={cn(
                  'flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-xs font-medium transition-all',
                  appearance === option.value
                    ? 'bg-card text-foreground shadow-soft'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
        }
      />

      <SettingsRow
        icon={<Vibrate className="size-4" aria-hidden="true" />}
        title="Haptic feedback"
        description="Subtle vibration on supported devices."
        right={
          <Switch checked={haptics} onCheckedChange={handleHaptics} aria-label="Haptic feedback" />
        }
      />

      <SettingsRow
        icon={<WandSparkles className="size-4" aria-hidden="true" />}
        title="Animation intensity"
        description="How lively Luvina's motion feels."
        right={
          <div className="flex flex-wrap gap-1 rounded-pill bg-muted p-1">
            {ANIMATION_INTENSITY.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={animationIntensity === option.value}
                onClick={() => handleAnimation(option.value)}
                className={cn(
                  'rounded-pill px-3 py-1.5 text-xs font-medium transition-all',
                  animationIntensity === option.value
                    ? 'bg-card text-foreground shadow-soft'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="p-5">
        <p className="mb-2.5 text-xs font-medium text-muted-foreground">Preview</p>
        <PersonalizationPreview name={settings?.name} />
      </div>
    </SettingsSection>
  )
}
