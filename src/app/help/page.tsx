'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Bug,
  ChevronRight,
  Clock,
  GraduationCap,
  Lightbulb,
  Mail,
  Megaphone,
  Search,
  Sparkles,
  X,
} from 'lucide-react'
import {
  ARTICLE_CATEGORY_LABELS,
  FAQS,
  HELP_ARTICLES,
  SMART_TIPS,
  type ArticleCategory,
  type HelpArticle,
} from '@/lib/help/content'
import { hapticFeedback } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/appStore'
import { EmptyState } from '@/components/ui/empty-state'
import { HelpArticleSheet } from '@/components/help/help-article'
import { FaqAccordion } from '@/components/help/faq-list'
import { WhatsNewSheet } from '@/components/help/whats-new-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const CATEGORIES: { value: ArticleCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'getting-started', label: 'Getting started' },
  { value: 'features', label: 'Features' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'privacy', label: 'Privacy' },
  { value: 'troubleshooting', label: 'Troubleshooting' },
]

function articleMatches(article: HelpArticle, q: string): boolean {
  const haystack = [
    article.title,
    article.keywords.join(' '),
    article.sections.map((s) => s.heading).join(' '),
  ]
    .join(' ')
    .toLowerCase()
  return haystack.includes(q)
}

function faqMatches(faq: (typeof FAQS)[number], q: string): boolean {
  return `${faq.question} ${faq.answer} ${faq.keywords.join(' ')}`.toLowerCase().includes(q)
}

