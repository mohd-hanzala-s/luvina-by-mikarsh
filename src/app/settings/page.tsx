'use client'

import { useEffect } from 'react'
import { ProfileSection } from '@/components/settings/profile-section'
import { PersonalSection } from '@/components/settings/personal-section'
import { ThemeSection } from '@/components/settings/theme-section'
import { CycleSettings } from '@/components/settings/cycle-settings'
import { NotificationsSection } from '@/components/settings/notifications-section'
import { BackupSection } from '@/components/settings/backup-section'
import { DataSection } from '@/components/settings/data-section'
import { HelpSection } from '@/components/settings/help-section'
import { FeedbackSection } from '@/components/settings/feedback-section'
import { AboutSection } from '@/components/settings/about-section'
import { HelpButton } from '@/components/help/contextual-help'

export default function SettingsPage() {
  useEffect(() => {
    if (window.location.hash === '#feedback') {
      // Small delay so the DOM has painted the section
      const raf = requestAnimationFrame(() => {
        const el = document.getElementById('feedback')
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      })
      return () => cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your preferences are saved locally and apply instantly.
          </p>
        </div>
        <HelpButton screen="settings" label="Help about settings" />
      </header>

      <ProfileSection />
      <ThemeSection />
      <PersonalSection />
      <CycleSettings />
      <NotificationsSection />
      <BackupSection />
      <DataSection />
      <HelpSection />
      <FeedbackSection />
      <AboutSection />
    </div>
  )
}
