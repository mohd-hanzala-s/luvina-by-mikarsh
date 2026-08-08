'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Clock, Lightbulb } from 'lucide-react'
import {
  ARTICLE_CATEGORY_LABELS,
  HELP_ARTICLES,
  type HelpArticle,
} from '@/lib/help/content'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

const ARTICLE_INDEX = Object.fromEntries(HELP_ARTICLES.map((article) => [article.id, article]))

/**
 * Full-screen article reader for the Help Center. Expandable-feeling sections
 * (animated, spaced), numbered steps, tip callouts and related-article links.
 */
export function HelpArticleSheet({
  article,
  onClose,
  onOpenRelated,
}: {
  article: HelpArticle | null
  onClose: () => void
  onOpenRelated: (id: string) => void
}) {
  if (!article) return null

  const related = article.related
    .map((id) => ARTICLE_INDEX[id])
    .filter((a): a is HelpArticle => Boolean(a))

  return (
    <Sheet open={article !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="max-h-[92dvh] overflow-y-auto rounded-t-3xl p-0">
        <div className="mx-auto h-1.5 w-10 rounded-full bg-muted-foreground/25" />
        <SheetHeader className="px-6 pt-4">
          <motion.span
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 240, damping: 18 }}
            aria-hidden="true"
            className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-2xl"
          >
            {article.emoji}
          </motion.span>
          <SheetTitle className="text-xl">{article.title}</SheetTitle>
          <SheetDescription className="flex items-center gap-3">
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground/80">
              {ARTICLE_CATEGORY_LABELS[article.category]}
            </span>
            <span className="inline-flex items-center gap-1 text-xs">
              <Clock className="size-3.5" aria-hidden="true" />
              {article.minutes} min read
            </span>
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-6 pb-8 pt-3">
          {article.sections.map((section, index) => (
            <motion.section
              key={section.heading}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * index, duration: 0.25 }}
              className="space-y-2.5"
            >
              <h3 className="font-display text-base font-semibold tracking-tight">
                {section.heading}
              </h3>
              {section.body && (
                <p className="text-sm leading-relaxed text-muted-foreground">{section.body}</p>
              )}
              {section.steps && section.steps.length > 0 && (
                <ol className="space-y-2">
                  {section.steps.map((step, stepIndex) => (
                    <li key={step} className="flex gap-2.5 text-sm leading-relaxed text-foreground/90">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary"
                      >
                        {stepIndex + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              )}
              {section.tip && (
                <div className="flex items-start gap-2 rounded-card bg-accent/60 p-3 text-sm leading-relaxed">
                  <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent-foreground" aria-hidden="true" />
                  <p className="text-accent-foreground">{section.tip}</p>
                </div>
              )}
            </motion.section>
          ))}

          {related.length > 0 && (
            <section className="rounded-card border border-border/60 bg-muted/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Related
              </p>
              <div className="mt-2 space-y-1">
                {related.map((relatedArticle) => (
                  <button
                    key={relatedArticle.id}
                    type="button"
                    onClick={() => onOpenRelated(relatedArticle.id)}
                    className="group flex w-full items-center justify-between gap-3 rounded-xl px-2 py-2 text-left text-sm font-medium text-foreground/90 transition-colors hover:bg-accent"
                  >
                    <span className="flex items-center gap-2">
                      <span aria-hidden="true">{relatedArticle.emoji}</span>
                      {relatedArticle.title}
                    </span>
                    <ArrowRight
                      className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
