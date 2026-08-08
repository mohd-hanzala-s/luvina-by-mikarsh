'use client'

import { useRouter } from 'next/navigation'
import { ShieldAlert, Phone, ChevronRight } from 'lucide-react'
import { useAura } from '@/hooks/useAura'
import { hapticFeedback } from '@/lib/utils'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db/db'
import { Button } from '@/components/ui/button'

export function AuraDashboardCard() {
  const router = useRouter()
  const { enabled, loaded, defaultContact } = useAura()
  const haptics = useLiveQuery(() => db.settings.get(1), [])?.hapticsEnabled ?? true

  if (!loaded || !enabled) return null

  const handleOpenAura = () => {
    hapticFeedback(haptics)
    router.push('/aura')
  }

  return (
    <section aria-label="Luvina Aura Safety Card" className="cv-auto">
      <div className="group relative overflow-hidden rounded-card border border-rose-500/25 bg-gradient-to-br from-rose-500/10 via-card to-primary/10 p-5 shadow-soft transition-all hover:border-rose-500/40 hover:shadow-lifted">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="size-6" />
            </span>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base font-bold text-foreground">Luvina Aura 🛡️</h3>
                <span className="rounded-full bg-rose-500/15 px-2.5 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                  {defaultContact ? 'Protected' : 'Setup Ready'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {defaultContact
                  ? `Primary SOS: ${defaultContact.name} (${defaultContact.phone})`
                  : 'Quick emergency dialing & trusted contact safety module.'}
              </p>
            </div>
          </div>

          <Button
            onClick={handleOpenAura}
            size="sm"
            className="shrink-0 gap-1.5 bg-[#F43F5E] text-white hover:bg-[#E11D48] text-xs shadow-soft"
          >
            <Phone className="size-3.5" />
            Open Aura
          </Button>
        </div>

        {!defaultContact && (
          <div className="mt-3.5 flex items-center justify-between rounded-xl bg-background/60 p-2.5 text-xs text-muted-foreground backdrop-blur">
            <span>No trusted contact saved yet.</span>
            <button
              type="button"
              onClick={() => router.push('/settings#aura')}
              className="font-bold text-primary hover:underline flex items-center gap-0.5"
            >
              Configure Now <ChevronRight className="size-3" />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
