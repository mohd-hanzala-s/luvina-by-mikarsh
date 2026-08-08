import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db/db'
import {
  getAuraSettings,
  updateAuraSettings,
  addTrustedContact,
  deleteTrustedContact,
  setDefaultTrustedContact,
} from '@/lib/db/aura'

describe('Luvina Aura Database & Repositories', () => {
  beforeEach(async () => {
    await db.auraSettings.clear()
  })

  it('initializes default Aura settings if none exist', async () => {
    const settings = await getAuraSettings()
    expect(settings.enabled).toBe(true)
    expect(settings.nationalEmergencyNumber).toBe('112')
    expect(settings.womenHelplineNumber).toBe('1091')
    expect(settings.trustedContacts).toEqual([])
    expect(settings.requireConfirmation).toBe(true)
  })

  it('updates Aura configuration settings', async () => {
    await getAuraSettings()
    const updated = await updateAuraSettings({
      shareLocation: true,
      nationalEmergencyNumber: '911',
      womenHelplineNumber: '1091',
    })
    expect(updated.shareLocation).toBe(true)
    expect(updated.nationalEmergencyNumber).toBe('911')
  })

  it('adds up to 5 trusted contacts and manages default selection', async () => {
    await getAuraSettings()

    const s1 = await addTrustedContact({
      name: 'Maya',
      phone: '+1 555-0199',
      relation: 'partner',
    })
    expect(s1.trustedContacts).toHaveLength(1)
    expect(s1.trustedContacts[0].name).toBe('Maya')
    expect(s1.trustedContacts[0].isDefault).toBe(true)
    expect(s1.defaultContactId).toBe(s1.trustedContacts[0].id)

    const s2 = await addTrustedContact({
      name: 'Dad',
      phone: '+1 555-0200',
      relation: 'father',
    })
    expect(s2.trustedContacts).toHaveLength(2)
    // First contact remains default unless explicitly specified
    expect(s2.defaultContactId).toBe(s1.trustedContacts[0].id)

    // Set Dad as default
    const s3 = await setDefaultTrustedContact(s2.trustedContacts[1].id)
    expect(s3.defaultContactId).toBe(s2.trustedContacts[1].id)
    expect(s3.trustedContacts[1].isDefault).toBe(true)
  })

  it('prevents adding more than 5 trusted contacts', async () => {
    await getAuraSettings()

    for (let i = 1; i <= 5; i++) {
      await addTrustedContact({
        name: `Contact ${i}`,
        phone: `+1 555-000${i}`,
        relation: 'friend',
      })
    }

    await expect(
      addTrustedContact({
        name: 'Contact 6',
        phone: '+1 555-0006',
        relation: 'other',
      }),
    ).rejects.toThrow('Maximum of 5 trusted contacts allowed.')
  })

  it('deletes trusted contacts and reassigns default if deleted', async () => {
    await getAuraSettings()

    const s1 = await addTrustedContact({
      name: 'Husband',
      phone: '+1 555-1111',
      relation: 'husband',
    })
    const c1Id = s1.trustedContacts[0].id

    await addTrustedContact({
      name: 'Mother',
      phone: '+1 555-2222',
      relation: 'mother',
    })

    const afterDelete = await deleteTrustedContact(c1Id)
    expect(afterDelete.trustedContacts).toHaveLength(1)
    expect(afterDelete.trustedContacts[0].name).toBe('Mother')
    expect(afterDelete.defaultContactId).toBe(afterDelete.trustedContacts[0].id)
  })
})
