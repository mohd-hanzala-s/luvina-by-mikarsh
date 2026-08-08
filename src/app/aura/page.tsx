'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ShieldAlert,
  Phone,
  ArrowLeft,
  Users,
  AlertCircle,
  Copy,
  Check,
  MapPin,
  Settings as SettingsIcon,
  PlayCircle,
  Stethoscope,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAura } from '@/hooks/useAura'
import { hapticFeedback } from '@/lib/utils'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db/db'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const RELATION_LABELS: Record<string, string> = {
  husband: 'Husband',
  father: 'Father',
  mother: 'Mother',
  friend: 'Friend',
  guardian: 'Guardian',
  partner: 'Partner',
  sibling: 'Sibling',
  doctor: 'Doctor',
  other: 'Trusted Contact',
}

export default function AuraPage() {
  const router = useRouter()
  const { settings, loaded, defaultContact, trustedContacts } = useAura()
  const haptics = useLiveQuery(() => db.settings.get(1), [])?.hapticsEnabled ?? true

  const [confirmCall, setConfirmCall] = useState<{
    type: string
    name: string
    phone: string
  } | null>(null)
  const [testModeActive, setTestModeActive] = useState(false)
  const [copiedSms, setCopiedSms] = useState(false)

  const handleDial = (type: string, name: string, phone: string) => {
    hapticFeedback(haptics)
    if (!phone) {
      toast.error(`No phone number configured for ${name}`)
      return
    }

    if (settings.requireConfirmation) {
      setConfirmCall({ type, name, phone })
    } else {
      executeCall(phone)
    }
  }

  const executeCall = (phone: string) => {
    if (testModeActive) {
      toast.success(`[TEST MODE] Simulated emergency call to ${phone}`)
      setConfirmCall(null)
      return
    }
    window.location.href = `tel:${phone}`
    setConfirmCall(null)
  }

  const handleCopyLocationSms = () => {
    hapticFeedback(haptics)
    let text = `SOS: I am in an emergency or feeling unsafe. Please check on me immediately.`
    if (settings.shareLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(5)
          const lng = pos.coords.longitude.toFixed(5)
          text += ` My approximate location: https://maps.google.com/?q=${lat},${lng}`
          void navigator.clipboard.writeText(text)
          setCopiedSms(true)
          toast.success('Emergency message with location copied!')
          setTimeout(() => setCopiedSms(false), 3000)
        },
        () => {
          void navigator.clipboard.writeText(text)
          setCopiedSms(true)
          toast.success('Emergency message copied!')
          setTimeout(() => setCopiedSms(false), 3000)
        },
      )
    } else {
      void navigator.clipboard.writeText(text)
      setCopiedSms(true)
      toast.success('Emergency message copied!')
      setTimeout(() => setCopiedSms(false), 3000)
    }
  }

  if (!loaded) return null

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) router.back()
              else router.push('/')
            }}
            aria-label="Back"
            className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background/60 text-muted-foreground shadow-soft backdrop-blur transition-all hover:bg-accent hover:text-foreground active:scale-95"
          >
            <ArrowLeft className="size-4.5" aria-hidden="true" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Luvina Aura 🛡️
              </h1>
              <Badge variant="secondary" className="bg-primary/15 text-primary">
                Personal Safety
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Calm, fast access to emergency helplines &amp; your trusted loved ones.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/settings#aura')}
          className="gap-1 text-xs"
        >
          <SettingsIcon className="size-3.5" />
          Configure
        </Button>
      </header>

      {/* Test Mode Notification Banner */}
      {testModeActive && (
        <div className="flex items-center justify-between rounded-card border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-950 dark:text-amber-200 shadow-soft">
          <div className="flex items-center gap-2">
            <PlayCircle className="size-4 text-amber-600 dark:text-amber-400" />
            <span className="font-semibold">Test Mode Active:</span> Calls will be simulated without dialing real numbers.
          </div>
          <button
            type="button"
            onClick={() => setTestModeActive(false)}
            className="font-bold text-amber-700 underline dark:text-amber-300"
          >
            Exit Test
          </button>
        </div>
      )}

      {/* Primary Emergency Action Cards (Large Accessible Buttons) */}
      <section aria-label="Primary Emergency Actions" className="grid gap-3 sm:grid-cols-2">
        {/* Call Women Helpline */}
        <button
          type="button"
          onClick={() =>
            handleDial(
              'Women Helpline',
              'Women Helpline',
              settings.womenHelplineNumber,
            )
          }
          className="group relative flex items-center justify-between overflow-hidden rounded-3xl border border-rose-500/25 bg-gradient-to-br from-rose-500/15 via-card to-accent/15 p-6 text-left shadow-soft transition-all hover:border-rose-500/50 hover:shadow-lifted active:scale-[0.98]"
        >
          <div className="space-y-1">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="size-6" />
            </span>
            <h2 className="font-display text-lg font-bold">Women Helpline</h2>
            <p className="text-xs text-muted-foreground">Toll-free 24/7 Safety Support</p>
            <p className="font-display text-sm font-semibold tabular-nums text-rose-600 dark:text-rose-400">
              {settings.womenHelplineNumber}
            </p>
          </div>
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white shadow-md transition-transform group-hover:scale-105">
            <Phone className="size-6" />
          </span>
        </button>

        {/* Call National Emergency */}
        <button
          type="button"
          onClick={() =>
            handleDial(
              'National Emergency',
              'National Emergency Services',
              settings.nationalEmergencyNumber,
            )
          }
          className="group relative flex items-center justify-between overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/15 via-card to-accent/15 p-6 text-left shadow-soft transition-all hover:border-primary/50 hover:shadow-lifted active:scale-[0.98]"
        >
          <div className="space-y-1">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/20 text-primary">
              <AlertCircle className="size-6" />
            </span>
            <h2 className="font-display text-lg font-bold">National Emergency</h2>
            <p className="text-xs text-muted-foreground">Police, Ambulance &amp; Rescue</p>
            <p className="font-display text-sm font-semibold tabular-nums text-primary">
              {settings.nationalEmergencyNumber}
            </p>
          </div>
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform group-hover:scale-105">
            <Phone className="size-6" />
          </span>
        </button>
      </section>

      {/* Default Trusted Contact Big Card */}
      <section aria-label="Default Trusted Contact">
        {defaultContact ? (
          <div className="relative overflow-hidden rounded-3xl border border-rose-500/30 bg-gradient-to-br from-rose-500/10 via-card to-primary/10 p-6 shadow-soft">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 font-display text-xl font-bold">
                  {defaultContact.name.slice(0, 1).toUpperCase()}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-bold">{defaultContact.name}</h3>
                    <span className="rounded-full bg-rose-500/15 px-2.5 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                      {RELATION_LABELS[defaultContact.relation] || defaultContact.relation}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Primary Trusted Loved One</p>
                  <p className="font-display text-sm font-semibold tabular-nums text-foreground/90">
                    {defaultContact.phone}
                  </p>
                </div>
              </div>

              <Button
                onClick={() =>
                  handleDial(
                    `Trusted (${defaultContact.name})`,
                    defaultContact.name,
                    defaultContact.phone,
                  )
                }
                className="w-full sm:w-auto gap-2 bg-[#F43F5E] text-white hover:bg-[#E11D48] py-3 text-sm font-bold shadow-soft"
              >
                <Phone className="size-4 animate-bounce" />
                Call {defaultContact.name}
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border p-6 text-center shadow-soft">
            <Users className="mx-auto size-8 text-muted-foreground opacity-60" />
            <h3 className="mt-2 font-display text-base font-semibold">No Trusted Contact Added</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
              Save your partner, parent, or trusted friend to enable 1-tap instant dialing in emergency situations.
            </p>
            <Button
              onClick={() => router.push('/settings#aura')}
              size="sm"
              className="mt-4 gap-1.5"
            >
              Add Trusted Contacts
            </Button>
          </div>
        )}
      </section>

      {/* All Trusted Contacts List (Up to 5) */}
      {trustedContacts.length > 0 && (
        <section aria-label="Trusted Contacts List" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold">
              <Users className="size-4 text-primary" />
              Trusted Loved Ones ({trustedContacts.length}/5)
            </h2>
            <button
              type="button"
              onClick={() => router.push('/settings#aura')}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Manage Contacts
            </button>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            {trustedContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between rounded-card border border-border/60 bg-card p-3.5 shadow-soft transition-all hover:border-primary/30"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm truncate">{contact.name}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {RELATION_LABELS[contact.relation] || contact.relation}
                    </span>
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground block truncate">
                    {contact.phone}
                  </span>
                </div>

                <Button
                  size="iconSm"
                  variant="outline"
                  onClick={() =>
                    handleDial(`Trusted (${contact.name})`, contact.name, contact.phone)
                  }
                  className="shrink-0 text-primary border-primary/30 hover:bg-primary/10"
                  aria-label={`Call ${contact.name}`}
                >
                  <Phone className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Utilities & Future-Proof Tools */}
      <section aria-label="Aura Tools" className="grid gap-3 sm:grid-cols-2">
        {/* Quick SOS Message with Location */}
        <div className="rounded-card border border-border/60 bg-card p-4 space-y-2 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold">
              <MapPin className="size-3.5 text-primary" />
              Location SOS SMS Text
            </span>
            <Button variant="ghost" size="sm" onClick={handleCopyLocationSms} className="gap-1 text-xs">
              {copiedSms ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
              {copiedSms ? 'Copied' : 'Copy SOS Text'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {settings.shareLocation
              ? 'Generates emergency text with your live Google Maps coordinates.'
              : 'Generates emergency text message for instant SMS sending.'}
          </p>
        </div>

        {/* Test Mode Trigger */}
        <div className="rounded-card border border-border/60 bg-card p-4 space-y-2 shadow-soft flex items-center justify-between">
          <div>
            <span className="flex items-center gap-1.5 text-xs font-semibold">
              <PlayCircle className="size-3.5 text-amber-500" />
              Test Aura Functionality
            </span>
            <p className="text-xs text-muted-foreground mt-0.5">
              Simulate call flows without placing real emergency calls.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setTestModeActive(!testModeActive)
              toast.info(
                testModeActive ? 'Test mode deactivated' : 'Test mode activated — try dialing now!',
              )
            }}
            className="shrink-0 text-xs"
          >
            {testModeActive ? 'Disable Test' : 'Test Now'}
          </Button>
        </div>
      </section>

      {/* Medical ID / ICE Profile Card */}
      {settings.iceNotes && (
        <section aria-label="Medical ID" className="rounded-card border border-primary/20 bg-primary/5 p-4 space-y-1.5 shadow-soft">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <Stethoscope className="size-4" />
            Medical ID / ICE Profile Notes
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {settings.iceNotes}
          </p>
        </section>
      )}

      {/* Call Confirmation Dialog */}
      <Dialog open={Boolean(confirmCall)} onOpenChange={(open) => !open && setConfirmCall(null)}>
        <DialogContent className="sm:max-w-md border-rose-500/30">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="font-display text-lg font-bold flex items-center gap-2">
              <Phone className="size-5 text-rose-500 animate-bounce" />
              Confirm Emergency Call
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to dial {confirmCall?.name} ({confirmCall?.phone})?
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="ghost" size="sm" onClick={() => setConfirmCall(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => confirmCall && executeCall(confirmCall.phone)}
              className="bg-[#F43F5E] text-white hover:bg-[#E11D48]"
            >
              Call {confirmCall?.phone} Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
