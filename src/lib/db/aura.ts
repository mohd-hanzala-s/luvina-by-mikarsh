import { db } from '@/lib/db/db'
import type { AuraSettings, AuraTrustedContact, TrustedContactRelation } from '@/types/aura'

export const DEFAULT_AURA_SETTINGS: AuraSettings = {
  id: 1,
  enabled: true,
  defaultEmergencyAction: 'open-screen',
  nationalEmergencyNumber: '112',
  womenHelplineNumber: '1091',
  trustedContacts: [],
  defaultContactId: null,
  requireConfirmation: true,
  instantDial: false,
  shareLocation: false,
  iceNotes: null,
  updatedAt: Date.now(),
}

export async function getAuraSettings(): Promise<AuraSettings> {
  const existing = await db.auraSettings.get(1)
  if (existing) return existing

  await db.auraSettings.put(DEFAULT_AURA_SETTINGS)
  return DEFAULT_AURA_SETTINGS
}

export async function updateAuraSettings(
  changes: Partial<Omit<AuraSettings, 'id'>>,
): Promise<AuraSettings> {
  const current = await getAuraSettings()
  const updated: AuraSettings = {
    ...current,
    ...changes,
    updatedAt: Date.now(),
  }
  await db.auraSettings.put(updated)
  return updated
}

export async function addTrustedContact(contact: {
  name: string
  phone: string
  relation: TrustedContactRelation
  customLabel?: string
  isDefault?: boolean
}): Promise<AuraSettings> {
  const current = await getAuraSettings()

  if (current.trustedContacts.length >= 5) {
    throw new Error('Maximum of 5 trusted contacts allowed.')
  }

  const newContact: AuraTrustedContact = {
    id: `aura-contact-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: contact.name.trim(),
    phone: contact.phone.trim(),
    relation: contact.relation,
    customLabel: contact.customLabel?.trim() || undefined,
    isDefault: Boolean(contact.isDefault || current.trustedContacts.length === 0),
    createdAt: Date.now(),
  }

  let updatedContacts = [...current.trustedContacts]

  // If set as default or first contact, unset existing defaults
  if (newContact.isDefault) {
    updatedContacts = updatedContacts.map((c) => ({ ...c, isDefault: false }))
  }

  updatedContacts.push(newContact)

  const defaultId = newContact.isDefault
    ? newContact.id
    : current.defaultContactId || newContact.id

  return updateAuraSettings({
    trustedContacts: updatedContacts,
    defaultContactId: defaultId,
  })
}

export async function updateTrustedContact(
  id: string,
  changes: Partial<Omit<AuraTrustedContact, 'id' | 'createdAt'>>,
): Promise<AuraSettings> {
  const current = await getAuraSettings()

  let updatedContacts = current.trustedContacts.map((c) => {
    if (c.id === id) {
      return { ...c, ...changes }
    }
    return c
  })

  if (changes.isDefault) {
    updatedContacts = updatedContacts.map((c) => ({
      ...c,
      isDefault: c.id === id,
    }))
  }

  return updateAuraSettings({
    trustedContacts: updatedContacts,
    defaultContactId: changes.isDefault ? id : current.defaultContactId,
  })
}

export async function deleteTrustedContact(id: string): Promise<AuraSettings> {
  const current = await getAuraSettings()
  const updatedContacts = current.trustedContacts.filter((c) => c.id !== id)

  let newDefaultId = current.defaultContactId
  if (current.defaultContactId === id) {
    newDefaultId = updatedContacts[0]?.id ?? null
    if (updatedContacts[0]) {
      updatedContacts[0].isDefault = true
    }
  }

  return updateAuraSettings({
    trustedContacts: updatedContacts,
    defaultContactId: newDefaultId,
  })
}

export async function setDefaultTrustedContact(id: string): Promise<AuraSettings> {
  return updateTrustedContact(id, { isDefault: true })
}
