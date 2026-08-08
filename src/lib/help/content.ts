/**
 * Content for the Help & Discover experience: the first-launch welcome
 * walkthrough, the replayable guided product tour, per-screen contextual
 * help, help-center articles, FAQs, smart tips and release notes.
 *
 * Everything here is plain structured data (plus emoji "illustrations") so
 * the experience stays lightweight, consistent, and easy to localize later.
 */

export interface WelcomeScreen {
  id: string
  emoji: string
  title: string
  body: string
  /** Which brand accent tints the illustration disc. */
  tint: 'primary' | 'fertile' | 'period' | 'ovulation' | 'accent'
}

export const WELCOME_SCREENS: WelcomeScreen[] = [
  {
    id: 'purpose',
    emoji: '🌸',
    title: 'Your cycle, beautifully understood',
    body: 'Luvina learns your unique rhythm and turns it into gentle predictions, helpful insights and a calmer relationship with your body.',
    tint: 'primary',
  },
  {
    id: 'privacy',
    emoji: '🔒',
    title: 'Private by design',
    body: 'No accounts, no tracking, no uploads. Every note you write and every check-in you tap stays on this device — only you can see it.',
    tint: 'fertile',
  },
  {
    id: 'tracking',
    emoji: '📅',
    title: 'Predictions that learn you',
    body: 'Log a period and Luvina estimates your next one, your fertile window and ovulation — then refines itself as you log more.',
    tint: 'period',
  },
  {
    id: 'checkin',
    emoji: '✨',
    title: '10-second check-ins',
    body: 'A tap, a slider, done. Track your mood, energy, sleep, pain, symptoms and flow in less time than it takes to brew a coffee.',
    tint: 'ovulation',
  },
  {
    id: 'insights',
    emoji: '📊',
    title: 'Your patterns, made visible',
    body: 'Insights reveal your averages, consistency and trends — computed privately on your device, never sent anywhere.',
    tint: 'primary',
  },
  {
    id: 'wellness',
    emoji: '💖',
    title: 'Wellness at your pace',
    body: 'Set gentle reminders for your period, medication or a daily check-in. Luvina nudges — it never nags.',
    tint: 'accent',
  },
  {
    id: 'ready',
    emoji: '🎉',
    title: 'You\u2019re all set!',
    body: 'Let\u2019s begin your wellness journey. Take the guided tour anytime from Help & Discover in Settings.',
    tint: 'primary',
  },
]

/* ------------------------------------------------------------------ */
/* Guided product tour                                                 */
/* ------------------------------------------------------------------ */

export interface TourStep {
  /** Pathname the step belongs to (e.g. `/calendar`). */
  route: string
  /** Stable `data-tour` selector to highlight, or null for a centered intro step. */
  selector: string | null
  title: string
  body: string
}

export const TOUR_STEPS: TourStep[] = [
  {
    route: '/',
    selector: 'checkin-card',
    title: 'Dashboard Overview',
    body: 'Your daily wellness hub. View your cycle phase, next period prediction, and log your daily check-in at a glance.',
  },
  {
    route: '/',
    selector: 'fab',
    title: '10-Second Check-ins',
    body: 'Tap the quick add button anytime to record your mood, energy, pain, symptoms, and flow in less than 10 seconds.',
  },
  {
    route: '/calendar',
    selector: 'month-grid',
    title: 'Cycle Calendar',
    body: 'Each day is color-coded by phase. Tap any day to log past or upcoming symptoms, notes, and period dates.',
  },
  {
    route: '/insights',
    selector: null,
    title: 'Insights & Trends',
    body: 'Luvina calculates your average cycle length, consistency score, and prediction accuracy — 100% locally on your device.',
  },
  {
    route: '/help',
    selector: null,
    title: 'Period & Hygiene Guide',
    body: 'Explore comprehensive guides on menstrual health, period care, intimate hygiene, pain management, and myth-busting.',
  },
  {
    route: '/settings',
    selector: 'settings-backup',
    title: 'Settings & Privacy',
    body: 'Personalize your appearance, configure reminder notifications, and create encrypted backups. Your data never leaves your device.',
  },
  {
    route: '/',
    selector: null,
    title: 'You\u2019re All Set!',
    body: 'Your private cycle journey is ready. You can replay this tour anytime from Help & Discover in Settings.',
  },
]

