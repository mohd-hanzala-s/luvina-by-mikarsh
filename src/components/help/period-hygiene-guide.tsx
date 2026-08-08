'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HeartPulse,
  Sparkles,
  ShieldAlert,
  Flame,
  Apple,
  Brain,
  HelpCircle,
  AlertTriangle,
  ChevronDown,
  Search,
  CheckCircle2,
  XCircle,
  Check,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CompanionAvatar } from '@/components/ui/companion-avatar'
import { hapticFeedback } from '@/lib/utils'

export interface GuideTopic {
  id: string
  category:
    | 'health'
    | 'care'
    | 'hygiene'
    | 'pain'
    | 'nutrition'
    | 'wellbeing'
    | 'myths'
    | 'emergency'
  title: string
  summary: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  content: {
    overview: string
    keyPoints: string[]
    detailedSections?: { title: string; body: string; list?: string[] }[]
    tip?: string
    warning?: string
  }
}

const GUIDE_CATEGORIES = [
  { id: 'all', label: 'All Topics', icon: Sparkles },
  { id: 'health', label: 'Menstrual Health', icon: HeartPulse },
  { id: 'care', label: 'Period Care Products', icon: CheckCircle2 },
  { id: 'hygiene', label: 'Intimate Hygiene', icon: Sparkles },
  { id: 'pain', label: 'Pain Relief', icon: Flame },
  { id: 'nutrition', label: 'Nutrition', icon: Apple },
  { id: 'wellbeing', label: 'Mental Wellbeing', icon: Brain },
  { id: 'myths', label: 'Myths vs Facts', icon: HelpCircle },
  { id: 'emergency', label: 'Emergency Signs', icon: ShieldAlert },
] as const

