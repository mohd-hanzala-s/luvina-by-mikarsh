'use client'

import { Check } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { toast } from 'sonner'
import { db } from '@/lib/db/db'
import { setThemePreset } from '@/lib/db/settings'
import { THEME_PRESETS, getThemeColors } from '@/lib/theme/presets'
import { cn } from '@/lib/utils'
import { SettingsSection } from '@/components/settings/settings-card'

export function ThemeSection() {
  const themeId = useLiveQuery(() => db.settings.get(1), [])?.themeId ?? 'royal-purple'

  const select = async (id: string) => {
    await setThemePreset(id)
    toast.success('Theme updated')
  }

  return (
    <SettingsSection
      title="Theme"
      description="Three curated palettes — only the accent colors change."
    >
      <div className="grid gap-2 p-4 sm:grid-cols-3">
        {THEME_PRESETS.map((preset) => {
          const colors = getThemeColors(preset.id)
          const active = themeId === preset.id
          return (
            <button
              key={preset.id}
              type="button"
              aria-pressed={active}
              onClick={() => select(preset.id)}
              className={cn(
                'flex min-h-[96px] flex-col items-start gap-2 rounded-input border p-3 text-left transition-all active:scale-[0.98]',
                active
                  ? 'border-primary/60 bg-primary/5 ring-2 ring-primary/30'
                  : 'border-border/60 bg-background/40 hover:border-primary/40',
              )}
            >
              <span className="flex items-center gap-1.5">
                <span
                  className="size-4 rounded-full border border-border/40"
                  style={{ backgroundColor: colors.primary }}
                  aria-hidden="true"
                />
                <span
                  className="size-4 rounded-full border border-border/40"
                  style={{ backgroundColor: colors.accent }}
                  aria-hidden="true"
                />
              </span>
              <span className="flex w-full items-center justify-between gap-1">
                <span className="text-sm font-medium">{preset.name}</span>
                {active && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </SettingsSection>
  )
}