/* ------------------------------------------------------------------ */
/* Contextual help per screen                                          */
/* ------------------------------------------------------------------ */

export interface ContextualHelpContent {
  title: string
  summary: string
  why: string
  how: string[]
  tips: string[]
}

export const CONTEXTUAL_HELP: Record<string, ContextualHelpContent> = {
  home: {
    title: 'Your dashboard',
    summary: 'Everything you need for today, at a glance.',
    why: 'The home screen brings your check-in, cycle status, calendar preview, notes and reminders together so tracking feels effortless.',
    how: [
      'Tap "How are you today?" to log a quick check-in.',
      'Watch the cycle card for your current phase and next period.',
      'Use the mini calendar to preview the month, then open the full calendar.',
      'Tap the plus button to jump straight into today\u2019s check-in.',
    ],
    tips: [
      'Logging a check-in daily improves prediction accuracy.',
      'Set your name in Settings for a warmer greeting.',
    ],
  },
  calendar: {
    title: 'Calendar',
    summary: 'Log, predict and explore your cycle day by day.',
    why: 'The calendar is where tracking happens. Colour-coded days make your cycle easy to read and each day opens a rich check-in sheet.',
    how: [
      'Tap any day to open its check-in sheet.',
      'Use the arrows or swipe to browse months.',
      'Use "Start period" on the right day to begin a new cycle.',
      'Reference the legend below the grid to understand every colour.',
    ],
    tips: [
      'Symptom dots and note bars show at a glance which days have extra data.',
      'Logging on the first day of your period helps Luvina predict accurately.',
    ],
  },
  history: {
    title: 'History',
    summary: 'Your cycle timeline, month by month.',
    why: 'History turns your logged periods into a timeline you can review, edit or delete — useful for spotting long-term patterns or sharing with your doctor.',
    how: [
      'Tap any cycle card to view its details.',
      'Adjust start and end dates to correct mistakes.',
      'Delete a cycle here without touching your daily notes.',
    ],
    tips: [
      'Check "has notes" badges to revisit what you wrote.',
      'Your average cycle length is reflected in future predictions.',
    ],
  },
  insights: {
    title: 'Insights',
    summary: 'Your patterns, made visible.',
    why: 'Insights show averages, consistency and prediction accuracy so you understand your body\u2019s rhythm — all computed locally on your device.',
    how: [
      'Read the highlight cards for average cycle, accuracy and consistency.',
      'Explore the charts for cycle length trends and period days per month.',
      'Give it a few cycles — the more you log, the richer insights become.',
    ],
    tips: [
      'Consistency above 60% means Luvina\u2019s predictions are most reliable.',
      'Insights are estimates, not medical advice.',
    ],
  },
  settings: {
    title: 'Settings',
    summary: 'Make Luvina yours.',
    why: 'Everything about your experience lives here: profile, personalization, cycle preferences, notifications, backup, data, feedback, and help.',
    how: [
      'Set your name, theme and animation intensity in Profile.',
      'Add personal details like age and goals for tailored language.',
      'Configure reminders in Notifications.',
      'Create encrypted backups in Backup & export.',
      'Open Help & Discover for guides, FAQs and support.',
    ],
    tips: [
      'Back up regularly — a backup restores everything, including your theme.',
      'You can erase all data anytime under Data & privacy.',
    ],
  },
  about: {
    title: 'About Luvina',
    summary: 'Learn about the app, our mission, and how to get in touch.',
    why: 'The About page tells the story behind Luvina — our mission, core values, and what makes this tracker different. It also provides version info, credits, and support options.',
    how: [
      'Read about our mission and core values.',
      'Explore the full list of features.',
      'Check the Privacy Commitment section for details on how your data is handled.',
      'Use the Contact & Support section for support options.',
      'Visit Settings for Feedback, Bug Reports, and Feature Requests.',
    ],
    tips: [
      'Privacy Policy, Terms of Use and Licenses are available in Settings.',
      'Our official website and social media pages will be available in a future release.',
    ],
  },
}

/* ------------------------------------------------------------------ */
/* Help Center articles                                                */
/* ------------------------------------------------------------------ */

export type ArticleCategory =
  | 'getting-started'
  | 'features'
  | 'wellness'
  | 'privacy'
  | 'troubleshooting'

