'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, ChevronRight, GraduationCap, Mail, Megaphone } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { hapticFeedback } from '@/lib/utils'
import { SettingsSection, SettingsRow } from '@/components/settings/settings-card'
import { WhatsNewSheet } from '@/components/help/whats-new-dialog'
import { Button } from '@/components/ui/button'

/**
 * Help & Discover entry point in Settings: a link to the full Help Center,
 * a replayable guided tour, release notes, and a direct line to support.
 */
export function HelpSection() {
  const setRequestProductTour = useAppStore((s) => s.setRequestProductTour)
  const [whatsNewOpen, setWhatsNewOpen] = useState(false)

  return (
    <SettingsSection
      title="Help & Discover"
      description="Learn the app, revisit the tour, or see what changed."
      data-tour="settings-help"
    >
      <SettingsRow
        icon={<BookOpen className="size-4 text-primary" aria-hidden="true" />}
        title="Help Center"
        description="Searchable guides, FAQs, tips and wellness content."
        right={
          <Link
            href="/help"
            aria-label="Open Help Center"
            className="inline-flex items-center gap-0.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
          >
            Open
            <ChevronRight className="size-3.5" aria-hidden="true" />
          </Link>
        }
      />
      <SettingsRow
        icon={<GraduationCap className="size-4 text-primary" aria-hidden="true" />}
        title="Guided tour"
        description="A two-minute walkthrough of every screen and feature."
        right={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              hapticFeedback(true)
              setRequestProductTour(true)
            }}
          >
            Start
          </Button>
        }
      />
      <SettingsRow
        icon={<Megaphone className="size-4 text-primary" aria-hidden="true" />}
        title="What's New"
        description="Release notes for the latest version of Luvina."
        right={
          <Button variant="outline" size="sm" onClick={() => setWhatsNewOpen(true)}>
            View
          </Button>
        }
      />
      <SettingsRow
        icon={<Mail className="size-4 text-primary" aria-hidden="true" />}
        title="Contact support"
        description="We read every message that comes in."
        right={
          <a
            href="mailto:hello@luvina.app"
            className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
          >
            Email
          </a>
        }
      />

      <WhatsNewSheet open={whatsNewOpen} onOpenChange={setWhatsNewOpen} />
    </SettingsSection>
  )
}
