'use client'

import { useState } from 'react'
import { BookOpen, CircleHelp, Lightbulb, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { CONTEXTUAL_HELP, type ContextualHelpContent } from '@/lib/help/content'
import { hapticFeedback } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

/**
 * A small "?" button in a page header that opens an on-screen explanation of
 * what the page does, why it matters, how to use it, and a couple of tips —
 * without ever leaving the screen.
 */
export function HelpButton({
  screen,
  label,
}: {
  screen: keyof typeof CONTEXTUAL_HELP
  label?: string
}) {
  const [open, setOpen] = useState(false)
  const content = CONTEXTUAL_HELP[screen]

  return (
    <>
      <button
        type="button"
        onClick={() => {
          hapticFeedback(true)
          setOpen(true)
        }}
        aria-label={`Help about ${content.title}`}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-background/60 text-muted-foreground shadow-soft backdrop-blur transition-all hover:bg-accent hover:text-foreground active:scale-95"
      >
        <CircleHelp className="size-5" aria-hidden="true" />
        {label && <span className="sr-only">{label}</span>}
      </button>

      <Sheet open={open} onOpenChange={(next) => !next && setOpen(false)}>
        <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto rounded-t-3xl p-0">
          <div className="mx-auto h-1.5 w-10 rounded-full bg-muted-foreground/25" />
          <SheetHeader className="px-6 pt-4">
            <SheetTitle>{content.title}</SheetTitle>
            <SheetDescription>{content.summary}</SheetDescription>
          </SheetHeader>
          <div className="space-y-5 px-6 pb-8 pt-3">
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="size-4 text-primary" aria-hidden="true" />
                Why it matters
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{content.why}</p>
            </section>

            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <BookOpen className="size-4 text-primary" aria-hidden="true" />
                How to use it
              </h3>
              <ol className="mt-2 space-y-2">
                {content.how.map((step, index) => (
                  <li key={step} className="flex gap-2.5 text-sm leading-relaxed text-foreground/90">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary"
                    >
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </section>

            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Lightbulb className="size-4 text-primary" aria-hidden="true" />
                Tips
              </h3>
              <ul className="mt-2 space-y-1.5">
                {content.tips.map((tip) => (
                  <li key={tip} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                    <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                    {tip}
                  </li>
                ))}
              </ul>
            </section>

            <Link
              href="/help"
              className="flex items-center justify-center gap-2 rounded-button bg-muted px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
            >
              <BookOpen className="size-4" aria-hidden="true" />
              Explore Help &amp; Discover
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

export type ContextualHelpContentType = ContextualHelpContent
