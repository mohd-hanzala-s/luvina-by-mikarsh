'use client'

import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'
import { useAppData } from '@/hooks/useAppData'
import { useAppStore } from '@/store/appStore'
import { NAV_ITEMS, APP_VERSION } from '@/constants'
import { BottomNav, SidebarNav, useCurrentNavPath } from '@/components/layout/navigation'
import { Wordmark } from '@/components/layout/logo'
import { scheduleReminderNotifications } from '@/lib/notifications'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { LaunchGate } from '@/components/launch/launch-gate'
import { WelcomeTour } from '@/components/help/welcome-tour'
import { ProductTour } from '@/components/help/product-tour'
import { WhatsNewSheet } from '@/components/help/whats-new-dialog'
import { getSettings, setVersionSeen, setWelcomeTourSeen } from '@/lib/db/settings'
import { useDriveAutoBackup } from '@/hooks/useDriveAutoBackup'

function OfflinePill() {
  const online = useAppStore((s) => s.online)
  if (online) return null
  return (
    <div
      role="status"
      className="inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-2.5 py-1 text-xs font-medium text-warning"
    >
      <WifiOff className="size-3.5" aria-hidden="true" />
      Offline
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useCurrentNavPath()
  const isDesktop = useIsDesktop()
  const { reminders, prediction, settings } = useAppData()

  const reminderEnabled = settings?.notificationsEnabled ?? true
  const animationIntensity = settings?.animationIntensity ?? 'default'
  // A true fresh install: onboarding has not been completed and the first-run
  // name prompt has never been answered/skipped. Anyone who has completed
  // onboarding (or already went through the legacy name prompt) is a returning
  // user and skips the introduction entirely.
  const isFreshInstall = !settings?.onBoardingDone && !settings?.nameCaptureDismissed

  useDriveAutoBackup(settings)

  const [whatsNewOpen, setWhatsNewOpen] = useState(false)
  const [welcomeDone, setWelcomeDone] = useState(false)

  // Settings load asynchronously from Dexie. The splash inside LaunchGate
  // covers that initial load; the first-run/returning decision is only made
  // once real persisted settings are available.
  const settingsReady = settings !== undefined && settings !== null

  // The welcome walkthrough runs once, right after a fresh install finishes
  // onboarding. Existing users (who never completed the new onboarding) skip
  // straight to What's New instead.
  const showWelcomeTour = Boolean(
    settings?.onBoardingDone && !settings.welcomeTourSeen && !welcomeDone,
  )

  // What's New auto-displays after an update — but only for people who are
  // already past first-run setup, so brand-new installs aren't double-dipped.
  useEffect(() => {
    if (!settings) return
    const shouldAutoShow =
      !settings.onBoardingDone &&
      settings.nameCaptureDismissed &&
      !settings.whatsNewDismissed &&
      settings.lastSeenVersion !== APP_VERSION
    if (!shouldAutoShow) return
    const timer = window.setTimeout(() => setWhatsNewOpen(true), 700)
    return () => window.clearTimeout(timer)
  }, [
    settings,
    settings?.onBoardingDone,
    settings?.nameCaptureDismissed,
    settings?.whatsNewDismissed,
    settings?.lastSeenVersion,
  ])

  useEffect(() => {
    scheduleReminderNotifications(reminders, prediction?.predictedNextStart ?? null, reminderEnabled)
  }, [reminders, prediction, reminderEnabled])

  // Re-schedule when the app comes back into the foreground so timers that
  // were paused in the background are picked up again.
  useEffect(() => {
    const onVisibility = () => {
      if (!document.hidden) {
        scheduleReminderNotifications(
          reminders,
          prediction?.predictedNextStart ?? null,
          reminderEnabled,
        )
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [reminders, prediction, reminderEnabled])

  // Eagerly ensure the settings row exists in IndexedDB so that
  // useLiveQuery returns a real object (settingsReady becomes true)
  // and the splash screen can complete even on a fresh install.
  useEffect(() => {
    void getSettings()
  }, [])

  return (
    <div className="min-h-dvh" data-animation={animationIntensity}>
      {/* The splash is a launch-lifecycle event managed by LaunchGate: it can
          only ever appear on a genuine page load and never replays for in-app
          navigation. */}
      <LaunchGate isFreshInstall={isFreshInstall} settingsReady={settingsReady} />

      <WelcomeTour
        open={showWelcomeTour}
        onFinish={() => {
          setWelcomeDone(true)
          void setWelcomeTourSeen(true)
        }}
        onLaunchTour={() => {
          setWelcomeDone(true)
          void setWelcomeTourSeen(true)
          useAppStore.getState().setRequestProductTour(true)
        }}
      />

      <ProductTour />

      <WhatsNewSheet
        open={whatsNewOpen}
        onOpenChange={(open) => {
          setWhatsNewOpen(open)
          if (!open) void setVersionSeen(APP_VERSION)
        }}
      />

      {/* Desktop sidebar */}
      {isDesktop && (
        <aside
          className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border/60 bg-card/50 backdrop-blur-xl lg:flex"
          aria-label="Sidebar"
        >
          <div className="px-6 pb-2 pt-6">
            <Wordmark />
          </div>
          <SidebarNav items={NAV_ITEMS} currentPath={pathname}
            footer={
              <div className="flex flex-col gap-3">
                <OfflinePill />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Your data never leaves this device.
                </p>
              </div>
            }
          />
        </aside>
      )}

      {/* Main content */}
      <div className={isDesktop ? 'lg:pl-64' : ''}>
        {/* Mobile / tablet header */}
        <header className="pt-safe sticky top-0 z-30 flex items-center justify-between border-b border-border/50 bg-background/70 px-5 py-3 backdrop-blur-xl lg:hidden">
          <Wordmark markClassName="size-8" className="gap-2" showSubtitle={false} />
          <OfflinePill />
        </header>

        <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-4 sm:px-6 md:px-8 md:pb-32 lg:px-10 lg:pb-12 lg:pt-8">
          {children}
        </main>
      </div>

      {/* Bottom navigation — mobile and tablet */}
      {!isDesktop && <BottomNav items={NAV_ITEMS} currentPath={pathname} />}
    </div>
  )
}
