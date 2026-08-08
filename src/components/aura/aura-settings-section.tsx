'use client'

import { useState } from 'react'
import {
  ShieldAlert,
  UserPlus,
  Trash2,
  Star,
  LayoutGrid,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAura } from '@/hooks/useAura'
import {
  addTrustedContact,
  deleteTrustedContact,
  setDefaultTrustedContact,
  updateAuraSettings,
} from '@/lib/db/aura'
import { hapticFeedback } from '@/lib/utils'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db/db'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { DefaultEmergencyAction, TrustedContactRelation } from '@/types/aura'

const RELATIONS: { value: TrustedContactRelation; label: string }[] = [
  { value: 'husband', label: 'Husband' },
  { value: 'father', label: 'Father' },
  { value: 'mother', label: 'Mother' },
  { value: 'friend', label: 'Friend' },
  { value: 'guardian', label: 'Guardian' },
  { value: 'partner', label: 'Partner' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'other', label: 'Custom / Other' },
]

export function AuraSettingsSection() {
  const { settings, loaded, trustedContacts } = useAura()
  const haptics = useLiveQuery(() => db.settings.get(1), [])?.hapticsEnabled ?? true

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [widgetModalOpen, setWidgetModalOpen] = useState(false)
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [relation, setRelation] = useState<TrustedContactRelation>('partner')
  const [customLabel, setCustomLabel] = useState('')
  const [saving, setSaving] = useState(false)

  const [nationalNumber, setNationalNumber] = useState(settings?.nationalEmergencyNumber ?? '112')
  const [womenNumber, setWomenNumber] = useState(settings?.womenHelplineNumber ?? '1091')
  const [iceNotes, setIceNotes] = useState(settings?.iceNotes ?? '')

  if (!loaded) return null

  const handleToggleEnabled = async (enabled: boolean) => {
    hapticFeedback(haptics)
    await updateAuraSettings({ enabled })
    toast.success(enabled ? 'Luvina Aura enabled' : 'Luvina Aura disabled')
  }

  const handleToggleConfirmation = async (requireConfirmation: boolean) => {
    hapticFeedback(haptics)
    await updateAuraSettings({ requireConfirmation })
  }

  const handleToggleLocation = async (shareLocation: boolean) => {
    hapticFeedback(haptics)
    await updateAuraSettings({ shareLocation })
    toast.success(
      shareLocation
        ? 'Location sharing enabled for emergency SMS'
        : 'Location sharing disabled',
    )
  }

  const handleActionChange = async (defaultEmergencyAction: DefaultEmergencyAction) => {
    hapticFeedback(haptics)
    await updateAuraSettings({ defaultEmergencyAction })
    toast.success('Default emergency action updated')
  }

  const handleSaveNumbers = async () => {
    hapticFeedback(haptics)
    await updateAuraSettings({
      nationalEmergencyNumber: nationalNumber.trim() || '112',
      womenHelplineNumber: womenNumber.trim() || '1091',
      iceNotes: iceNotes.trim() || null,
    })
    toast.success('Emergency numbers & Medical ID saved')
  }

  const handleAddContact = async () => {
    if (!contactPhone.trim()) {
      toast.error('Phone number is required')
      return
    }
    setSaving(true)
    try {
      await addTrustedContact({
        name: contactName.trim() || 'Trusted Contact',
        phone: contactPhone.trim(),
        relation,
        customLabel: relation === 'other' ? customLabel.trim() : undefined,
      })
      hapticFeedback(haptics)
      toast.success('Trusted contact added')
      setAddModalOpen(false)
      setContactName('')
      setContactPhone('')
      setCustomLabel('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not add contact'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteContact = async (id: string, name: string) => {
    hapticFeedback(haptics)
    await deleteTrustedContact(id)
    toast.success(`Removed ${name}`)
  }

  const handleSetDefault = async (id: string, name: string) => {
    hapticFeedback(haptics)
    await setDefaultTrustedContact(id)
    toast.success(`${name} set as primary trusted contact`)
  }

  return (
    <section
      id="aura"
      aria-label="Luvina Aura Safety Settings"
      className="rounded-card border border-rose-500/30 bg-card p-5 sm:p-6 shadow-soft space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
            <ShieldAlert className="size-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-bold text-rose-600 dark:text-rose-400">
              Luvina Aura 🛡️
            </h2>
            <p className="text-xs text-muted-foreground">
              Personal safety module with instant emergency dialing &amp; trusted contacts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="aura-toggle" className="text-xs font-semibold">
            {settings.enabled ? 'Enabled' : 'Disabled'}
          </Label>
          <Switch
            id="aura-toggle"
            checked={settings.enabled}
            onCheckedChange={handleToggleEnabled}
          />
        </div>
      </div>

      {settings.enabled && (
        <div className="space-y-6 pt-2">
          {/* Section 1: Trusted Contacts (Up to 5) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-sm font-semibold">Trusted Loved Ones</h3>
                <p className="text-xs text-muted-foreground">
                  Save up to 5 contacts (Husband, Parent, Friend, Guardian) for 1-tap SOS dialing.
                </p>
              </div>

              {trustedContacts.length < 5 && (
                <Button
                  size="sm"
                  onClick={() => setAddModalOpen(true)}
                  className="gap-1 bg-rose-600 text-white hover:bg-rose-700 text-xs"
                >
                  <UserPlus className="size-3.5" />
                  Add Contact ({trustedContacts.length}/5)
                </Button>
              )}
            </div>

            {trustedContacts.length > 0 ? (
              <div className="grid gap-2.5 sm:grid-cols-2">
                {trustedContacts.map((contact) => {
                  const isDefault = contact.id === settings.defaultContactId || contact.isDefault
                  return (
                    <div
                      key={contact.id}
                      className={`flex items-center justify-between rounded-2xl border p-3.5 shadow-soft transition-all ${
                        isDefault
                          ? 'border-rose-500/40 bg-rose-500/5 ring-1 ring-rose-500/20'
                          : 'border-border/60 bg-muted/30'
                      }`}
                    >
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm truncate">{contact.name}</span>
                          {isDefault && (
                            <span className="flex items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                              <Star className="size-3 fill-rose-500" /> Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground capitalize">
                          {contact.customLabel || RELATIONS.find((r) => r.value === contact.relation)?.label || contact.relation}
                        </p>
                        <p className="text-xs font-semibold tabular-nums text-foreground/90">
                          {contact.phone}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        {!isDefault && (
                          <Button
                            size="iconSm"
                            variant="ghost"
                            onClick={() => handleSetDefault(contact.id, contact.name)}
                            title="Set as Default Emergency Contact"
                            className="text-muted-foreground hover:text-amber-500"
                          >
                            <Star className="size-3.5" />
                          </Button>
                        )}
                        <Button
                          size="iconSm"
                          variant="ghost"
                          onClick={() => handleDeleteContact(contact.id, contact.name)}
                          title="Delete Contact"
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                No trusted contacts added yet. Tap &ldquo;Add Contact&rdquo; to configure emergency phone numbers.
              </div>
            )}
          </div>

          {/* Section 2: Emergency Numbers Configuration */}
          <div className="space-y-3 rounded-2xl border border-border/60 bg-card p-4">
            <h3 className="font-display text-sm font-semibold">National &amp; Women Helplines</h3>

            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div>
                <Label htmlFor="national-num">National Emergency Number</Label>
                <Input
                  id="national-num"
                  value={nationalNumber}
                  onChange={(e) => setNationalNumber(e.target.value)}
                  placeholder="e.g. 112 / 911"
                  className="mt-1 h-9 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="women-num">Women Helpline Number</Label>
                <Input
                  id="women-num"
                  value={womenNumber}
                  onChange={(e) => setWomenNumber(e.target.value)}
                  placeholder="e.g. 1091"
                  className="mt-1 h-9 text-xs"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="ice-notes">Medical ID / ICE Profile Notes (Optional)</Label>
              <Textarea
                id="ice-notes"
                value={iceNotes}
                onChange={(e) => setIceNotes(e.target.value)}
                placeholder="e.g. Blood Type: A+, Allergies: Penicillin, Emergency Notes..."
                className="mt-1 text-xs min-h-[60px]"
              />
            </div>

            <div className="flex justify-end pt-1">
              <Button size="sm" onClick={handleSaveNumbers} className="text-xs">
                Save Emergency Settings
              </Button>
            </div>
          </div>

          {/* Section 3: Dialing & Safety Preferences */}
          <div className="space-y-3 rounded-2xl border border-border/60 bg-card p-4 text-xs">
            <h3 className="font-display text-sm font-semibold">Dialing &amp; Consent Preferences</h3>

            <div>
              <Label htmlFor="default-action">Default Widget &amp; Quick Emergency Action</Label>
              <select
                id="default-action"
                value={settings.defaultEmergencyAction}
                onChange={(e) => handleActionChange(e.target.value as DefaultEmergencyAction)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
              >
                <option value="open-screen">Open Luvina Aura Emergency Screen</option>
                <option value="call-default-trusted">Call Primary Trusted Contact</option>
                <option value="call-women-helpline">Call Women Helpline (1091)</option>
                <option value="call-national-emergency">Call National Emergency (112)</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <div>
                <p className="font-semibold">Confirmation Before Dialing</p>
                <p className="text-muted-foreground">Show confirmation prompt before executing phone call.</p>
              </div>
              <Switch
                checked={settings.requireConfirmation}
                onCheckedChange={handleToggleConfirmation}
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <div>
                <p className="font-semibold">Location Consent for Emergency SMS</p>
                <p className="text-muted-foreground">Include Google Maps position in copied SOS text message.</p>
              </div>
              <Switch
                checked={settings.shareLocation}
                onCheckedChange={handleToggleLocation}
              />
            </div>
          </div>

          {/* Section 4: Home Screen Widget Setup Helper */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/10 p-4 text-xs">
            <div className="space-y-0.5">
              <span className="flex items-center gap-1.5 font-bold text-primary">
                <LayoutGrid className="size-4" />
                Android Home-Screen Widget
              </span>
              <p className="text-muted-foreground">
                Add 2×2 Luvina Widget for 1-tap Check-In, Aura SOS &amp; Cycle Today status.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWidgetModalOpen(true)}
              className="shrink-0 text-xs gap-1 border-primary/30 text-primary"
            >
              Widget Setup Guide
            </Button>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="font-display text-base font-bold">Add Trusted Contact</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Save a partner, parent, or trusted friend for 1-tap emergency dialing.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2 text-xs">
            <div>
              <Label htmlFor="contact-name">Name</Label>
              <Input
                id="contact-name"
                placeholder="e.g. Maya / Mom / Husband"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="mt-1 h-9 text-xs"
              />
            </div>

            <div>
              <Label htmlFor="contact-phone">Phone Number (Required)</Label>
              <Input
                id="contact-phone"
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="mt-1 h-9 text-xs"
              />
            </div>

            <div>
              <Label htmlFor="contact-rel">Relationship Tag</Label>
              <select
                id="contact-rel"
                value={relation}
                onChange={(e) => setRelation(e.target.value as TrustedContactRelation)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
              >
                {RELATIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {relation === 'other' && (
              <div>
                <Label htmlFor="custom-label">Custom Relation Label</Label>
                <Input
                  id="custom-label"
                  placeholder="e.g. Neighbor / Roommate"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  className="mt-1 h-9 text-xs"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="ghost" size="sm" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddContact} disabled={saving}>
              Save Contact
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Widget Setup Guide Modal */}
      <Dialog open={widgetModalOpen} onOpenChange={setWidgetModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="font-display text-base font-bold flex items-center gap-2">
              <LayoutGrid className="size-5 text-primary" />
              How to Add Luvina Home-Screen Widget
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 text-xs leading-relaxed text-muted-foreground pt-2">
            <ol className="list-decimal space-y-2 pl-4">
              <li>Go to your Android phone home screen.</li>
              <li>Press and hold any empty space on your home screen.</li>
              <li>Tap <strong>Widgets</strong>.</li>
              <li>Scroll down and find <strong>Luvina</strong>.</li>
              <li>Drag the <strong>Luvina Aura 2×2 Widget</strong> onto your screen!</li>
            </ol>
            <div className="rounded-xl bg-muted p-3 text-[11px]">
              ✨ Gives you 1-tap access to <strong>🌸 Check In</strong>, <strong>🛡️ Aura SOS</strong>, and <strong>📅 Cycle Today</strong>.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
