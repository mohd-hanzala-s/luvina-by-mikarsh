'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, GraduationCap, Sparkles, X } from 'lucide-react'
import { WELCOME_SCREENS, type WelcomeScreen } from '@/lib/help/content'
import { hapticFeedback } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/layout/logo'
import { Button } from '@/components/ui/button'

const TINTS: Record<WelcomeScreen['tint'], string> = {
  primary: 'hsl(var(--primary))',
  fertile: 'hsl(var(--fertile))',
  period: 'hsl(var(--period))',
  ovulation: 'hsl(var(--ovulation))',
  accent: 'hsl(var(--accent))',
}

/**
 * The first-launch welcome walkthrough. Seven short, beautifully animated
 * screens tell the Luvina story before the user dives in. Finishing marks the
 * walkthrough as seen; the final screen can also hand off to the guided tour.
 */
export function WelcomeTour({
  open,
  onFinish,
  onLaunchTour,
}: {
  open: boolean
  onFinish: (completed: boolean) => void
  onLaunchTour: () => void
}) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (open) setIndex(0)
  }, [open])

  if (!open) return null

  const total = WELCOME_SCREENS.length
  const screen = WELCOME_SCREENS[index]
  const isLast = index === total - 1
  const tint = TINTS[screen.tint]

  const next = () => {
    hapticFeedback(true)
    if (isLast) {
      onFinish(true)
      return
    }
    setIndex((i) => i + 1)
  }

  const back = () => {
    hapticFeedback(true)
    setIndex((i) => Math.max(0, i - 1))
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-background/90 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Welcome to Luvina">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -left-24 -top-24 size-80 rounded-full opacity-30 blur-2xl"
        style={{ backgroundColor: tint }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -bottom-24 -right-24 size-80 rounded-full opacity-20 blur-2xl"
        style={{ backgroundColor: tint }}
      />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 py-6">
        <div className="flex items-center justify-between">
          <Logo className="size-9" />
          <Button variant="ghost" size="sm" onClick={() => onFinish(false)} aria-label="Skip welcome tour">
            <X className="size-4" aria-hidden="true" />
            Skip
          </Button>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={screen.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.96 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              style={{ willChange: 'transform, opacity' }}
              className="flex w-full flex-col items-center gap-6"
            >
              <motion.span
                initial={{ scale: 0.6, rotate: -8 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.05 }}
                aria-hidden="true"
                className="flex size-28 items-center justify-center rounded-[2rem] shadow-soft"
                style={{ backgroundColor: `hsl(var(--card))`, border: `1px solid hsl(var(--border) / 0.6)` }}
              >
                <span className="flex size-20 items-center justify-center rounded-[1.5rem] text-5xl" style={{ backgroundColor: `${tint}1f` }}>
                  {screen.emoji}
                </span>
              </motion.span>

              <div className="space-y-2.5">
                <h1 className="font-display text-2xl font-semibold tracking-tight">{screen.title}</h1>
                <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">{screen.body}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="space-y-5 pt-6">
          <div className="flex items-center justify-center gap-1.5" aria-hidden="true">
            {WELCOME_SCREENS.map((s, i) => (
              <motion.span
                key={s.id}
                animate={{ width: i === index ? 22 : 6 }}
                className={cn('h-1.5 rounded-full transition-colors', i === index ? 'bg-primary' : 'bg-muted-foreground/25')}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={back} disabled={index === 0} aria-label="Previous">
              <ArrowLeft aria-hidden="true" />
            </Button>

            {isLast ? (
              <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:justify-center">
                <Button variant="outline" onClick={onLaunchTour}>
                  <GraduationCap aria-hidden="true" />
                  Take a quick tour
                </Button>
                <Button onClick={next}>
                  <Sparkles aria-hidden="true" />
                  Get started
                </Button>
              </div>
            ) : (
              <Button className="flex-1" onClick={next}>
                Continue
                <ArrowRight aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
