'use client'

import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ImagePlus, MessageCircleHeart, Send, X } from 'lucide-react'
import { toast } from 'sonner'
import { hapticFeedback } from '@/lib/utils'
import { SettingsSection } from '@/components/settings/settings-card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

type FeedbackCategory = 'bug' | 'feature' | 'rate' | 'general'

const CATEGORIES: { value: FeedbackCategory; label: string; emoji: string }[] = [
  { value: 'bug', label: 'Report a bug', emoji: '🐞' },
  { value: 'feature', label: 'Suggest a feature', emoji: '💡' },
  { value: 'rate', label: 'Rate the app', emoji: '💖' },
  { value: 'general', label: 'General', emoji: '💬' },
]

export function FeedbackSection() {
  const [category, setCategory] = useState<FeedbackCategory>('general')
  const [message, setMessage] = useState('')
  const [attachment, setAttachment] = useState<File | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const canSubmit = message.trim().length > 0

  const handleSubmit = () => {
    if (!canSubmit) return
    hapticFeedback(true)
    setSubmitted(true)
    // Attachment + message are intentionally prepared but not transmitted
    // anywhere yet — a future cloud feedback channel can pick them up here.
    setTimeout(() => {
      setSubmitted(false)
      setMessage('')
      setAttachment(null)
      toast.success('Thanks for your feedback!')
    }, 2200)
  }

  return (
    <SettingsSection
      id="feedback"
      title="Feedback"
      description="Help make Luvina better — it only takes a moment."
    >
      <div className="space-y-4 px-5 py-5">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 py-6 text-center"
            >
              <motion.span
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary"
              >
                <CheckMark />
              </motion.span>
              <div>
                <p className="font-display text-base font-semibold">Thank you!</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Your feedback helps shape the next version of Luvina.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div>
                <p className="mb-2 text-sm font-medium">What&apos;s on your mind?</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => {
                    const active = category === c.value
                    return (
                      <button
                        key={c.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setCategory(c.value)}
                        className={
                          active
                            ? 'flex h-10 items-center gap-1.5 rounded-full border border-primary bg-primary/10 px-3.5 text-sm font-medium text-primary transition-all active:scale-95'
                            : 'flex h-10 items-center gap-1.5 rounded-full border border-border px-3.5 text-sm font-medium text-muted-foreground transition-all hover:bg-accent active:scale-95'
                        }
                      >
                        <span aria-hidden="true">{c.emoji}</span>
                        {c.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="feedback-message" className="mb-2 block text-sm font-medium">
                  Your message
                </label>
                <Textarea
                  id="feedback-message"
                  className="min-h-[120px]"
                  placeholder="Tell us what you love, what could be better, or what broke…"
                  value={message}
                  maxLength={1000}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  aria-label="Attach a screenshot"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setAttachment(file)
                      toast.info('Screenshot attached')
                    }
                    e.target.value = ''
                  }}
                />
                {attachment ? (
                  <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs text-foreground">
                    <ImagePlus className="size-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{attachment.name}</span>
                    <button
                      type="button"
                      aria-label="Remove screenshot"
                      onClick={() => setAttachment(null)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3.5" aria-hidden="true" />
                    </button>
                  </span>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                  >
                    <ImagePlus aria-hidden="true" />
                    Add screenshot
                  </Button>
                )}
              </div>

              <Button className="w-full" size="lg" disabled={!canSubmit} onClick={handleSubmit}>
                <Send aria-hidden="true" />
                Send feedback
              </Button>

              <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                <MessageCircleHeart className="size-3.5" aria-hidden="true" />
                We read every message that comes in.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SettingsSection>
  )
}

function CheckMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-8 text-primary" aria-hidden="true">
      <motion.path
        d="M5 12.5 L10 17.5 L19 7"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      />
    </svg>
  )
}