const GUIDE_TOPICS: GuideTopic[] = [
  // 1. Menstrual Health
  {
    id: 'menstrual-health',
    category: 'health',
    title: 'Understanding Menstrual Health & Phases',
    summary: 'The four phases of your cycle, normal variations, and hormonal shifts.',
    icon: HeartPulse,
    badge: 'Core Health',
    content: {
      overview:
        'Your menstrual cycle is much more than your period — it is a dynamic 4-phase biological rhythm driven by hormonal fluctuations.',
      keyPoints: [
        'Menstrual Phase (Days 1–5): Low estrogen & progesterone. Focus on rest and gentle care.',
        'Follicular Phase (Days 6–13): Rising estrogen boosts energy, mood, and mental focus.',
        'Ovulatory Phase (Days 14–16): Estrogen peaks, LH surge triggers egg release.',
        'Luteal Phase (Days 17–28): Progesterone dominates. PMS symptoms may appear as hormones decline.',
      ],
      detailedSections: [
        {
          title: 'What is Considered a Normal Cycle?',
          body: 'A healthy adult menstrual cycle typically ranges between 21 and 35 days (average 28 days), with bleeding lasting 3 to 7 days. Variation of 2-4 days between cycles is completely normal.',
        },
        {
          title: 'When to Consult a Healthcare Professional',
          body: 'Consult your doctor if your cycle is consistently shorter than 21 days or longer than 35 days, if bleeding lasts longer than 8 days, or if you experience severe incapacitating pain.',
        },
      ],
      tip: 'Tracking your cycle consistently for 3 months helps identify your personal normal baseline.',
    },
  },

  // 2. Period Care
  {
    id: 'period-care-products',
    category: 'care',
    title: 'Menstrual Products & Safety Guide',
    summary: 'Safe usage guide for pads, tampons, menstrual cups, discs, and reusables.',
    icon: CheckCircle2,
    badge: 'Product Safety',
    content: {
      overview:
        'Choosing the right menstrual product depends on your lifestyle, flow intensity, and personal comfort. Safety and proper change frequency are key.',
      keyPoints: [
        'Sanitary Pads: Change every 4–6 hours to prevent bacterial buildup and skin irritation.',
        'Tampons: Select lowest absorbency needed. Change every 4–8 hours (never exceed 8 hrs) to minimize Toxic Shock Syndrome (TSS) risk.',
        'Menstrual Cups: Made of medical-grade silicone. Empty and rinse every 8–12 hours. Sterilize in boiling water between cycles.',
        'Menstrual Discs: Sit in the vaginal fornix below the cervix. Offer high capacity and up to 12 hours of wear.',
        'Period Underwear & Cloth Pads: Wash with cold water first, then machine wash without fabric softeners.',
      ],
      detailedSections: [
        {
          title: 'Tampon Safety & TSS Awareness',
          body: 'Toxic Shock Syndrome (TSS) is a rare but serious illness. Always wash hands before insertion, use the minimum absorbency needed for your flow, and never wear a tampon longer than 8 hours or overnight if sleeping >8 hrs.',
        },
      ],
      tip: 'Changing products regularly ensures freshness and protects against skin breakdown and infections.',
    },
  },

  // 3. Hygiene Practices
  {
    id: 'intimate-hygiene',
    category: 'hygiene',
    title: 'Daily Intimate Hygiene & Odour Myths',
    summary: 'Best practices for vulvar cleaning, bathing, and clothing recommendations.',
    icon: Sparkles,
    badge: 'Daily Care',
    content: {
      overview:
        'The vagina is a self-cleaning organ. Proper intimate hygiene focuses strictly on gentle external vulvar care.',
      keyPoints: [
        'Clean external vulva only with warm water or a mild, unperfumed soap. Never wash internally.',
        'Avoid douching, scented sprays, or harsh wipes — they disrupt vaginal pH and healthy microflora.',
        'Always wipe from front to back after using the restroom to prevent intestinal bacteria transfer.',
        'Bathing & Showers: Warm showers or baths during your period are safe, relaxing, and encourage hygiene.',
        'Breathable Clothing: Wear loose 100% cotton underwear to allow airflow and minimize moisture retention.',
      ],
      detailedSections: [
        {
          title: 'Debunking Odour Myths',
          body: 'A subtle natural scent during your period is completely normal due to blood and natural secretions. Scented products can trigger bacterial vaginosis (BV) or yeast infections. Consult a doctor if you notice a strong fishy odor or unusual discharge.',
        },
      ],
      tip: 'Change out of damp workout clothes or swimwear promptly to maintain a healthy microbiome.',
    },
  },

  // 4. Pain Management
  {
    id: 'pain-management',
    category: 'pain',
    title: 'Period Pain Relief & Cramp Management',
    summary: 'Natural remedies, heat therapy, stretching, and recognizing dysmenorrhea.',
    icon: Flame,
    badge: 'Relief Guide',
    content: {
      overview:
        'Menstrual cramps (dysmenorrhea) are caused by uterine muscle contractions triggered by prostaglandins. Effective non-pharmacological relief strategies can make a significant difference.',
      keyPoints: [
        'Heat Therapy: Apply a heating pad or hot water bottle to the lower abdomen (relaxes uterine wall muscles as effectively as OTC painkillers).',
        'Gentle Stretching: Practice yoga poses like Cat-Cow, Child\u2019s Pose, and knees-to-chest to release pelvic tension.',
        'Hydration & Teas: Drink warm water, chamomile tea, or ginger tea to reduce bloating and spasm intensity.',
        'Sleep Position: Sleep on your side in a fetal position with a pillow between your knees to relieve pelvic pressure.',
        'Light Movement: Gentle walking releases endorphins — nature\u2019s natural pain relievers.',
      ],
      detailedSections: [
        {
          title: 'When Pain is Abnormal (Red Flags)',
          body: 'Severe cramps that keep you from school or work, pain that worsens over time, or pain unresponsive to standard OTC analgesics should be evaluated by a gynecologist to screen for conditions like endometriosis or fibroids.',
        },
      ],
      tip: 'Starting heat therapy at the first sign of tightness can prevent severe cramps from building up.',
    },
  },

  // 5. Nutrition
  {
    id: 'menstrual-nutrition',
    category: 'nutrition',
    title: 'Nutrition for Cycle Support & Bloating',
    summary: 'Essential nutrients (Iron, Magnesium, Calcium, Omega-3) and hydration tips.',
    icon: Apple,
    badge: 'Nourishment',
    content: {
      overview:
        'What you eat directly influences inflammation, hormone synthesis, energy levels, and cramp severity throughout your cycle.',
      keyPoints: [
        'Iron: Replenish lost blood stores with spinach, lentils, beans, dark chocolate, or lean meats.',
        'Magnesium: Relaxes smooth muscle contractions and eases cramps. Found in pumpkin seeds, almonds, dark greens, and bananas.',
        'Calcium: Eases premenstrual mood shifts and cramping. Include yogurt, fortified plant milks, or sesame seeds.',
        'Omega-3 Fatty Acids: Anti-inflammatory fats in salmon, flaxseeds, and walnuts help diminish prostaglandin pain.',
        'B-Vitamins (B6/B12): Support neurotransmitter balance to stabilize energy and mood.',
      ],
      detailedSections: [
        {
          title: 'Hydration & Beating Bloating',
          body: 'Drink 8 to 10 glasses of water daily. It may sound counterintuitive, but staying well-hydrated prompts your kidneys to release excess water, reducing abdominal bloating and fatigue.',
        },
      ],
      tip: 'Pair plant-based iron foods with Vitamin C (citrus, bell peppers) for maximum absorption.',
    },
  },

  // 6. Mental Wellbeing
  {
    id: 'mental-wellbeing',
    category: 'wellbeing',
    title: 'Mental Wellbeing, PMS & PMDD Awareness',
    summary: 'Navigating hormonal mood shifts, stress reduction, and emotional self-care.',
    icon: Brain,
    badge: 'Mental Health',
    content: {
      overview:
        'Fluctuating estrogen and progesterone levels during the luteal phase impact serotonin and dopamine, influencing mood, stress sensitivity, and sleep.',
      keyPoints: [
        'PMS Awareness: Mild irritability, anxiety, or low energy 7–10 days before your period is common.',
        'PMDD (Premenstrual Dysphoric Disorder): A severe form of PMS causing intense depression, extreme mood swings, or disabling anxiety. PMDD requires professional medical support.',
        'Stress Reduction: Practice 4-7-8 deep breathing, mindfulness, or gentle outdoor walks.',
        'Sleep Hygiene: Aim for 7–9 hours of quality sleep; maintain a cool, dark room to offset night sweats.',
      ],
      detailedSections: [
        {
          title: 'Gentle Self-Compassion',
          body: 'Recognize that lower energy during your premenstrual phase is a biological cue to slow down. Adjust expectations and practice restful activities without guilt.',
        },
      ],
      tip: 'Logging your mood in your daily check-in helps predict emotional cycles and prepare in advance.',
    },
  },

  // 7. Myths vs Facts
  {
    id: 'myths-facts',
    category: 'myths',
    title: 'Menstrual Myths vs Scientific Facts',
    summary: 'Busting common cultural misconceptions about exercise, hair washing, and diet.',
    icon: HelpCircle,
    badge: 'Myth Buster',
    content: {
      overview:
        'Misinformation surrounding menstruation causes unnecessary anxiety. Here are evidence-backed scientific facts.',
      keyPoints: [
        'MYTH: Washing your hair or taking a bath during your period is unsafe. -> FACT: Warm baths and showers are completely safe, hygienic, and help soothe uterine muscle cramps.',
        'MYTH: You should not exercise while on your period. -> FACT: Light to moderate exercise releases endorphins, natural analgesics that improve mood and reduce pain.',
        'MYTH: You cannot get pregnant during your period. -> FACT: Sperm can survive inside the reproductive tract for up to 5 days. For shorter cycles, ovulation can overlap with early bleeding.',
        'MYTH: Cold or sour foods worsen cramps. -> FACT: Food temperature has zero impact on uterine contractions. Balanced nutrition is what supports recovery.',
      ],
      tip: 'Always rely on verified medical literature or healthcare professionals over hearsay.',
    },
  },

  // 8. Emergency Signs
  {
    id: 'emergency-red-flags',
    category: 'emergency',
    title: 'Emergency Red Flags & When to See a Doctor',
    summary: 'Critical warning signs requiring prompt medical or gynecological evaluation.',
    icon: ShieldAlert,
    badge: 'Medical Alert',
    content: {
      overview:
        'While menstrual variation is normal, certain symptoms indicate underlying medical conditions that warrant clinical assessment.',
      keyPoints: [
        'Extremely Heavy Bleeding (Menorrhagia): Soaking through 1+ pad or tampon every hour for two or more consecutive hours.',
        'Toxic Shock Syndrome Signs: Sudden high fever (>102°F/38.9°C), vomiting, flu-like symptoms, dizziness, or a sunburn-like rash while using tampons.',
        'Severe Unmanageable Pain: Intense pelvic pain that is not relieved by OTC painkillers or interferes with daily life.',
        'Amenorrhea: Missing periods for more than 90 days (when not pregnant or menopausal).',
        'Unusual Discharge: Thick foul-smelling, green/yellow discharge, or severe vaginal itching/burning.',
      ],
      warning:
        'This guide is for educational purposes only and does not replace professional medical diagnosis or treatment. If in doubt, contact a doctor.',
    },
  },

  // 9. Stree Safety Protocol & Quick Emergency Dialing
  {
    id: 'stree-safety-protocol',
    category: 'emergency',
    title: 'Stree Safety Protocol & Emergency Quick Dialing 🛡️',
    summary: 'What to do when feeling unsafe, experiencing an emergency, or needing instant SOS contact.',
    icon: ShieldAlert,
    badge: 'Safety SOS',
    content: {
      overview:
        'Your safety is top priority. Stree Protocol provides instant 1-tap dialing to loved ones, emergency helplines, and grounding steps when feeling unsafe.',
      keyPoints: [
        'Use the top Stree SOS button in the app header for instant 1-tap calling to your saved emergency contact.',
        'Women Helpline (1091 / National Emergency 112): Instant toll-free helpline support.',
        'Emergency Text Copy: Copy pre-written SOS message with 1-tap to send to loved ones.',
        '5-4-3-2-1 Sensory Grounding: Practice calming visual and tactile steps to reduce panic and stabilize breathing.',
      ],
      detailedSections: [
        {
          title: 'Setting Up Your Emergency Contact',
          body: 'Go to Settings or tap Stree SOS in the top bar to save your partner, parent, or trusted friend’s phone number for instant access.',
        },
      ],
      warning: 'If you are in immediate physical danger, dial 112 / 1091 or get to a safe public location immediately.',
    },
  },

  // 10. Acute Cramps & Fainting Protocol
  {
    id: 'severe-cramp-fainting',
    category: 'emergency',
    title: 'Handling Acute Pain, Dizziness & Fainting',
    summary: 'Emergency first-aid when experiencing severe cramps, cold sweat, nausea, or lightheadedness.',
    icon: Flame,
    badge: 'Emergency First Aid',
    content: {
      overview:
        'Severe pelvic pain can trigger a vasovagal response — causing sudden blood pressure drops, dizziness, sweating, or fainting.',
      keyPoints: [
        'Lie Flat Immediately: Sit or lie down on your back and elevate your legs on a pillow to restore blood flow to your brain.',
        'Loosen Tight Clothing: Unbutton tight jeans or belts to relieve abdominal pressure.',
        'Sip Warm Water or Electrolytes: Avoid gulping cold water; take small warm sips.',
        'Apply Heat Pack: Place a heating pad on your lower abdomen or lower back to relax smooth muscle spasms.',
      ],
      detailedSections: [
        {
          title: 'When Pain Triggers Loss of Consciousness',
          body: 'If fainting occurs repeatedly or is accompanied by chest tightness or heavy bleeding, seek emergency medical care immediately.',
        },
      ],
      tip: 'Keep your primary emergency contact saved in Stree Protocol for 1-tap SOS calling if you feel faint while away from home.',
    },
  },
]

