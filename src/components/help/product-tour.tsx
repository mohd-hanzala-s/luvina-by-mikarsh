'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Loader2, X } from 'lucide-react'
import { TOUR_STEPS } from '@/lib/help/content'
import { setProductTourSeen } from '@/lib/db/settings'
import { useAppStore } from '@/store/appStore'
import { hapticFeedback } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

const TOOLTIP_ESTIMATED_HEIGHT = 200

/**
 * The guided product tour. Highlights one element at a time with a spotlight
 * cutout, dims the rest of the app, and walks the person through every screen.
 * Steps reference stable `data-tour` selectors so the tour survives refactors.
 */
export function ProductTour() {
  const router = useRouter()
  const pathname = usePathname()
  const requestProductTour = useAppStore((s) => s.requestProductTour)
  const setRequestProductTour = useAppStore((s) => s.setRequestProductTour)

  const [index, setIndex] = useState(0)
  const [target, setTarget] = useState<Rect | null>(null)
  const [centered, setCentered] = useState(false)
  const [tooltip, setTooltip] = useState<{ top: number; left: number; below: boolean } | null>(null)
  const [navigating, setNavigating] = useState(false)

  const activeElRef = useRef<HTMLElement | null>(null)
  const navigatingRef = useRef(false)

  const open = requestProductTour

  const close = useCallback(
    (completed: boolean) => {
      setRequestProductTour(false)
      activeElRef.current = null
      setTarget(null)
      setCentered(false)
      setTooltip(null)
      setNavigating(false)
      navigatingRef.current = false
      void setProductTourSeen(completed)
      hapticFeedback(true)
    },
    [setRequestProductTour],
  )

  useEffect(() => {
    if (open) {
      setIndex(0)
      setNavigating(false)
      navigatingRef.current = false
    }
  }, [open])

  const measure = useCallback((el: HTMLElement) => {
    const rect = el.getBoundingClientRect()
    setTarget({ top: rect.top, left: rect.left, width: rect.width, height: rect.height })
  }, [])

  const positionTooltip = useCallback(() => {
    const el = activeElRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const tipW = Math.min(320, vw - 24)
    const tipH = TOOLTIP_ESTIMATED_HEIGHT
    const below = rect.bottom + 16 + tipH <= vh - 16
    const top = below ? rect.bottom + 16 : Math.max(16, rect.top - 16 - tipH)
    const left = Math.min(Math.max(16, rect.left + rect.width / 2 - tipW / 2), vw - tipW - 16)
    setTooltip({ top, left, below })
  }, [])

  useEffect(() => {
    if (!open) return
    const step = TOUR_STEPS[index]
    if (!step) return

    // If we need to navigate to a different route, show a loading step
    // and push the route. `replace` (not `push`) so stepping through the
    // whole tour doesn't pile entries onto the WebView back-stack — with
    // `push`, finishing a multi-screen tour meant the hardware/gesture back
    // button had to walk through every visited tour step before it would
    // actually leave the screen. The effect re-runs once pathname matches.
    if (step.route !== pathname) {
      setNavigating(true)
      navigatingRef.current = true
      activeElRef.current = null
      setTarget(null)
      setCentered(false)
      setTooltip(null)
      router.replace(step.route)
      return
    }

    // Route matches — clear navigating after a short settle delay so the
    // page has time to render before we try to find elements.
    if (navigatingRef.current) {
      navigatingRef.current = false
      const settleTimer = window.setTimeout(() => {
        setNavigating(false)
      }, 500)
      return () => window.clearTimeout(settleTimer)
    }

    activeElRef.current = null
    setTarget(null)
    setCentered(false)
    setTooltip(null)

    if (step.selector === null) {
      setCentered(true)
      return
    }

    let cancelled = false
    let tries = 0
    const attempt = () => {
      if (cancelled) return
      const el = document.querySelector<HTMLElement>(`[data-tour="${step.selector}"]`)
      if (el) {
        activeElRef.current = el
        el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' })
        window.setTimeout(() => {
          if (cancelled) return
          measure(el)
        }, 420)
        return
      }
      tries += 1
      if (tries < 20) {
        window.setTimeout(attempt, 400)
      } else {
        setCentered(true)
      }
    }
    attempt()

    return () => {
      cancelled = true
    }
  }, [open, index, pathname, router, measure, navigating])

  useEffect(() => {
    if (!open || centered || navigating || !activeElRef.current || !target) return
    positionTooltip()
  }, [open, centered, navigating, target, positionTooltip])

  useEffect(() => {
    if (!open) return
    const onViewportChange = () => {
      if (activeElRef.current) {
        measure(activeElRef.current)
        positionTooltip()
      }
    }
    window.addEventListener('resize', onViewportChange)
    window.addEventListener('scroll', onViewportChange, { capture: true, passive: true })
    return () => {
      window.removeEventListener('resize', onViewportChange)
      window.removeEventListener('scroll', onViewportChange, { capture: true })
    }
  }, [open, measure, positionTooltip])

  const goNext = useCallback(() => {
    hapticFeedback(true)
    if (index === TOUR_STEPS.length - 1) {
      close(true)
      return
    }
    setIndex((i) => i + 1)
  }, [index, close])

  const goBack = useCallback(() => {
    hapticFeedback(true)
    setIndex((i) => Math.max(0, i - 1))
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(false)
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goBack()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close, goNext, goBack])

  if (!open) return null

  const step = TOUR_STEPS[index]
  const isLast = index === TOUR_STEPS.length - 1
  const isFirst = index === 0

  const controls = (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={goBack}
        disabled={isFirst || navigating}
        aria-label="Previous step"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
      </Button>
      <Button size="sm" onClick={goNext} disabled={navigating}>
        {isLast ? 'Finish' : 'Next'}
        {!isLast && !navigating && <ArrowRight className="size-4" aria-hidden="true" />}
      </Button>
    </>
  )

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Guided tour">
      {navigating ? (
        <div className="fixed inset-0 z-[70] bg-black/55 backdrop-blur-[2px]" aria-hidden="true" />
      ) : centered ? (
        <div className="fixed inset-0 z-[70] bg-black/55 backdrop-blur-[2px]" aria-hidden="true" />
      ) : (
        target && (
          <div
            aria-hidden="true"
            className="pointer-events-none fixed z-[71] rounded-2xl ring-2 ring-primary"
            style={{
              top: target.top,
              left: target.left,
              width: target.width,
              height: target.height,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.55)',
            }}
          />
        )
      )}

      {navigating ? (
        <div className="fixed inset-0 z-[75] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 rounded-card border border-border/60 bg-card p-8 shadow-lifted"
          >
            <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
            <p className="text-sm font-medium text-muted-foreground">Loading next step...</p>
          </motion.div>
        </div>
      ) : centered ? (
        <div className="fixed inset-0 z-[75] flex items-center justify-center p-6">
          <TourCard
            stepIndex={index}
            total={TOUR_STEPS.length}
            title={step.title}
            body={step.body}
            onSkip={() => close(false)}
            controls={controls}
          />
        </div>
      ) : (
        tooltip && (
          <div
            className="fixed z-[80] w-[calc(100%-24px)] max-w-[320px]"
            style={{ top: tooltip.top, left: tooltip.left }}
          >
            <TourCard
              stepIndex={index}
              total={TOUR_STEPS.length}
              title={step.title}
              body={step.body}
              onSkip={() => close(false)}
              controls={controls}
            />
          </div>
        )
      )}
    </div>
  )
}

function TourCard({
  stepIndex,
  total,
  title,
  body,
  onSkip,
  controls,
}: {
  stepIndex: number
  total: number
  title: string
  body: string
  onSkip: () => void
  controls: React.ReactNode
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepIndex}
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.18 }}
        style={{ willChange: 'transform, opacity' }}
        className="rounded-card border border-border/60 bg-card p-5 shadow-lifted"
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">
            Step {stepIndex + 1} of {total}
          </p>
          <button
            type="button"
            onClick={onSkip}
            aria-label="Skip tour"
            className="rounded-xl p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
          <motion.div
            className="h-full bg-primary"
            initial={false}
            animate={{ width: `${((stepIndex + 1) / total) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <h2 className="mt-3 font-display text-base font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
        <div className="mt-4 flex items-center justify-between gap-2">{controls}</div>
      </motion.div>
    </AnimatePresence>
  )
}
