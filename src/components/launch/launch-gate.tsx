'use client'

import { useEffect, useState } from 'react'
import { SplashScreen } from '@/components/onboarding/splash-screen'
import { FeaturesCard } from '@/components/onboarding/features-card'
import { OnboardingDialog } from '@/components/onboarding/onboarding-dialog'

const SPLASH_SESSION_KEY = 'luvina.splash-shown'

/**
 * Module-scoped flag that turns the splash into a cold-launch event only.
 * `useState` lives for the lifetime of the mounted component, so if the shell
 * ever remounts mid-session (route changes, tab switches, state refreshes) that
 * state would be lost and the splash could replay. This flag lives at module
 * scope, so it survives remounts — combined with the session marker below, the
 * splash can only ever appear on a genuine cold start.
 */
let splashCompleted = false

/**
 * Session marker: survives page refreshes and back/forward within the same tab,
 * but not a genuinely new session (new tab, app restart). This is what lets a
 * manual refresh resume the app without replaying the splash while still
 * keeping the splash on every true cold launch.
 */
function splashShownThisSession(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return sessionStorage.getItem(SPLASH_SESSION_KEY) === '1'
  } catch {
    return false
  }
}

function markSplashShownThisSession(): void {
  try {
    sessionStorage.setItem(SPLASH_SESSION_KEY, '1')
  } catch {
    // Session storage can be unavailable (private mode, storage blocked); the
    // module flag alone still prevents replays for in-app navigation.
  }
}

/**
 * The app-launch lifecycle gate.
 *
 * - Every cold launch shows the splash exactly once — never again for route
 *   changes, tab switches, back/forward, refreshes, or any in-app transition.
 * - First-time users then see the feature introduction cards followed by the
 *   onboarding form (Splash → Features → Onboarding → Home).
 * - Returning users skip straight to the app (Splash → Home). The onboarding
 *   completion state lives in IndexedDB (`settings.onBoardingDone`), so once it
 *   has been completed it is never shown again unless the app is reset.
 *
 * `settingsReady` decouples the splash from the asynchronous settings load:
 * the splash covers the initial load, and the first-run/returning decision is
 * only made against real persisted state.
 */
export function LaunchGate({
  isFreshInstall,
  settingsReady,
}: {
  isFreshInstall: boolean
  settingsReady: boolean
}) {
  // The splash decision depends on browser-only state (sessionStorage, the
  // Android-shell marker). Deciding it during the first render would mismatch
  // the server-rendered static export, so it is resolved after mount.
  const [mounted, setMounted] = useState(false)
  const [splashDone, setSplashDone] = useState(splashCompleted)
  const [featuresDone, setFeaturesDone] = useState(false)

  useEffect(() => {
    setMounted(true)
    setSplashDone((done) => done || splashShownThisSession())
  }, [])

  const completeSplash = () => {
    splashCompleted = true
    markSplashShownThisSession()
    setSplashDone(true)
  }

  if (!mounted) return null

  // Hold the splash screen until both the splash animation completes and settings are loaded from IndexedDB.
  // This guarantees a deterministic launch flow (Splash -> Features -> Onboarding -> Home) with zero race conditions or layout flashes.
  if (!splashDone || !settingsReady) {
    return <SplashScreen onComplete={completeSplash} />
  }

  if (isFreshInstall) {
    if (!featuresDone) {
      return <FeaturesCard onContinue={() => setFeaturesDone(true)} />
    }
    return <OnboardingDialog />
  }

  return null
}
