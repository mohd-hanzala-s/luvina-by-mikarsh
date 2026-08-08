'use client'

import { useEffect, useState } from 'react'
import { todayISO } from '@/lib/utils'

/**
 * Returns today's date (ISO, local) as a stable value across renders —
 * `todayISO()` itself is cheap, but calling it directly in a hook body
 * means every consumer's `useMemo` deps list sees a "new" value on every
 * render (a fresh string is still reference-equal for primitives, but it
 * invites re-deriving on unrelated re-renders since callers can't tell it
 * didn't change). This schedules a single update exactly at the next
 * local midnight instead of recomputing on every render, so cycle-day
 * math only re-runs when the day has genuinely changed.
 */
export function useToday(): string {
  const [today, setToday] = useState(() => todayISO())

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    const scheduleNext = () => {
      const now = new Date()
      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5)
      const msUntilMidnight = nextMidnight.getTime() - now.getTime()
      timer = setTimeout(() => {
        setToday(todayISO())
        scheduleNext()
      }, msUntilMidnight)
    }

    scheduleNext()
    return () => clearTimeout(timer)
  }, [])

  return today
}
