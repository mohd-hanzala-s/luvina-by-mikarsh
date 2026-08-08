'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Shield, TrendingUp, CalendarCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

const features = [
  {
    icon: CalendarCheck,
    title: 'Track Your Cycle',
    description: 'Log symptoms, moods, and flow with a few taps.',
  },
  {
    icon: TrendingUp,
    title: 'Smart Predictions',
    description: 'Get forecasts based on your unique patterns.',
  },
  {
    icon: Shield,
    title: 'Private by Design',
    description: 'Everything stays on your device — nothing leaves it.',
  },
  {
    icon: Sparkles,
    title: 'Beautiful Insights',
    description: 'See your trends in clear, actionable charts.',
  },
]

/**
 * Feature highlights card shown to first-time users right after the splash
 * screen and before the onboarding form. Gives context for what Luvina does
 * before asking for personal data.
 */
export function FeaturesCard({ onContinue }: { onContinue: () => void }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  return (
    <AnimatePresence onExitComplete={onContinue}>
      {visible && (
        <div className="fixed inset-0 z-[190] flex items-end justify-center bg-black/50 backdrop-blur-sm p-4 sm:items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{ willChange: 'transform, opacity' }}
            className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl sm:p-8"
          >
            <h2 className="text-center font-display text-2xl font-semibold tracking-tight">
              Welcome to Luvina
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Everything you need to understand your cycle — private, smart, and beautiful.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="flex items-start gap-3 rounded-xl border border-border/50 p-4"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                    <f.icon className="size-4 text-accent-strong" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{f.title}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {f.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button className="mt-8 w-full" size="lg" onClick={() => setVisible(false)}>
              Get Started
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
