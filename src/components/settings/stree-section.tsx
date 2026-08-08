'use client'

import { useState } from 'react'
import { ShieldAlert, Phone } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db/db'
import { StreeProtocolDialog } from '@/components/safety/stree-protocol-dialog'
import { Button } from '@/components/ui/button'

export function StreeSection() {
  const settings = useLiveQuery(() => db.settings.get(1), [])
  const [open, setOpen] = useState(false)

  const contactName = settings?.emergencyContactName
  const contactPhone = settings?.emergencyContactPhone
  const contactRelation = settings?.emergencyContactRelation

  return (
    <section aria-label="Stree Safety Protocol" className="rounded-card border border-rose-500/30 bg-card p-5 shadow-soft space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
            <ShieldAlert className="size-5" />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold text-rose-600 dark:text-rose-400">
              Stree Safety Protocol 🛡️
            </h2>
            <p className="text-xs text-muted-foreground">
              Emergency dialing, SOS contact quick-call, and women safety helpline.
            </p>
          </div>
        </div>

        <Button size="sm" onClick={() => setOpen(true)} className="gap-1 bg-rose-600 text-white hover:bg-rose-700">
          <Phone className="size-3.5" />
          Open SOS
        </Button>
      </div>

      <div className="rounded-xl border border-border/60 bg-muted/40 p-3.5 text-xs space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground">Saved Emergency Loved One:</span>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-xs font-semibold text-primary hover:underline"
          >
            {contactPhone ? 'Edit Details' : 'Configure Now'}
          </button>
        </div>

        {contactPhone ? (
          <p className="text-muted-foreground">
            <strong>{contactName || 'Loved One'}</strong> {contactRelation ? `(${contactRelation})` : ''} —{' '}
            <span className="tabular-nums">{contactPhone}</span>
          </p>
        ) : (
          <p className="text-muted-foreground italic">
            No emergency contact saved yet. Tap &ldquo;Configure Now&rdquo; to set up instant 1-tap SOS dialing.
          </p>
        )}
      </div>

      <StreeProtocolDialog open={open} onOpenChange={setOpen} />
    </section>
  )
}