export interface HelpSection {
  heading: string
  body?: string
  steps?: string[]
  tip?: string
}

export interface HelpArticle {
  id: string
  title: string
  emoji: string
  category: ArticleCategory
  keywords: string[]
  minutes: number
  sections: HelpSection[]
  related: string[]
}

export const ARTICLE_CATEGORY_LABELS: Record<ArticleCategory, string> = {
  'getting-started': 'Getting started',
  features: 'Features',
  wellness: 'Wellness',
  privacy: 'Privacy',
  troubleshooting: 'Troubleshooting',
}

export const HELP_ARTICLES: HelpArticle[] = [
  {
    id: 'getting-started',
    title: 'Getting started with Luvina',
    emoji: '🚀',
    category: 'getting-started',
    keywords: ['start', 'begin', 'first', 'setup', 'new'],
    minutes: 3,
    sections: [
      {
        heading: 'Your first day',
        body: 'Welcome! Luvina is a private, offline-first companion for understanding your cycle. You can start tracking with a single tap.',
        steps: [
          'Open the calendar and tap today\u2019s date.',
          'Tap "Start period" if your period has begun.',
          'Or log a Quick Check-In from the home screen.',
          'Optionally complete your personal profile in Settings.',
        ],
        tip: 'You don\u2019t need to do everything at once. Luvina learns as you log.',
      },
      {
        heading: 'What happens next',
        body: 'After your first period, Luvina estimates your cycle length and predicts your next period, fertile window and ovulation. The more you log, the more accurate it becomes.',
      },
    ],
    related: ['daily-checkin', 'calendar'],
  },
  {
    id: 'daily-checkin',
    title: 'Mastering the daily check-in',
    emoji: '✨',
    category: 'features',
    keywords: ['check-in', 'daily', 'mood', 'energy', 'sleep', 'hydration', 'log'],
    minutes: 2,
    sections: [
      {
        heading: 'What it tracks',
        body: 'The check-in captures your mood, energy, sleep, pain, hydration, flow and symptoms — everything that helps Luvina understand your cycle.',
        steps: [
          'Tap "How are you today?" on the home screen.',
          'Pick an emoji for your mood.',
          'Slide energy, sleep and pain to match how you feel.',
          'Tap any symptoms that apply, then hit Done.',
        ],
        tip: 'A full check-in takes less than 10 seconds.',
      },
      {
        heading: 'Why it matters',
        body: 'Daily logs power your insights and sharpen predictions. Patterns like low energy before your period or sleep changes around ovulation only appear when you track consistently.',
      },
    ],
    related: ['calendar', 'insights'],
  },
  {
    id: 'calendar',
    title: 'Understanding the calendar',
    emoji: '📅',
    category: 'features',
    keywords: ['calendar', 'period', 'predicted', 'ovulation', 'fertile', 'legend', 'symptoms', 'notes'],
    minutes: 3,
    sections: [
      {
        heading: 'Reading the colours',
        body: 'The calendar colour-codes every day so your cycle is easy to scan. The legend below the grid explains each colour.',
        steps: [
          'Period days are filled with the period colour.',
          'Predicted period days have a soft ring.',
          'Ovulation and fertile days get their own tints.',
          'Dots mark days with symptoms; bars mark days with notes.',
        ],
        tip: 'Tap the legend item if you ever forget what a colour means.',
      },
      {
        heading: 'Logging on any day',
        body: 'Tap a day to open its check-in sheet. Use "Start period" on the first day of your period — Luvina will create the cycle for you.',
      },
    ],
    related: ['predictions', 'daily-checkin'],
  },
  {
    id: 'predictions',
    title: 'How predictions work',
    emoji: '🔮',
    category: 'features',
    keywords: ['prediction', 'predict', 'forecast', 'period', 'ovulation', 'fertile', 'accuracy'],
    minutes: 3,
    sections: [
      {
        heading: 'Estimates, not certainties',
        body: 'Luvina predicts your next period using your average cycle length and your logged history. Ovulation and fertile windows are estimates based on standard cycle patterns.',
        steps: [
          'Set your typical cycle and period length in Settings → Cycle preferences.',
          'Log the start of each period to keep predictions accurate.',
          'Check the cycle hero on the home screen for your next predicted period.',
        ],
        tip: 'Every body is different. Luvina gets more precise the more you log.',
      },
      {
        heading: 'Improving accuracy',
        body: 'Consistent logging is the single best way to improve predictions. Days marked "predicted" are estimates and will firm up as your history grows.',
      },
    ],
    related: ['insights', 'calendar'],
  },
  {
    id: 'insights',
    title: 'Reading your insights',
    emoji: '📊',
    category: 'features',
    keywords: ['insights', 'stats', 'statistics', 'average', 'consistency', 'trend', 'chart'],
    minutes: 2,
    sections: [
      {
        heading: 'Your highlights',
        body: 'The top cards show your average cycle length, prediction accuracy and overall consistency. Below them, mini-stats cover your average period, delay, and longest/shortest cycles.',
      },
      {
        heading: 'The charts',
        body: 'Cycle length trend plots each completed cycle, while period days shows how many period days you logged per month over the last year. Together they reveal your rhythm at a glance.',
        tip: 'Insights are computed locally and are never shared.',
      },
    ],
    related: ['predictions', 'daily-checkin'],
  },
  {
    id: 'notifications',
    title: 'Setting up reminders & notifications',
    emoji: '🔔',
    category: 'features',
    keywords: ['notification', 'reminder', 'remind', 'alert', 'medication', 'daily', 'check-in'],
    minutes: 2,
    sections: [
      {
        heading: 'Adding a reminder',
        body: 'Open Settings → Notifications to add reminders for your expected period, ovulation, medication, hydration, doctor appointments or anything custom.',
        steps: [
          'Choose a reminder type and a title.',
          'Pick a time and whether it repeats.',
          'For period reminders, choose how many days before to notify you.',
          'Allow notifications when your browser asks.',
        ],
      },
      {
        heading: 'A gentle nudge',
        body: 'Luvina only reminds you about what you ask for. Toggle reminders on or off anytime — your schedule, your rules.',
      },
    ],
    related: ['backup', 'daily-checkin'],
  },
  {
    id: 'backup',
    title: 'Backing up & exporting your data',
    emoji: '🛟',
    category: 'privacy',
    keywords: ['backup', 'export', 'import', 'restore', 'encrypted', 'password', 'cloud', 'google', 'drive'],
    minutes: 3,
    sections: [
      {
        heading: 'Encrypted backups',
        body: 'Backups are encrypted files that restore everything — cycles, logs, reminders and settings. Only your password can open them; Luvina cannot.',
        steps: [
          'Open Settings → Backup & export.',
          'Create an encrypted backup and choose a memorable password.',
          'Save the file somewhere safe, like your private cloud or Drive.',
          'To restore, import the file and enter the password.',
        ],
        tip: 'Store backups somewhere you trust. Without your password, a backup cannot be recovered.',
      },
      {
        heading: 'Export vs erase',
        body: 'Export first, then erase. Clearing your browser data or uninstalling removes local data permanently, so a recent backup is your safety net.',
      },
    ],
    related: ['privacy', 'getting-started'],
  },
  {
    id: 'privacy',
    title: 'Your privacy, explained',
    emoji: '🔒',
    category: 'privacy',
    keywords: ['privacy', 'private', 'local', 'data', 'offline', 'account', 'tracking'],
    minutes: 2,
    sections: [
      {
        heading: 'Local-first by design',
        body: 'Luvina has no accounts and no servers storing your data. Everything lives in a private database on this device, and every feature works offline.',
        steps: [
          'Your cycles, notes and settings never leave this device.',
          'There are no analytics and no ad trackers.',
          'Deleting the app is the ultimate delete — nothing remains elsewhere.',
        ],
      },
      {
        heading: 'If you want a copy',
        body: 'Encrypted backups are the only way data moves beyond this device, and only when you deliberately create and download one.',
      },
    ],
    related: ['backup', 'getting-started'],
  },
  {
    id: 'themes',
    title: 'Personalizing themes & appearance',
    emoji: '🎨',
    category: 'getting-started',
    keywords: ['theme', 'color', 'colour', 'dark', 'light', 'appearance', 'accent', 'personalize'],
    minutes: 2,
    sections: [
      {
        heading: 'Make it yours',
        body: 'Choose from three signature themes — Royal Purple, Sunset Rose and Ocean Teal — or fine-tune your own colours with the custom sliders.',
        steps: [
          'Open Settings → Appearance.',
          'Pick a theme preset or build a custom palette.',
          'Choose Light, Dark or Default (follows your device).',
          'Set your preferred animation intensity under Profile.',
        ],
      },
      {
        heading: 'Your choice, everywhere',
        body: 'Themes apply instantly across the whole app, including the home screen, calendar and sheets. Reduced motion and high-contrast preferences are respected automatically.',
      },
    ],
    related: ['getting-started', 'troubleshooting'],
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting & common fixes',
    emoji: '🛠️',
    category: 'troubleshooting',
    keywords: ['problem', 'issue', 'fix', 'error', 'bug', 'not working', 'offline', 'notification'],
    minutes: 2,
    sections: [
      {
        heading: 'Notifications not appearing',
        body: 'Check that notifications are enabled in Settings and that your browser allows them. On some devices you may need to re-enable permission in system settings.',
      },
      {
        heading: 'Predictions look off',
        body: 'Predictions improve with history. Confirm your cycle preferences in Settings, and log the start of every period.',
      },
      {
        heading: 'Nothing else works?',
        body: 'Report a bug from Settings → Feedback with a short description of what happened. Every message is read.',
      },
    ],
    related: ['notifications', 'predictions'],
  },
  {
    id: 'feedback',
    title: 'Feedback, support & contact',
    emoji: '💬',
    category: 'troubleshooting',
    keywords: ['feedback', 'support', 'contact', 'bug', 'feature', 'report', 'rate', 'suggest'],
    minutes: 1,
    sections: [
      {
        heading: 'We read everything',
        body: 'Use Settings → Feedback to report a bug, suggest a feature, rate the app or share general thoughts. You can even attach a screenshot.',
        steps: [
          'Pick a category that fits your message.',
          'Write what happened or what you\u2019d love to see.',
          'Optionally attach a screenshot, then send.',
        ],
      },
      {
        heading: 'Support',
        body: 'For anything else, reach out via Settings → About → Contact. Privacy policy and terms are always available from the About section.',
      },
    ],
    related: ['getting-started', 'privacy'],
  },
]

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

