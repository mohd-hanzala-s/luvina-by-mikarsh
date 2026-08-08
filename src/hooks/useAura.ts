import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db/db'
import { DEFAULT_AURA_SETTINGS, getAuraSettings } from '@/lib/db/aura'
import { useEffect } from 'react'

export function useAura() {
  const auraSettings = useLiveQuery(() => db.auraSettings.get(1), [])

  useEffect(() => {
    void getAuraSettings()
  }, [])

  const loaded = auraSettings !== undefined
  const settings = auraSettings ?? DEFAULT_AURA_SETTINGS
  const defaultContact = settings.trustedContacts.find(
    (c) => c.id === settings.defaultContactId || c.isDefault,
  ) ?? settings.trustedContacts[0] ?? null

  return {
    settings,
    loaded,
    enabled: settings.enabled,
    trustedContacts: settings.trustedContacts,
    defaultContact,
  }
}
