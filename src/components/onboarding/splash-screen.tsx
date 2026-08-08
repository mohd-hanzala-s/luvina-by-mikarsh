'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Logo } from '@/components/layout/logo'
import { APP_TAGLINE } from '@/constants'

const FACTS = [
  'The average menstrual cycle ranges from 21 to 35 days — and every rhythm is unique.',
  'Your cycle has four distinct phases, each with its own strengths.',
  'Nearly 1 in 10 women experience PCOS, and tracking your cycle can help you understand your body.',
  'Cycle length naturally varies — a "regular" cycle is simply the one that is yours.',
  'Your body is not a clock. Variation in flow, length, and symptoms is completely normal.',
  'Tracking your cycle can reveal patterns in mood, energy, and overall well-being.',
  'Your data belongs to you. Luvina stores nothing on any server — ever.',
]

/**
 * Performance-optimized splash screen.
 * Uses GPU-accelerated opacity & scale transforms for butter-smooth 60fps rendering
 * on Android WebView without heavy CSS backdrop-blur lag.
 */
export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true)
  const [factIndex, setFactIndex] = useState(0)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(false)
    }, 2400)

    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!visible) return
    const interval = window.setInterval(() => {
      setFactIndex((prev) => (prev + 1) % FACTS.length)
    }, 2400)
    return () => window.clearInterval(interval)
  }, [visible])

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6 overflow-hidden bg-background"
          style={{ willChange: 'opacity' }}
        >
          {/* Subtle GPU radial background glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary-opacity-10)_0%,transparent_70%)]"
          />

          {/* Merged Animated Breathing Logo */}
          <div className="relative flex items-center justify-center">
            <motion.div
              className="absolute size-28 rounded-full bg-primary/10"
              animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ willChange: 'transform, opacity' }}
            />
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: [1, 1.05, 1], opacity: 1 }}
              transition={{
                opacity: { duration: 0.4, delay: 0.1 },
                scale: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
              }}
              style={{ willChange: 'transform, opacity' }}
            >
              <Logo className="size-20 drop-shadow-md" />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.3 }}
            className="flex flex-col items-center gap-1.5"
          >
            <h1 className="font-display text-3xl font-semibold tracking-tight">Luvina</h1>
            <p className="text-sm font-medium tracking-[0.3em] text-accent-strong">
              by&nbsp;M&nbsp;I&nbsp;K&nbsp;&Lambda;&nbsp;R&nbsp;S&nbsp;H
            </p>
            <div
              aria-hidden="true"
              className="mt-3 h-px w-24 bg-gradient-to-r from-transparent via-accent-strong/60 to-transparent"
            />
            <p className="mt-2 max-w-[16rem] text-center font-display text-base font-medium leading-snug tracking-tight text-foreground/80 sm:max-w-sm">
              {APP_TAGLINE}
            </p>
          </motion.div>

          {/* Comforting facts carousel */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            className="relative mx-auto min-h-[3rem] max-w-xs px-4 text-center sm:max-w-sm"
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={factIndex}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="text-xs leading-relaxed text-muted-foreground"
              >
                {FACTS[factIndex]}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
