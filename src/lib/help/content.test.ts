import { describe, expect, it } from 'vitest'
import {
  ARTICLE_CATEGORY_LABELS,
  CONTEXTUAL_HELP,
  FAQS,
  HELP_ARTICLES,
  SMART_TIPS,
  TOUR_STEPS,
  WELCOME_SCREENS,
  WHATS_NEW,
  type ArticleCategory,
} from '@/lib/help/content'
import { APP_VERSION } from '@/constants'

/**
 * Canary tests for the Help & Discover content. They keep the content module
 * internally consistent (unique ids, resolvable links, valid enum values) and
 * pin the `data-tour` selectors so the pages and the tour can't drift apart.
 */
describe('help content', () => {
  it('welcome walkthrough has seven unique screens with a celebratory finale', () => {
    expect(WELCOME_SCREENS).toHaveLength(7)
    const ids = new Set(WELCOME_SCREENS.map((s) => s.id))
    expect(ids.size).toBe(WELCOME_SCREENS.length)
    for (const screen of WELCOME_SCREENS) {
      expect(screen.title.length).toBeGreaterThan(0)
      expect(screen.body.length).toBeGreaterThan(0)
      expect(screen.emoji.length).toBeGreaterThan(0)
      expect([...screen.emoji].length).toBe(1)
      expect(['primary', 'fertile', 'period', 'ovulation', 'accent']).toContain(screen.tint)
    }
    expect(WELCOME_SCREENS[WELCOME_SCREENS.length - 1].title.toLowerCase()).toContain("all set")
  })

  it('tour steps reference unique selectors that exist in the app', () => {
    const expectedSelectors = ['checkin-card', 'fab', 'month-grid', 'settings-backup']
    const actualSelectors = TOUR_STEPS.map((s) => s.selector).filter(
      (selector): selector is string => selector !== null,
    )
    expect(actualSelectors.sort()).toEqual(expectedSelectors.sort())

    const validRoutes = ['/', '/calendar', '/history', '/insights', '/help', '/settings']
    for (const step of TOUR_STEPS) {
      expect(validRoutes).toContain(step.route)
      expect(step.title.length).toBeGreaterThan(0)
      expect(step.body.length).toBeGreaterThan(0)
    }
  })

  it('contextual help exists for every screen with complete content', () => {
    expect(Object.keys(CONTEXTUAL_HELP).sort()).toEqual([
      'about',
      'calendar',
      'history',
      'home',
      'insights',
      'settings',
    ])
    for (const content of Object.values(CONTEXTUAL_HELP)) {
      expect(content.title.length).toBeGreaterThan(0)
      expect(content.summary.length).toBeGreaterThan(0)
      expect(content.why.length).toBeGreaterThan(0)
      expect(content.how.length).toBeGreaterThan(0)
      expect(content.tips.length).toBeGreaterThan(0)
    }
  })

  it('articles have unique ids, valid categories and resolvable related links', () => {
    const ids = new Set(HELP_ARTICLES.map((a) => a.id))
    expect(ids.size).toBe(HELP_ARTICLES.length)
    for (const article of HELP_ARTICLES) {
      expect(ARTICLE_CATEGORY_LABELS[article.category as ArticleCategory]).toBeDefined()
      expect(article.minutes).toBeGreaterThan(0)
      expect(article.sections.length).toBeGreaterThan(0)
      const headings = new Set(article.sections.map((s) => s.heading))
      expect(headings.size).toBe(article.sections.length)
      for (const relatedId of article.related) {
        expect(ids.has(relatedId), `${article.id} → missing related ${relatedId}`).toBe(true)
      }
    }
  })

  it('faqs are unique and complete', () => {
    expect(FAQS).toHaveLength(11)
    const ids = new Set(FAQS.map((f) => f.id))
    expect(ids.size).toBe(FAQS.length)
    for (const faq of FAQS) {
      expect(faq.question.length).toBeGreaterThan(0)
      expect(faq.answer.length).toBeGreaterThan(0)
    }
  })

  it('smart tips are unique and point at real screens', () => {
    const ids = new Set(SMART_TIPS.map((t) => t.id))
    expect(ids.size).toBe(SMART_TIPS.length)
    for (const tip of SMART_TIPS) {
      expect(tip.title.length).toBeGreaterThan(0)
      if (tip.action) {
        expect(['/', '/calendar', '/insights', '/settings']).toContain(tip.action.href)
      }
    }
  })

  it('whats-new covers the current app version', () => {
    expect(WHATS_NEW.length).toBeGreaterThan(0)
    expect(WHATS_NEW[WHATS_NEW.length - 1].version).toBe(APP_VERSION)
  })
})
