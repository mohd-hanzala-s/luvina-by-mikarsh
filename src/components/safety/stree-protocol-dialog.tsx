'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, ShieldAlert, Copy, Check, UserPlus, Sparkles, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db/db'
import { updateSettings } from '@/lib/db/settings'
import { hapticFeedback } from '@/lib/utils'
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

interface StreeProtocolDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StreeProtocolDialog({ open, onOpenChange }: StreeProtocolDialogProps) {
  const settings = useLiveQuery(() => db.settings.get(1), [])
  const haptics = settings?.hapticsEnabled ?? true

  const [editingContact, setEditingContact] = useState(false)
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactRelation, setContactRelation] = useState('')
  const [copiedSms, setCopiedSms] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (settings) {
      setContactName(settings.emergencyContactName ?? '')
      setContactPhone(settings.emergencyContactPhone ?? '')
      setContactRelation(settings.emergencyContactRelation ?? '')
    }
  }, [settings])

  const hasContact = Boolean(contactPhone.trim())

  const handleSaveContact = async () => {
    setSaving(true)
    try {
      await updateSettings({
        emergencyContactName: contactName.trim() || null,
        emergencyContactPhone: contactPhone.trim() || null,
        emergencyContactRelation: contactRelation.trim() || null,
      })
      hapticFeedback(haptics)
      toast.success('Emergency contact saved')
      setEditingContact(false)
    } finally {
      setSaving(false)
    }
  }

  const handleCopySms = () => {
    const message = `SOS: I am feeling unsafe or in an emergency. Please call or check on me immediately.`
    void navigator.clipboard.writeText(message)
    setCopiedSms(true)
    hapticFeedback(haptics)
    toast.success('Emergency message copied')
    setTimeout(() => setCopiedSms(false), 3000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg border-rose-500/30">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="size-5" />
            </span>
            <div>
              <DialogTitle className="font-display text-xl font-bold text-rose-600 dark:text-rose-400">
                Stree Safety Protocol 🛡️
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Instant emergency dialing, SOS contact quick-call, and women safety helpline.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Main SOS Call Loved One Box */}
          <div className="relative overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-500/15 via-card to-primary/10 p-5 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Primary Emergency Contact
                </p>
                <h3 className="mt-1 font-display text-lg font-bold">
                  {contactName || 'Loved One / Trusted Person'}
                  {contactRelation && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">({contactRelation})</span>
                  )}
                </h3>
                <p className="text-sm font-semibold tabular-nums text-foreground/90">
                  {contactPhone || 'No phone number saved yet'}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingContact(!editingContact)}
                className="gap-1 text-xs"
              >
                <UserPlus className="size-3.5" />
                {hasContact ? 'Edit' : 'Add Contact'}
              </Button>
            </div>

            {hasContact ? (
              <a
                href={`tel:${contactPhone}`}
                onClick={() => hapticFeedback(haptics)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#F43F5E] py-3 text-center font-display text-sm font-bold text-white shadow-lg shadow-rose-500/30 transition-transform hover:bg-[#E11D48] active:scale-98"
              >
                <Phone className="size-4 animate-bounce" />
                CALL LOVED ONE NOW ({contactPhone})
              </a>
            ) : (
              <div className="mt-3 rounded-xl border border-dashed border-rose-500/40 p-3 text-center text-xs text-muted-foreground">
                Tap &ldquo;Add Contact&rdquo; above to save your partner, parent, or trusted friend&apos;s phone number for 1-tap instant dialing.
              </div>
            )}
          </div>

          {/* Contact Edit Form Accordion */}
          {editingContact && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 rounded-2xl border border-border/80 bg-muted/40 p-4"
            >
              <h4 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Save Emergency Loved One Details
              </h4>
              <div className="space-y-2 text-xs">
                <div>
                  <Label htmlFor="sos-name">Name</Label>
                  <Input
                    id="sos-name"
                    placeholder="e.g. Maya / Mom / Partner"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="mt-1 h-9 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="sos-phone">Phone Number (Required)</Label>
                  <Input
                    id="sos-phone"
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="mt-1 h-9 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="sos-relation">Relationship</Label>
                  <Input
                    id="sos-relation"
                    placeholder="e.g. Sister / Partner / Best Friend"
                    value={contactRelation}
                    onChange={(e) => setContactRelation(e.target.value)}
                    className="mt-1 h-9 text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="ghost" size="sm" onClick={() => setEditingContact(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveContact} disabled={saving}>
                  Save Emergency Contact
                </Button>
              </div>
            </motion.div>
          )}

          {/* Official Emergency & Safety Helplines */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <ShieldAlert className="size-3.5 text-rose-500" />
              National Emergency &amp; Women Safety Helplines
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <a
                href="tel:1091"
                onClick={() => hapticFeedback(haptics)}
                className="flex items-center justify-between rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-500/20 transition-colors"
              >
                <span>Women Helpline</span>
                <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[11px] text-white">1091</span>
              </a>

              <a
                href="tel:112"
                onClick={() => hapticFeedback(haptics)}
                className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/10 p-3 font-semibold text-primary hover:bg-primary/20 transition-colors"
              >
                <span>National Emergency</span>
                <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] text-primary-foreground">112</span>
              </a>
            </div>
          </div>

          {/* Quick SOS Message Copy */}
          <div className="rounded-2xl border border-border/60 bg-card p-4 space-y-2 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold">
                <MessageSquare className="size-3.5 text-primary" />
                Emergency SOS Text Message
              </span>
              <Button variant="ghost" size="sm" onClick={handleCopySms} className="gap-1 text-xs">
                {copiedSms ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
                {copiedSms ? 'Copied' : 'Copy SOS Text'}
              </Button>
            </div>
            <p className="rounded-xl bg-muted p-2.5 text-xs italic leading-relaxed text-muted-foreground">
              &ldquo;SOS: I am feeling unsafe or in an emergency. Please call or check on me immediately.&rdquo;
            </p>
          </div>

          {/* Calming Grounding Exercise when feeling overwhelmed */}
          <div className="rounded-2xl border border-accent/40 bg-accent/15 p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-accent-strong">
              <Sparkles className="size-4" />
              5-4-3-2-1 Sensory Grounding (If feeling panicked or unsafe)
            </div>
            <ul className="grid gap-1 text-[11px] leading-relaxed text-muted-foreground">
              <li>👀 <strong>5 things</strong> you can see around you</li>
              <li>✋ <strong>4 things</strong> you can physically feel/touch</li>
              <li>👂 <strong>3 things</strong> you can hear</li>
              <li>👃 <strong>2 things</strong> you can smell</li>
              <li>💨 <strong>1 deep breath</strong>: inhale for 4s, hold for 4s, exhale slowly</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
