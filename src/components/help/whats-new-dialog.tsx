'use client'

import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BadgeCheck, Clock, Megaphone, Sparkles, Wrench } from 'lucide-react'
import { WHATS_NEW, type WhatsNewRelease } from '@/lib/help/content'
import { APP_FULL_NAME } from '@/constants'
import { Logo } from '@/components/layout/logo'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

/**
 * "What's New" — release notes shown automatically after an update and
 * revisitable from Help & Discover. Rendered as a bottom sheet so it feels
 * celebratory without hijacking the app.
 */
export function WhatsNewSheet({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const releases = useMemo(() => [...WHATS_NEW].reverse(), [])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[88dvh] overflow-y-auto rounded-t-3xl p-0">
        <div className="mx-auto h-1.5 w-10 rounded-full bg-muted-foreground/25" />
        <SheetHeader className="items-center px-6 pb-2 pt-4 text-center">
          <motion.span
            initial={{ scale: 0.6, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 18 }}
            aria-hidden="true"
            className="flex size-14 items-center justify-center rounded-2xl bg-primary/10"
          >
            <Megaphone className="size-7 text-primary" />
          </motion.span>
          <SheetTitle className="text-xl">What&apos;s New</SheetTitle>
          <SheetDescription>Everything that landed in {APP_FULL_NAME}.</SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-6 pb-8 pt-2">
          {releases.map((release) => (
            <ReleaseCard key={release.version} release={release} />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function ReleaseCard({ release }: { release: WhatsNewRelease }) {
  return (
    <div className="rounded-card border border-border/60 bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Logo className="size-9" />
          <div>
            <p className="font-display text-base font-semibold">Version {release.version}</p>
            <p className="text-xs text-muted-foreground">{release.date}</p>
          </div>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          Latest
        </span>
      </div>

      <p className="mt-3 font-display text-base font-semibold">{release.headline}</p>

      <ReleaseGroup
        icon={<Sparkles className="size-4 text-primary" aria-hidden="true" />}
        title="New"
        items={release.newFeatures}
      />
      <ReleaseGroup
        icon={<BadgeCheck className="size-4 text-primary" aria-hidden="true" />}
        title="Improvements"
        items={release.improvements}
      />
      <ReleaseGroup
        icon={<Clock className="size-4 text-primary" aria-hidden="true" />}
        title="Performance"
        items={release.performance}
      />
      <ReleaseGroup
        icon={<Wrench className="size-4 text-primary" aria-hidden="true" />}
        title="Bug fixes"
        items={release.bugFixes}
      />
      <ReleaseGroup
        icon={<Megaphone className="size-4 text-primary" aria-hidden="true" />}
        title="UI"
        items={release.ui}
      />
    </div>
  )
}

function ReleaseGroup({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode
  title: string
  items: string[]
}) {
  if (items.length === 0) return null
  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        {title}
      </div>
      <ul className="mt-2 space-y-1.5">
        {items.map((item, index) => (
          <AnimatePresence key={item}>
            <motion.li
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 * index, duration: 0.25 }}
              className="flex gap-2 text-sm leading-relaxed text-foreground/90"
            >
              <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
              {item}
            </motion.li>
          </AnimatePresence>
        ))}
      </ul>
    </div>
  )
}