export interface FaqEntry {
  id: string
  question: string
  answer: string
  keywords: string[]
}

export const FAQS: FaqEntry[] = [
  {
    id: 'faq-calendar',
    question: 'How do I log my period on the calendar?',
    answer:
      'Tap the day your period starts, then tap "Start period". Luvina creates the cycle for you and updates every prediction.',
    keywords: ['calendar', 'period', 'log', 'start'],
  },
  {
    id: 'faq-symptoms',
    question: 'How do I track symptoms?',
    answer:
      'Open any day\u2019s check-in and tap the symptoms that apply — cramps, headache, bloating and more. Symptom dots appear on the calendar.',
    keywords: ['symptoms', 'track', 'cramps', 'check-in'],
  },
  {
    id: 'faq-predictions',
    question: 'Why do predictions change?',
    answer:
      'Predictions adapt to your logged cycles. As your history grows and your average becomes more precise, estimates firm up accordingly.',
    keywords: ['predictions', 'change', 'estimate', 'accurate'],
  },
  {
    id: 'faq-companion-insights',
    question: 'Are my Companion insights computed in the cloud?',
    answer:
      'No. Every insight, average, and chart is computed locally on your device by your Luvina Companion logic — nothing is ever uploaded or sent anywhere.',
    keywords: ['companion', 'insights', 'cloud', 'local', 'privacy'],
  },
  {
    id: 'faq-notifications',
    question: 'How do I set up period reminders?',
    answer:
      'Settings → Notifications → Add reminder, choose "Expected period", pick a time and how many days in advance to be reminded.',
    keywords: ['notifications', 'reminder', 'period', 'alert'],
  },
  {
    id: 'faq-backup',
    question: 'How do I back up my data?',
    answer:
      'Settings → Backup & export → Create encrypted backup. Choose a password you\u2019ll remember and store the file somewhere safe.',
    keywords: ['backup', 'encrypted', 'password', 'save'],
  },
  {
    id: 'faq-export',
    question: 'Can I export my data?',
    answer:
      'Yes — backups are portable, encrypted files you control. You can also restore them on any device with the same password.',
    keywords: ['export', 'import', 'restore', 'file'],
  },
  {
    id: 'faq-privacy',
    question: 'Is my data ever uploaded?',
    answer:
      'Never, unless you deliberately create and download an encrypted backup. There are no accounts, analytics or trackers.',
    keywords: ['privacy', 'upload', 'account', 'tracking', 'data'],
  },
  {
    id: 'faq-themes',
    question: 'How do I change the theme?',
    answer:
      'Settings → Appearance lets you switch between Royal Purple, Sunset Rose, Ocean Teal or a fully custom palette, in light or dark mode.',
    keywords: ['themes', 'colors', 'colors', 'dark', 'light', 'appearance'],
  },
  {
    id: 'faq-checkin',
    question: 'What is the daily check-in?',
    answer:
      'A 10-second log of your mood, energy, sleep, pain, hydration and symptoms. Daily check-ins sharpen predictions and power your insights.',
    keywords: ['check-in', 'daily', 'log', 'mood', 'energy'],
  },
  {
    id: 'faq-stats',
    question: 'Where do my statistics come from?',
    answer:
      'Every average on the Insights page is computed from your own logged cycles, locally on your device.',
    keywords: ['statistics', 'stats', 'average', 'insights'],
  },
]

