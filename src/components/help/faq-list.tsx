'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import type { FaqEntry } from '@/lib/help/content'
import { hapticFeedback } from '@/lib/utils'
import { cn } from '@/lib/utils'

/**
 * An expandable Q&A list. Answers reveal smoothly and only one item stays
 * open at a time to keep the section tidy.
 */
export function FaqAccordion({ items }: { items: FaqEntry[] }) {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div className="divide-y divide-border/60 rounded-card border border-border/60 bg-card shadow-soft">
      {items.map((item) => {
        const open = openId === item.id
        return (
          <div key={item.id}>
            <button
              type="button"
              aria-expanded={open}
              onClick={() => {
                hapticFeedback(true)
                setOpenId(open ? null : item.id)
              }}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-sm font-medium transition-colors hover:bg-accent/50"
            >
              {item.question}
              <ChevronDown
                aria-hidden="true"
                className={cn(
                  'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
                  open && 'rotate-180',
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