export default function HelpPage() {
  const router = useRouter()
  const setRequestProductTour = useAppStore((s) => s.setRequestProductTour)

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<ArticleCategory | 'all'>('all')
  const [article, setArticle] = useState<HelpArticle | null>(null)
  const [whatsNewOpen, setWhatsNewOpen] = useState(false)

  const q = query.trim().toLowerCase()

  const searchResults = useMemo(() => {
    if (!q) return null
    return {
      articles: HELP_ARTICLES.filter((a) => articleMatches(a, q)),
      faqs: FAQS.filter((f) => faqMatches(f, q)),
    }
  }, [q])

  const visibleArticles = useMemo(() => {
    if (searchResults) return searchResults.articles
    return category === 'all' ? HELP_ARTICLES : HELP_ARTICLES.filter((a) => a.category === category)
  }, [searchResults, category])

  const grouped = useMemo(() => {
    const order: ArticleCategory[] = ['getting-started', 'features', 'wellness', 'privacy', 'troubleshooting']
    return order
      .map((cat) => ({ cat, articles: visibleArticles.filter((a) => a.category === cat) }))
      .filter((group) => group.articles.length > 0)
  }, [visibleArticles])

  const searching = searchResults !== null
  const noResults =
    searching &&
    (searchResults?.articles.length ?? 0) === 0 &&
    (searchResults?.faqs.length ?? 0) === 0

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) router.back()
              else router.push('/')
            }}
            aria-label="Back"
            className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background/60 text-muted-foreground shadow-soft backdrop-blur transition-all hover:bg-accent hover:text-foreground active:scale-95"
          >
            <ArrowLeft className="size-4.5" aria-hidden="true" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">Help &amp; Discover</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Guides, FAQs, tips and everything about Luvina.
            </p>
          </div>
        </div>
      </header>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search guides, FAQ and tips… e.g. Calendar"
          aria-label="Search help"
          className="h-12 pl-11 pr-10"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {noResults ? (
        <EmptyState
          emoji="🔍"
          title="No matches yet"
          body={`Nothing in the Help Center matched "${query}". Try a broader word like "calendar", "backup" or "theme".`}
        >
          <Button variant="outline" onClick={() => setQuery('')}>
            Clear search
          </Button>
        </EmptyState>
      ) : (
        <>
          {!searching && (
            <>
              <section aria-label="Quick actions" className="grid grid-cols-2 gap-3">
                <QuickAction
                  icon={<GraduationCap className="size-5 text-primary" aria-hidden="true" />}
                  title="Start the tour"
                  body="A guided walkthrough of every screen."
                  onClick={() => {
                    hapticFeedback(true)
                    setRequestProductTour(true)
                  }}
                />
                <QuickAction
                  icon={<Megaphone className="size-5 text-primary" aria-hidden="true" />}
                  title="What's New"
                  body="The latest version of Luvina."
                  onClick={() => {
                    hapticFeedback(true)
                    setWhatsNewOpen(true)
                  }}
                />
                <QuickAction
                  icon={<Bug className="size-5 text-primary" aria-hidden="true" />}
                  title="Report a bug"
                  body="Tell us what went wrong."
                  onClick={() => {
                    hapticFeedback(true)
                    router.push('/settings')
                  }}
                />
                <QuickAction
                  icon={<Lightbulb className="size-5 text-primary" aria-hidden="true" />}
                  title="Suggest a feature"
                  body="Shape what Luvina becomes."
                  onClick={() => {
                    hapticFeedback(true)
                    router.push('/settings')
                  }}
                />
              </section>

              <section aria-label="Browse topics">
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={category === option.value}
                      onClick={() => {
                        hapticFeedback(true)
                        setCategory(option.value)
                      }}
                      className={cn(
                        'h-9 rounded-full px-3.5 text-sm font-medium transition-all active:scale-95',
                        category === option.value
                          ? 'border border-primary bg-primary/10 text-primary'
                          : 'border border-border text-muted-foreground hover:bg-accent',
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}

          {searching && (searchResults?.articles.length ?? 0) > 0 && (
            <section className="space-y-3">
              <h2 className="font-display text-base font-semibold">Guides</h2>
              <div className="space-y-2.5">
                {(searchResults?.articles ?? []).map((item) => (
                  <ArticleCard key={item.id} article={item} onOpen={() => setArticle(item)} />
                ))}
              </div>
            </section>
          )}

          {!searching &&
            grouped.map(({ cat, articles }) => (
              <section key={cat} className="space-y-3">
                <h2 className="font-display text-base font-semibold">{ARTICLE_CATEGORY_LABELS[cat]}</h2>
                <div className="space-y-2.5">
                  {articles.map((item) => (
                    <ArticleCard key={item.id} article={item} onOpen={() => setArticle(item)} />
                  ))}
                </div>
              </section>
            ))}

          {searching && (searchResults?.faqs.length ?? 0) > 0 && (
            <section className="space-y-3">
              <h2 className="font-display text-base font-semibold">Questions</h2>
              <FaqAccordion items={searchResults?.faqs ?? []} />
            </section>
          )}

          {!searching && (
            <>
              <section className="space-y-3">
                <h2 className="font-display text-base font-semibold">Frequently asked questions</h2>
                <FaqAccordion items={FAQS} />
              </section>

              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" aria-hidden="true" />
                  <h2 className="font-display text-base font-semibold">Tips &amp; tricks</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {SMART_TIPS.map((tip, index) => (
                    <motion.div
                      key={tip.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.25 }}
                      className="rounded-card border border-border/60 bg-card p-4 shadow-soft"
                    >
                      <span aria-hidden="true" className="text-2xl">
                        {tip.emoji}
                      </span>
                      <p className="mt-2 text-sm font-semibold">{tip.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{tip.body}</p>
                    </motion.div>
                  ))}
                </div>
              </section>

              <section className="flex flex-col items-center gap-3 rounded-card border border-primary/15 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-6 text-center shadow-soft">
                <Mail className="size-5 text-primary" aria-hidden="true" />
                <div>
                  <p className="font-display text-base font-semibold">Still have a question?</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Write to us anytime — we read every message.
                  </p>
                </div>
                <a
                  href="mailto:hello@luvina.app"
                  className="inline-flex items-center gap-2 rounded-button bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-soft transition-all hover:bg-primary/90"
                >
                  Contact support
                </a>
              </section>
            </>
          )}
        </>
      )}

      <HelpArticleSheet
        article={article}
        onClose={() => setArticle(null)}
        onOpenRelated={(id) => {
          const next = HELP_ARTICLES.find((a) => a.id === id)
          if (next) setArticle(next)
        }}
      />
      <WhatsNewSheet open={whatsNewOpen} onOpenChange={setWhatsNewOpen} />
    </div>
  )
}

function QuickAction({
  icon,
  title,
  body,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  body: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-start gap-2 rounded-card border border-border/60 bg-card p-4 text-left shadow-soft transition-all hover:border-primary/40 hover:shadow-lifted active:scale-[0.98]"
    >
      <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10">{icon}</span>
      <span className="flex items-center gap-1 text-sm font-semibold">
        {title}
        <ChevronRight
          className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </span>
      <span className="text-xs leading-relaxed text-muted-foreground">{body}</span>
    </button>
  )
}

function ArticleCard({ article, onOpen }: { article: HelpArticle; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={() => {
        hapticFeedback(true)
        onOpen()
      }}
      className="group flex w-full items-center gap-4 rounded-card border border-border/60 bg-card p-4 text-left shadow-soft transition-all hover:border-primary/40 hover:shadow-lifted active:scale-[0.99]"
    >
      <span
        aria-hidden="true"
        className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl"
      >
        {article.emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{article.title}</span>
        <span className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-muted px-2 py-0.5">{ARTICLE_CATEGORY_LABELS[article.category]}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" aria-hidden="true" />
            {article.minutes} min
          </span>
        </span>
      </span>
      <ChevronRight
        className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </button>
  )
}
