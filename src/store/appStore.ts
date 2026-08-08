'use client'

import { create } from 'zustand'

/**
 * Lightweight UI state store. Domain data (cycles, logs, reminders, settings)
 * lives in IndexedDB and is read reactively with `useLiveQuery`; this store
 * only handles ephemeral UI state.
 */

interface AppState {
  online: boolean
  setOnline: (online: boolean) => void
  /** Set when the user taps "Back up now" elsewhere; Settings reads and
   * clears this to auto-open the create-backup dialog on arrival. */
  requestBackupPrompt: boolean
  setRequestBackupPrompt: (requestBackupPrompt: boolean) => void
  /** Set to launch the guided product tour from anywhere; ProductTour reads
   * and clears this so it can be re-triggered anytime. */
  requestProductTour: boolean
  setRequestProductTour: (requestProductTour: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  // Starts as `true` on every render path so a static export never renders an
  // offline pill in the server HTML; NetworkProvider syncs the real value
  // after mount.
  online: true,
  setOnline: (online) => set({ online }),
  requestBackupPrompt: false,
  setRequestBackupPrompt: (requestBackupPrompt) => set({ requestBackupPrompt }),
  requestProductTour: false,
  setRequestProductTour: (requestProductTour) => set({ requestProductTour }),
}))
