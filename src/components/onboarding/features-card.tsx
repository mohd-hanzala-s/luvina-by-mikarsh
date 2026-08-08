'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ShieldCheck, TrendingUp, Clock, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/layout/logo'

const FEATURES = [
  {
    id: 'cycle',
    icon: Sparkles,
    emoji: '🌸',
    title: 'Your Cycle, Beautifully Understood',
    description:
      'Luvina learns your unique rhythm and turns it into gentle predictions, helpful insights, and a calmer relationship with your body.',
    badge: 'Smart & Calming',
    tint: 'bg-primary/10 text-primary border-primary/20',
  },
  {
    id: 'privacy',
    icon: ShieldCheck,
    emoji: '🔒',
    title: 'Private by Design',
    description:
      'No accounts, no tracking, no uploads. Every note you write and every check-in you tap stays on this device — only you can see it.',
    badge: '100% On-Device',
    tint: 'bg-accent/15 text-accent-strong border-accent/30',
  },
  {
    id: 'predictions',
    icon: TrendingUp,
    emoji: '📅',
    title: 'Predictions that Learn You',
    description:
      'Log your period and Luvina estimates your next one, your fertile window, and ovulation — refining itself as you log more.',
    badge: 'Adaptive Learning',
    tint: 'bg-primary/10 text-primary border-primary/20',
  },
  {
    id: 'checkin',
    icon: Clock,
    emoji: '✨',
    title: '10-Second Check-ins',
    description:
      'A tap, a slider, done. Track your mood, energy, sleep, pain, symptoms, and flow in less time than it takes to brew a coffee.',
    badge: 'Quick & Effortless',
    tint: 'bg-accent/15 text-accent-strong border-accent/30',
  },
]

/**
 * Feature highlights cards shown to first-time users right after the splash screen.
 * Presents the core product value propositions before asking for personal setup (Splash -> Product Value -> Personal Setup -> App).
 */
export function FeaturesCard({ onContinue }: { onContinue: () => void }) {
  const [visible, setVisible] = useState(true)
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const activeFeature = FEATURES[activeTab]
  const isLast = activeTab === FEATURES.length - 1

  const handleNext = () => {
    if (isLast) {
      setVisible(false)
    } else {
      setActiveTab((prev) => prev + 1)
    }
  }

  return (
    <AnimatePresence onExitComplete={onContinue}>
      {visible && (
        <div className="fixed inset-0 z-[190] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{ willChange: 'transform, opacity' }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-2xl sm:p-8"
          >
            {/* Header branding */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Logo className="size-9" />
                <span className="font-display text-lg font-semibold tracking-tight">Luvina</span>
              </div>
              <button
                type="button"
                onClick={() => setVisible(false)}
                className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Skip intro
              </button>
            </div>

            {/* Feature Slide / Content */}
            <div className="mt-6 min-h-[220px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl" aria-hidden="true">
                      {activeFeature.emoji}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${activeFeature.tint}`}
                    >
                      {activeFeature.badge}
                    </span>
                  </div>

                  <div>
                    <h2 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
                      {activeFeature.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {activeFeature.description}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Feature Grid Overview */}
            <div className="mt-6 grid grid-cols-4 gap-2">
              {FEATURES.map((f, i) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveTab(i)}
                  className={`flex flex-col items-center gap-1 rounded-xl p-2 text-center transition-all ${
                    activeTab === i
                      ? 'border border-primary bg-primary/10 shadow-soft'
                      : 'border border-border/40 bg-muted/40 hover:bg-accent'
                  }`}
                >
                  <f.icon
                    className={`size-4 ${activeTab === i ? 'text-primary' : 'text-muted-foreground'}`}
                  />
                  <span className="text-[10px] font-medium leading-tight line-clamp-1">
                    {f.id === 'cycle'
                      ? 'Understand'
                      : f.id === 'privacy'
                        ? 'Private'
                        : f.id === 'predictions'
                          ? 'Predict'
                          : '10s Check-in'}
                  </span>
                </button>
              ))}
            </div>

            {/* Controls */}
            <div className="mt-8 flex items-center justify-between pt-2">
              <div className="flex items-center gap-1.5">
                {FEATURES.map((_, i) => (
                  <span
                    key={i}
                    className={`h-2 rounded-full transition-all ${
                      i === activeTab ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>

              <Button size="lg" onClick={handleNext} className="gap-2 px-6">
                {isLast ? (
                  <>
                    <Check className="size-4" aria-hidden="true" />
                    Begin Personal Setup
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