export function PeriodHygieneGuide() {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedTopic, setExpandedTopic] = useState<string | null>('menstrual-health')

  const filteredTopics = useMemo(() => {
    return GUIDE_TOPICS.filter((topic) => {
      const matchesCat = activeCategory === 'all' || topic.category === activeCategory
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        topic.title.toLowerCase().includes(q) ||
        topic.summary.toLowerCase().includes(q) ||
        topic.content.keyPoints.some((p) => p.toLowerCase().includes(q))
      return matchesCat && matchesSearch
    })
  }, [activeCategory, searchQuery])

  const toggleExpand = (id: string) => {
    hapticFeedback(true)
    setExpandedTopic((prev) => (prev === id ? null : id))
  }

  return (
    <div className="space-y-6">
      {/* Header Banner with Companion */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-accent/15 p-6 shadow-soft sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/15 blur-3xl"
        />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <CompanionAvatar className="size-16 ring-4 ring-background/90" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
                  Period &amp; Hygiene Guide
                </h2>
                <Badge variant="secondary" className="bg-primary/15 text-primary">
                  Medically Grounded
                </Badge>
              </div>
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                &ldquo;Welcome! I&apos;m your Luvina Companion. Understanding your body and intimate
                care should be simple, trustworthy, and calm.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics e.g. cramps, pads, hygiene, myths, iron..."
            className="h-11 pl-11 pr-4"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {GUIDE_CATEGORIES.map((cat) => {
            const Icon = cat.icon
            const active = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  hapticFeedback(true)
                  setActiveCategory(cat.id)
                }}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
                  active
                    ? 'border border-primary bg-primary text-primary-foreground shadow-soft'
                    : 'border border-border/60 bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <Icon className="size-3.5" />
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Topics Accordion List */}
      <div className="space-y-4">
        {filteredTopics.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <HelpCircle className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-2 text-sm font-semibold">No guide topics found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try adjusting your search terms or selecting a different category.
            </p>
          </div>
        ) : (
          filteredTopics.map((topic) => {
            const Icon = topic.icon
            const isExpanded = expandedTopic === topic.id

            return (
              <motion.div
                key={topic.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`overflow-hidden rounded-2xl border transition-all ${
                  isExpanded
                    ? 'border-primary/40 bg-card shadow-soft ring-1 ring-primary/20'
                    : 'border-border/60 bg-card hover:border-border shadow-soft'
                }`}
              >
                {/* Header Toggle */}
                <button
                  type="button"
                  onClick={() => toggleExpand(topic.id)}
                  className="flex w-full items-start justify-between gap-4 p-5 text-left transition-colors hover:bg-accent/40"
                >
                  <div className="flex items-start gap-3.5">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-base font-semibold">{topic.title}</h3>
                        {topic.badge && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                            {topic.badge}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{topic.summary}</p>
                    </div>
                  </div>

                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
                    <ChevronDown
                      className={`size-4 transition-transform duration-300 ${
                        isExpanded ? 'rotate-180 text-primary' : ''
                      }`}
                    />
                  </span>
                </button>

                {/* Expanded Content Body */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-t border-border/40 px-5 pb-6 pt-4"
                    >
                      <div className="space-y-4">
                        <p className="text-sm leading-relaxed text-foreground/90 font-medium">
                          {topic.content.overview}
                        </p>

                        {/* Key Points Bullet Cards */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Key Guidance &amp; Practice
                          </h4>
                          <div className="grid gap-2.5">
                            {topic.content.keyPoints.map((pt, idx) => {
                              const isMyth = pt.startsWith('MYTH:')
                              return (
                                <div
                                  key={idx}
                                  className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs leading-relaxed ${
                                    isMyth
                                      ? 'border-amber-500/20 bg-amber-500/10 text-amber-950 dark:text-amber-200'
                                      : 'border-border/50 bg-muted/40 text-muted-foreground'
                                  }`}
                                >
                                  {isMyth ? (
                                    <XCircle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                                  ) : (
                                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                                  )}
                                  <span>{pt}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Detailed Subsections */}
                        {topic.content.detailedSections?.map((sec, idx) => (
                          <div
                            key={idx}
                            className="rounded-xl border border-primary/15 bg-primary/5 p-4 space-y-1.5"
                          >
                            <h5 className="font-display text-xs font-semibold text-primary">
                              {sec.title}
                            </h5>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                              {sec.body}
                            </p>
                          </div>
                        ))}

                        {/* Pro Tip */}
                        {topic.content.tip && (
                          <div className="flex items-start gap-2.5 rounded-xl border border-accent/40 bg-accent/15 p-3 text-xs text-foreground/90">
                            <Sparkles className="mt-0.5 size-4 shrink-0 text-accent-strong" />
                            <div>
                              <span className="font-semibold text-accent-strong">Pro Tip: </span>
                              {topic.content.tip}
                            </div>
                          </div>
                        )}

                        {/* Emergency Warning */}
                        {topic.content.warning && (
                          <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
                            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                            <div>
                              <span className="font-semibold">Medical Note: </span>
                              {topic.content.warning}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
