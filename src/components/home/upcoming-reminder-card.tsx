'use client'

import { BellRing } from 'lucide-react'
import Link from 'next/link'
import { formatShortDate, formatTime } from '@/lib/utils'
import type { UpcomingReminder } from '@/lib/reminders/upcoming'

export function UpcomingReminderCard({ reminder }: { reminder: UpcomingReminder | null }) {
  return (
    <article className="rounded-card border border-border/60 bg-card p-5 shadow-soft">
      <header className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-pill bg-warning/10 text-warning">
          <BellRing className="size-4" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-sm font-semibold">Upcoming reminder</h3>
          {reminder && (
            <p className="text-xs text-muted-foreground">
              {formatShortDate(reminder.date)} · {formatTime(reminder.time)}
            </p>
          )}
        </div>
        <Link
          href="/settings"
          className="ml-auto text-sm font-medium text-primary hover:underline"
        >
          Manage
        </Link>
      </header>
      {reminder ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{reminder.title}</p>
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          No reminders lined up. Add one in settings and Luvina will gently nudge you at the right
          moment.
        </p>
      )}
    </article>
  )
}
