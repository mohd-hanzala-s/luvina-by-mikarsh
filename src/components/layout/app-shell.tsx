'use client'

import { useEffect, useState } from 'react'
import { WifiOff, ShieldAlert } from 'lucide-react'
import { useAppData } from '@/hooks/useAppData'
import { useAppStore } from '@/store/appStore'
import { NAV_ITEMS, APP_VERSION } from '@/constants'
import { BottomNav, SidebarNav, useCurrentNavPath } from '@/components/layout/navigation'
import { Wordmark } from '@/components/layout/logo'
import { scheduleReminderNotifications } from '@/lib/notifications'
import { LaunchGate } from '@/components/launch/launch-gate'
import { WelcomeTour } from '@/components/help/welcome-tour'
import { ProductTour } from '@/components/help/product-tour'
import { WhatsNewSheet } from '@/components/help/whats-new-dialog'
import { getSettings, setVersionSeen, setWelcomeTourSeen } from '@/lib/db/settings'
import { useDriveAutoBackup } from '@/hooks/useDriveAutoBackup'
import { StreeProtocolDialog } from '@/components/safety/stree-protocol-dialog'

function OfflinePill() {
  const online = useAppStore((s) => s.online)
  if (!online) return null
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
  const { reminders, prediction, settings } = useAppData()
  const [streeOpen, setStreeOpen] = useState(false)

  const reminderEnabled = settings?.notificationsEnabled ?? true
  const animationIntensity = settings?.animationIntensity ?? 'default'
  const isFreshInstall = !settings?.onBoardingDone && !settings?.nameCaptureDismissed

  useDriveAutoBackup(settings)

  const [whatsNewOpen, setWhatsNewOpen] = useState(false)
  const [welcomeDone, setWelcomeDone] = useState(false)

  const settingsReady = settings !== undefined && settings !== null

  const showWelcomeTour = Boolean(
    settings?.onBoardingDone && !settings.welcomeTourSeen && !welcomeDone,
  )

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

  const predictedNextStart = prediction?.predictedNextStart ?? null

  useEffect(() => {
    scheduleReminderNotifications(reminders, predictedNextStart, reminderEnabled)
  }, [reminders, predictedNextStart, reminderEnabled])

  useEffect(() => {
    const onVisibility = () => {
      if (!document.hidden) {
        scheduleReminderNotifications(reminders, predictedNextStart, reminderEnabled)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [reminders, predictedNextStart, reminderEnabled])

  useEffect(() => {
    void getSettings()
  }, [])

  return (
    <div className="min-h-dvh" data-animation={animationIntensity}>
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

      <StreeProtocolDialog open={streeOpen} onOpenChange={setStreeOpen} />

      {/* Desktop sidebar — pure CSS responsive rendering prevents layout flash */}
      <aside
        className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border/60 bg-card/50 backdrop-blur-xl lg:flex"
        aria-label="Sidebar"
      >
        <div className="px-6 pb-2 pt-6 flex items-center justify-between">
          <Wordmark />
          <button
            type="button"
            onClick={() => setStreeOpen(true)}
            className="flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors"
            title="Stree Protocol SOS Safety Dial"
          >
            <ShieldAlert className="size-3.5 text-rose-500" />
            SOS
          </button>
        </div>
        <SidebarNav
          items={NAV_ITEMS}
          currentPath={pathname}
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

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile / tablet header */}
        <header className="pt-safe sticky top-0 z-30 flex items-center justify-between border-b border-border/50 bg-background/70 px-5 py-3 backdrop-blur-xl lg:hidden">
          <Wordmark markClassName="size-8" className="gap-2" showSubtitle={false} />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStreeOpen(true)}
              className="flex items-center gap-1 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-bold text-rose-600 dark:text-rose-400 shadow-soft transition-transform active:scale-95"
              aria-label="Stree Protocol Safety Emergency Dial"
            >
              <ShieldAlert className="size-3.5 text-rose-500 animate-pulse" />
              Stree SOS
            </button>
            <OfflinePill />
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-4 sm:px-6 md:px-8 md:pb-32 lg:px-10 lg:pb-12 lg:pt-8">
          {children}
        </main>
      </div>

      {/* Bottom navigation — mobile and tablet */}
      <div className="lg:hidden">
        <BottomNav items={NAV_ITEMS} currentPath={pathname} />
      </div>
    </div>
  )
}
