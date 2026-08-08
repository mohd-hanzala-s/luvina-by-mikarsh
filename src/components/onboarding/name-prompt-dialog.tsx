'use client'

import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { db } from '@/lib/db/db'
import { getSettings, setName } from '@/lib/db/settings'
import { MAX_NAME_LENGTH } from '@/constants'
import { Logo } from '@/components/layout/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

/**
 * First-run prompt asking what to call the person using the app. Shown once
 * — the answer (or the fact that it was skipped) is stored locally in the
 * settings row so it never asks again. Like the rest of Luvina, nothing here
 * ever leaves the device.
 */
export function NamePromptDialog() {
  const settingsRow = useLiveQuery(() => db.settings.get(1), [])
  const [name, setLocalName] = useState('')
  const [saving, setSaving] = useState(false)

  // Fresh installs have no settings row at all. Ensure one exists so the
  // live query above eventually resolves to a real (unnamed) row instead of
  // staying `undefined` forever — that's what lets us tell "still loading"
  // apart from "genuinely nothing to show".
  useEffect(() => {
    getSettings()
  }, [])

  const open = Boolean(settingsRow && !settingsRow.name && !settingsRow.nameCaptureDismissed)

  useEffect(() => {
    if (open) setLocalName('')
  }, [open])

  const persist = async (value: string | null) => {
    setSaving(true)
    try {
      await setName(value)
      if (value) toast.success(`Welcome, ${value}!`)
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = name.trim()
    void persist(trimmed.length ? trimmed : null)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) void persist(null)
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="items-center text-center">
          <Logo className="size-11" />
          <DialogTitle>What should we call you?</DialogTitle>
          <DialogDescription>
            Luvina will greet you by name from now on. Like everything else here, it stays on this
            device.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="onboarding-name" className="sr-only">
              Your name
            </Label>
            <Input
              id="onboarding-name"
              autoFocus
              placeholder="e.g. Aanya"
              value={name}
              maxLength={MAX_NAME_LENGTH}
              onChange={(event) => setLocalName(event.target.value)}
            />
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => void persist(null)} disabled={saving}>
              Skip for now
            </Button>
            <Button type="submit" disabled={saving || !name.trim()}>
              <Sparkles aria-hidden="true" />
              Continue
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
