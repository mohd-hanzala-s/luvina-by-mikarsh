'use client'

import { useState } from 'react'
import { BookOpen, Droplets, HeartPulse, Lock, Mail, ScrollText, ShieldCheck, WifiOff } from 'lucide-react'
import { APP_FULL_NAME, APP_VERSION } from '@/constants'
import { Logo } from '@/components/layout/logo'
import { SettingsSection, SettingsRow } from '@/components/settings/settings-card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

export function AboutSection() {
  const [doc, setDoc] = useState<'privacy' | 'terms' | 'licenses' | null>(null)

  return (
    <SettingsSection title="About">
      <div className="flex flex-col items-center gap-3 border-b border-border/50 px-5 py-6 text-center">
        <Logo className="size-12" />
        <div>
          <p className="font-display text-base font-semibold">{APP_FULL_NAME}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Version {APP_VERSION}</p>
        </div>
        <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
          Our mission is simple: help you understand your body and embrace your flow — privately,
          beautifully, and entirely on your own device.
        </p>
      </div>
      <SettingsRow
        icon={<ShieldCheck className="size-4 text-primary" aria-hidden="true" />}
        title="Privacy by design"
        description="No accounts, no analytics, no tracking. Your data never leaves this device."
      />
      <SettingsRow
        icon={<WifiOff className="size-4" aria-hidden="true" />}
        title="Works offline"
        description="Every feature works without an internet connection once installed."
      />
      <SettingsRow
        icon={<Lock className="size-4" aria-hidden="true" />}
        title="Your data stays local"
        description="Everything is stored in your browser's private database and protected by optional encrypted backups you control."
      />
      <SettingsRow
        icon={<HeartPulse className="size-4" aria-hidden="true" />}
        title="Not medical advice"
        description="Luvina is a personal tracking tool. Cycle predictions are estimates. Consult a healthcare professional for medical decisions."
      />
      <SettingsRow
        icon={<ScrollText className="size-4" aria-hidden="true" />}
        title="Privacy policy"
        description="How your data is handled — short version: it stays with you."
        right={<DocLink onClick={() => setDoc('privacy')} />}
      />
      <SettingsRow
        icon={<BookOpen className="size-4" aria-hidden="true" />}
        title="Terms of use"
        description="The friendly rules for using Luvina."
        right={<DocLink onClick={() => setDoc('terms')} />}
      />
      <SettingsRow
        icon={<BookOpen className="size-4" aria-hidden="true" />}
        title="Licenses"
        description="Open-source software we build upon."
        right={<DocLink onClick={() => setDoc('licenses')} />}
      />
      <SettingsRow
        icon={<Mail className="size-4" aria-hidden="true" />}
        title="Get in touch"
        description="Our official email will be available in a future release."
        right={
          <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
            Coming Soon
          </span>
        }
      />
      <SettingsRow
        icon={<Droplets className="size-4" aria-hidden="true" />}
        title="Made with care"
        description="Crafted by Mikarsh with attention to every detail."
      />

      <DocSheet doc={doc} onClose={() => setDoc(null)} />
    </SettingsSection>
  )
}

function DocLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
    >
      Read
    </button>
  )
}

const DOCS: Record<'privacy' | 'terms' | 'licenses', { title: string; body: string[] }> = {
  privacy: {
    title: 'Privacy policy',
    body: [
      'Luvina is designed around one principle: your personal data belongs to you, and only you.',
      'We do not have accounts. We do not collect, transmit, or sell any of your data. There are no analytics, no ad trackers, and no third-party cookies.',
      'All of your cycle data, notes, settings and reminders are stored locally on this device in a private database. Nothing is uploaded anywhere.',
      'Backups are encrypted with a password that only you know. We cannot recover or decrypt your backup without that password.',
      'If you clear your browser data or remove the app, your local data is permanently erased. Please export a backup if you ever want a copy.',
      'Because data lives only on your device, deleting the app is the ultimate delete — there is nothing stored on any server to remove.',
    ],
  },
  terms: {
    title: 'Terms of use',
    body: [
      'By using Luvina you agree to use it as a personal wellness and tracking tool.',
      'Luvina provides educational information and cycle predictions based on the data you enter. These are estimates and are not medical advice.',
      'You should not use Luvina as the sole basis for health, contraceptive, or medical decisions. Always consult a qualified healthcare professional.',
      'You are responsible for the accuracy of the data you record and for keeping any backups you create safe.',
      'We make no warranties about the availability or accuracy of the service. You use the app at your own discretion.',
    ],
  },
  licenses: {
    title: 'Licenses',
    body: [
      'Luvina is built with Lucide, Radix, date-fns, Framer Motion, Dexie, Recharts and Tailwind CSS.',
      'Owned by Mikarsh.',
    ],
  },
}

function DocSheet({
  doc,
  onClose,
}: {
  doc: 'privacy' | 'terms' | 'licenses' | null
  onClose: () => void
}) {
  const data = doc ? DOCS[doc] : null
  return (
    <Sheet open={doc !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="max-h-[80dvh] overflow-y-auto rounded-t-3xl p-0">
        {data && (
          <>
            <div className="mx-auto h-1.5 w-10 rounded-full bg-muted-foreground/25" />
            <SheetHeader className="px-6 pt-4">
              <SheetTitle>{data.title}</SheetTitle>
              <SheetDescription>Last updated with Luvina v{APP_VERSION}</SheetDescription>
            </SheetHeader>
            <div className="space-y-4 px-6 pb-8 pt-2">
              {data.body.map((paragraph, index) => (
                <p key={index} className="text-sm leading-relaxed text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
