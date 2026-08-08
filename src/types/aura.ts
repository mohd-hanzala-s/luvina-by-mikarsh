/**
 * Luvina Aura — Personal Safety Module Types
 */

export type TrustedContactRelation =
  | 'husband'
  | 'father'
  | 'mother'
  | 'friend'
  | 'guardian'
  | 'partner'
  | 'sibling'
  | 'doctor'
  | 'other'

export interface AuraTrustedContact {
  id: string
  name: string
  phone: string
  relation: TrustedContactRelation
  customLabel?: string
  isDefault?: boolean
  createdAt: number
}

export type DefaultEmergencyAction =
  | 'open-screen'
  | 'call-default-trusted'
  | 'call-women-helpline'
  | 'call-national-emergency'

export interface AuraSettings {
  id: number
  enabled: boolean
  defaultEmergencyAction: DefaultEmergencyAction
  nationalEmergencyNumber: string
  womenHelplineNumber: string
  trustedContacts: AuraTrustedContact[]
  defaultContactId: string | null
  requireConfirmation: boolean
  instantDial: boolean
  shareLocation: boolean
  iceNotes?: string | null
  updatedAt: number
}