/* ------------------------------------------------------------------ */
/* Smart tips                                                          */
/* ------------------------------------------------------------------ */

export interface SmartTip {
  id: string
  emoji: string
  title: string
  body: string
  action?: { label: string; href: string }
}

export const SMART_TIPS: SmartTip[] = [
  {
    id: 'enable-notifications',
    emoji: '🔔',
    title: 'Never miss a prediction',
    body: 'Notifications are currently off. Enable them to get gentle reminders for your period and check-ins.',
    action: { label: 'Open Settings', href: '/settings' },
  },
  {
    id: 'complete-checkin',
    emoji: '✨',
    title: 'A 10-second check-in',
    body: 'Log today\u2019s mood, energy and symptoms — daily check-ins make your predictions and insights noticeably better.',
    action: { label: 'Check in', href: '/calendar' },
  },
  {
    id: 'try-tour',
    emoji: '🎓',
    title: 'Discover Luvina',
    body: 'Take the guided tour to see every screen and feature in under two minutes.',
    action: { label: 'Start tour', href: '/settings' },
  },
  {
    id: 'backup-reminder',
    emoji: '🛟',
    title: 'Keep your data safe',
    body: 'It\u2019s been a while since your last backup. A quick encrypted backup protects everything on this device.',
    action: { label: 'Back up now', href: '/settings' },
  },
  {
    id: 'explore-insights',
    emoji: '📊',
    title: 'Your insights are ready',
    body: 'You\u2019ve logged a few cycles — check your averages, consistency and trends on the Insights page.',
    action: { label: 'Explore insights', href: '/insights' },
  },
]

