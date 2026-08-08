'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Logo } from '@/components/layout/logo'
import { APP_TAGLINE } from '@/constants'

const FACTS = [
  'The average menstrual cycle ranges from 21 to 35 days — and every rhythm is unique.',
  'Your cycle has four distinct phases, each with its own strengths.',
  'Nearly 1 in 10 women experience PCOS, and tracking your cycle can help you understand your body.',
  'Cycle length naturally varies — a \"regular\" cycle is simply the one that is yours.',
  'Your body is not a clock. Variation in flow, length, and symptoms is completely normal.',
  'Tracking your cycle can reveal patterns in mood, energy, and overall well-being.',
  'The luteal phase — the time between ovulation and your period — is when most PMS symptoms appear.',
  'Your data belongs to you. Luvina stores nothing on any server — ever.',
]

/**
 * Brand splash shown on every app launch. Features a breathing logo,
 * animated gradient orbs, Mikarsh branding, and a rotating carousel
 * of comforting cycle facts.
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
    }, 2800)

    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!visible) return
    const interval = window.setInterval(() => {
      setFactIndex((prev) => (prev + 1) % FACTS.length)
    }, 3000)
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
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6 overflow-hidden bg-background"
        >
          {/* Animated background orbs */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <motion.div
              className="absolute -left-32 top-1/4 size-72 rounded-full bg-primary/15"
              animate={{ scale: [1, 1.25, 1], x: [0, 30, 0], y: [0, -20, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              style={{ willChange: 'transform, filter', filter: 'blur(60px)' }}
            />
            <motion.div
              className="absolute -right-32 bottom-1/4 size-72 rounded-full bg-accent/15"
              animate={{ scale: [1, 1.2, 1], x: [0, -24, 0], y: [0, 16, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
              style={{ willChange: 'transform, filter', filter: 'blur(60px)' }}
            />
            <motion.div
              className="absolute left-1/3 -bottom-32 size-64 rounded-full bg-primary/10"
              animate={{ scale: [1, 1.15, 1], y: [0, -30, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
              style={{ willChange: 'transform, filter', filter: 'blur(50px)' }}
            />
            <motion.div
              className="absolute right-1/3 -top-20 size-56 rounded-full bg-accent/10"
              animate={{ scale: [1, 1.1, 1], y: [0, 20, 0] }}
              transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 4.5 }}
              style={{ willChange: 'transform, filter', filter: 'blur(50px)' }}
            />
          </div>

          {/* Content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.06, 1], opacity: 1 }}
            transition={{
              opacity: { duration: 0.6, delay: 0.1 },
              scale: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' },
            }}
            style={{ willChange: 'transform' }}
          >
            <Logo className="size-20" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.45 }}
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

          {/* Rotating facts */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="relative mx-auto min-h-[3rem] max-w-xs px-4 text-center sm:max-w-sm"
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={factIndex}
                initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
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
