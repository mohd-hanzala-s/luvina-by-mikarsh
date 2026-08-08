'use client'

import { StickyNote } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import type { DayLog } from '@/types'

/** The most recent journal note across all days. */
export function LatestNoteCard({ latestNote }: { latestNote: DayLog | null }) {
  return (
    <article className="rounded-card border border-border/60 bg-card p-5 shadow-soft">
      <header className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <StickyNote className="size-4" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-sm font-semibold">Latest note</h3>
          {latestNote && (
            <p className="text-xs text-muted-foreground">
              {format(parseISO(latestNote.date), 'EEEE, MMM d')}
            </p>
          )}
        </div>
      </header>
      {latestNote?.note ? (
        <p className="mt-3 line-clamp-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {latestNote.note}
        </p>
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          No notes yet. Your daily check-in thoughts will land here.
        </p>
      )}
    </article>
  )
}
