'use client'

import { motion } from 'framer-motion'

/**
 * A friendly empty state: a big emoji illustration disc, an encouraging title,
 * a short explanation of what the feature does and why nothing is there yet,
 * and an optional call to action. Used across the app so empties feel designed
 * rather than like dead ends.
 */
export function EmptyState({
  emoji,
  title,
  body,
  children,
}: {
  emoji: string
  title: string
  body: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <motion.span
        initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        aria-hidden="true"
        className="flex size-20 items-center justify-center rounded-[1.75rem] border border-primary/15 bg-primary/10 text-4xl shadow-soft"
      >
        {emoji}
      </motion.span>
      <div className="space-y-1.5">
        <h1 className="font-display text-xl font-semibold tracking-tight">{title}</h1>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
      {children}
    </div>
  )
}