/* ------------------------------------------------------------------ */
/* What's New                                                          */
/* ------------------------------------------------------------------ */

export interface WhatsNewRelease {
  version: string
  date: string
  headline: string
  newFeatures: string[]
  improvements: string[]
  performance: string[]
  bugFixes: string[]
  ui: string[]
}

export const WHATS_NEW: WhatsNewRelease[] = [
  {
    version: '1.0.0',
    date: 'August 2026',
    headline: 'Welcome to Luvina by Mikarsh',
    newFeatures: [
      'A brand-new Quick Check-In with emoji moods, sliders and one-tap logging.',
      'An interactive Help & Discover center with search, guides and FAQs.',
      'A replayable guided product tour and first-launch welcome walkthrough.',
      'Contextual help on every screen with a single tap.',
      'Personal profile, goals and health-condition tracking in Settings.',
    ],
    improvements: [
      'A warmer, more supportive voice throughout the app.',
      'Complete calendar legend with symptom, note, today and selection markers.',
      'Richer empty states that explain and encourage.',
    ],
    performance: [
      'Faster first paint with lighter shared bundles.',
      'Smoother calendar animations and transitions.',
    ],
    bugFixes: [
      'Fixed invisible calendar colour markers on predicted and symptom days.',
      'Fixed legend swatches not rendering in some themes.',
      'Relaxed screen orientation for tablets in landscape.',
    ],
    ui: [
      'Champagne Gold accent replaces the bright yellow, with AA-compliant contrast.',
      'Refined spacing, typography and motion across every screen.',
    ],
  },
]
