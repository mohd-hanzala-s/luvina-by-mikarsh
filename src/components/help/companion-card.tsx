'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Compass, HeartHandshake } from 'lucide-react'
import Link from 'next/link'
import { CompanionAvatar } from '@/components/ui/companion-avatar'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/appStore'
import { hapticFeedback } from '@/lib/utils'

const COMPANION_MESSAGES = [
  'Hi, I\u2019m Luvi! I\u2019m here whenever you need a warm, gentle guide.',
  'Let\u2019s understand your cycle together at your own patient pace.',
  'Need help or hygiene tips? I\u2019m right here with a cup of tea for you.',
  'A gentle reminder: your rhythm is uniquely yours and always valid.',
  'Your health journey is 100% private, safe, and stored on this device.',
]

interface CompanionCardProps {
  greeting?: string
  compact?: boolean
  className?: string
}

/**
 * Luvina Companion Card:
 * Replaces generic AI assistant branding with a warm, supportive,
 * female healthcare guide ("Your Companion").
 */
export function CompanionCard({ greeting, compact = false, className = '' }: CompanionCardProps) {
  const setRequestProductTour = useAppStore((s) => s.setRequestProductTour)
  const [messageIndex, setMessageIndex] = useState(0)

  const currentMessage = greeting ?? COMPANION_MESSAGES[messageIndex]

  const handleNextMessage = () => {
    hapticFeedback(true)
    setMessageIndex((prev) => (prev + 1) % COMPANION_MESSAGES.length)
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-3 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-accent/10 p-3.5 shadow-soft ${className}`}>
        <CompanionAvatar className="size-10" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-primary">Your Companion</p>
          <p className="text-xs text-muted-foreground truncate">{currentMessage}</p>
        </div>
        <Button asChild variant="ghost" size="sm" className="h-8 px-2.5 text-xs">
          <Link href="/help">Guide</Link>
        </Button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-accent/15 p-5 shadow-soft sm:p-6 ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-primary/10 blur-2xl"
      />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <CompanionAvatar className="size-14 ring-4 ring-background/80" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-display text-base font-semibold">Luvi (Robot Doctor)</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                <HeartHandshake className="size-3" aria-hidden="true" />
                AI Health Mentor
              </span>
            </div>

            <p
              onClick={handleNextMessage}
              className="cursor-pointer text-sm leading-relaxed text-muted-foreground transition-colors hover:text-foreground"
              title="Tap to change tip"
            >
              &ldquo;{currentMessage}&rdquo;
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              hapticFeedback(true)
              setRequestProductTour(true)
            }}
            className="gap-1.5 text-xs"
          >
            <Compass className="size-3.5 text-primary" aria-hidden="true" />
            Tour
          </Button>

          <Button asChild size="sm" className="gap-1.5 text-xs">
            <Link href="/help">
              <BookOpen className="size-3.5" aria-hidden="true" />
              Hygiene &amp; Health Guide
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
