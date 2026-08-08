'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Heart,
  Lock,
  ShieldCheck,
  Eye,
  Globe,
  Accessibility,
  Sparkles,
  FlaskConical,
  CalendarDays,
  Smile,
  Stethoscope,
  BarChart3,
  MessageSquare,
  Bell,
  Palette,
  Cloud,
  Mail,
  Linkedin,
  Camera,
  Bug,
  Lightbulb,
} from 'lucide-react'
import { APP_FULL_NAME, APP_NAME, APP_TAGLINE, APP_VERSION } from '@/constants'
import { Logo } from '@/components/layout/logo'
import { HelpButton } from '@/components/help/contextual-help'

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
}

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">About Luvina</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Private, intelligent, beautifully designed cycle tracking.
          </p>
        </div>
        <HelpButton screen="about" label="Help about Luvina" />
      </header>

      <motion.div
        {...fadeUp}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-card border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-8 shadow-soft"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-primary/10 blur-3xl"
        />
        <div className="relative flex flex-col items-center text-center">
          <Logo className="size-16" />
          <h2 className="mt-4 font-display text-xl font-semibold tracking-tight">{APP_NAME}</h2>
          <p className="mt-1 text-sm font-medium text-accent-strong">{APP_TAGLINE}</p>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Your private companion for understanding your cycle. Track your period, symptoms and
            moods. Luvina learns your rhythm and offers gentle predictions and insights — all stored
            privately on this device.
          </p>
        </div>
      </motion.div>

      <motion.section
        {...fadeUp}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="cv-auto rounded-card border border-border/60 bg-card p-6 shadow-soft sm:p-8"
        style={{ containIntrinsicSize: '0 320px' } as React.CSSProperties}
      >
        <h2 className="font-display text-lg font-semibold tracking-tight">Our Mission</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Luvina exists to give women a private, beautiful and intelligent companion for
          understanding their natural cycle. We believe wellness tracking should be empowering,
          not exploitative — that your most personal data deserves the highest standard of care,
          and that technology should serve you without asking for anything in return.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Lock, label: 'Privacy First', text: 'No accounts, no tracking, no servers.' },
            { icon: Sparkles, label: 'Simplicity', text: 'Beautiful, intuitive, effortless.' },
            { icon: ShieldCheck, label: 'Trust', text: 'Your data, your device, your rules.' },
            { icon: Heart, label: 'Empowerment', text: 'Understand your body on your terms.' },
            { icon: FlaskConical, label: 'Science-backed', text: 'Grounded in cycle science.' },
            { icon: Eye, label: 'Beautiful Design', text: 'Premium, calm, accessible.' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-3 rounded-card border border-border/40 bg-background/40 p-4"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-input bg-primary/10 text-primary">
                <item.icon className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section
        {...fadeUp}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="cv-auto rounded-card border border-border/60 bg-card p-6 shadow-soft sm:p-8"
        style={{ containIntrinsicSize: '0 340px' } as React.CSSProperties}
      >
        <h2 className="font-display text-lg font-semibold tracking-tight">Core Values</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Lock, title: 'Privacy', body: 'Your data stays on your device. No accounts, no analytics, no third parties.' },
            { icon: ShieldCheck, title: 'Security', body: 'Encrypted backups with AES-256-GCM. Only you hold the key to your data.' },
            { icon: Accessibility, title: 'Accessibility', body: 'WCAG-compliant design with screen reader support and reduced motion.' },
            { icon: Globe, title: 'Inclusivity', body: 'Designed for every woman, regardless of cycle regularity or health conditions.' },
            { icon: FlaskConical, title: 'Scientific Accuracy', body: 'Predictions grounded in cycle science, refined by your logged data.' },
            { icon: Heart, title: 'Compassion', body: 'A warm, supportive voice that meets you where you are — no judgment.' },
            { icon: Sparkles, title: 'User Empowerment', body: 'You control your data, your reminders, your experience.' },
          ].map((value) => (
            <div
              key={value.title}
              className="flex flex-col gap-2 rounded-card border border-border/40 bg-background/40 p-4"
            >
              <span className="flex size-9 items-center justify-center rounded-input bg-accent/10 text-accent-strong">
                <value.icon className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold">{value.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{value.body}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section
        {...fadeUp}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="cv-auto rounded-card border border-border/60 bg-card p-6 shadow-soft sm:p-8"
        style={{ containIntrinsicSize: '0 340px' } as React.CSSProperties}
      >
        <h2 className="font-display text-lg font-semibold tracking-tight">Why Luvina</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Most cycle trackers monetize your health data or lock features behind accounts. Luvina is
          different — it is private by design, works entirely offline, and never asks you to create
          an account or share anything. Every prediction and insight is computed right here on your
          device.
        </p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {[
            { label: 'Privacy-first design', desc: 'No accounts, no servers, no tracking.' },
            { label: 'Beautiful interface', desc: 'Premium, calm, designed with care.' },
            { label: 'Personalized insights', desc: 'Computed locally from your logged cycles.' },
            { label: 'Intelligent predictions', desc: 'Learns and refines as you log more.' },
            { label: 'Calm experience', desc: 'Gentle reminders, supportive language.' },
            { label: 'Reliable tracking', desc: 'Works offline — no internet needed.' },
            { label: 'Offline-first', desc: 'Every feature works without a connection.' },
            { label: 'You own your data', desc: 'Export, import, or erase — always your choice.' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-3 rounded-card border border-border/40 bg-background/40 p-3"
            >
              <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section
        {...fadeUp}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="cv-auto rounded-card border border-border/60 bg-card p-6 shadow-soft sm:p-8"
        style={{ containIntrinsicSize: '0 420px' } as React.CSSProperties}
      >
        <h2 className="font-display text-lg font-semibold tracking-tight">Features</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: CalendarDays, title: 'Cycle Tracking', desc: 'Log periods and track your unique rhythm.' },
            { icon: Smile, title: 'Mood Tracking', desc: 'Record how you feel each day.' },
            { icon: Stethoscope, title: 'Symptom Logging', desc: 'Track cramps, headaches, bloating and more.' },
            { icon: CalendarDays, title: 'Calendar', desc: 'Colour-coded month view of your entire cycle.' },
            { icon: BarChart3, title: 'Predictions', desc: 'Estimates for next period, ovulation and fertile window.' },
            { icon: Sparkles, title: 'Insights', desc: 'Averages, trends and consistency scores.' },
            { icon: MessageSquare, title: 'Notes', desc: 'Journal privately alongside your cycle.' },
            { icon: Bell, title: 'Notifications', desc: 'Gentle reminders for periods, medication and more.' },
            { icon: Palette, title: 'Themes', desc: 'Three curated palettes with light and dark modes.' },
            { icon: Cloud, title: 'Backup & Restore', desc: 'Encrypted backups you control, with optional Google Drive.' },
            { icon: ShieldCheck, title: 'Privacy Controls', desc: 'Export, erase or restore — your data, your rules.' },
          ].map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col gap-2 rounded-card border border-border/40 bg-background/40 p-4 transition-colors hover:border-primary/20"
            >
              <span className="flex size-9 items-center justify-center rounded-input bg-primary/10 text-primary">
                <feature.icon className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold">{feature.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section
        {...fadeUp}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="cv-auto rounded-card border border-border/60 bg-card p-6 shadow-soft sm:p-8"
        style={{ containIntrinsicSize: '0 320px' } as React.CSSProperties}
      >
        <h2 className="font-display text-lg font-semibold tracking-tight">Privacy Commitment</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Luvina was built from the ground up with privacy as a first principle — not an afterthought.
          We believe your intimate health data belongs to you and only you.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            { label: 'You own your data', desc: 'Everything lives on your device in a private database. Nothing is uploaded anywhere.' },
            { label: 'Secure storage', desc: 'Optional encrypted backups use AES-256-GCM with a password only you know.' },
            { label: 'Transparency', desc: 'No hidden trackers, no analytics, no third-party SDKs.' },
            { label: 'Minimal data collection', desc: 'We collect nothing. There is no backend to collect data on.' },
            { label: 'User control', desc: 'Export your data anytime. Erase everything with a tap. No questions asked.' },
            { label: 'Trust', desc: 'Deleting the app is the ultimate delete — nothing remains on any server.' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-3 rounded-card border border-border/40 bg-background/40 p-4"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-input bg-primary/10 text-primary">
                <ShieldCheck className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section
        {...fadeUp}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="rounded-card border border-border/60 bg-card p-6 shadow-soft sm:p-8"
      >
        <h2 className="font-display text-lg font-semibold tracking-tight">Version</h2>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between rounded-card border border-border/40 bg-background/40 px-4 py-3">
            <span className="text-sm text-muted-foreground">App version</span>
            <span className="text-sm font-medium">{APP_VERSION}</span>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          &copy; {APP_FULL_NAME}
        </p>
      </motion.section>

      <motion.section
        {...fadeUp}
        transition={{ duration: 0.3, delay: 0.35 }}
        className="cv-auto rounded-card border border-border/60 bg-card p-6 shadow-soft sm:p-8"
        style={{ containIntrinsicSize: '0 260px' } as React.CSSProperties}
      >
        <h2 className="font-display text-lg font-semibold tracking-tight">Credits</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Luvina is thoughtfully designed, developed and branded by Mikarsh — a small team dedicated
          to creating beautiful, private wellness tools.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {[
            { label: 'Design', desc: 'Mikarsh' },
            { label: 'Development', desc: 'Mikarsh' },
            { label: 'Branding', desc: 'Mikarsh' },
          ].map((credit) => (
            <div
              key={credit.label}
              className="flex flex-col gap-0.5 rounded-card border border-border/40 bg-background/40 p-3 text-center"
            >
              <p className="text-xs text-muted-foreground">{credit.label}</p>
              <p className="text-sm font-medium">{credit.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Built with Lucide, Radix, date-fns, Framer Motion, Dexie, Recharts and Tailwind CSS.
        </p>
      </motion.section>

      <motion.section
        {...fadeUp}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="cv-auto rounded-card border border-border/60 bg-card p-6 shadow-soft sm:p-8"
        style={{ containIntrinsicSize: '0 520px' } as React.CSSProperties}
      >
        <h2 className="font-display text-lg font-semibold tracking-tight">Contact &amp; Support</h2>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-card border border-border/40 bg-background/40 px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-input bg-muted text-muted-foreground">
                <Globe className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium">Website</p>
                <p className="text-xs text-muted-foreground">Coming Soon</p>
              </div>
            </div>
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              Soon
            </span>
          </div>

          <div className="flex items-center justify-between rounded-card border border-border/40 bg-background/40 px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-input bg-muted text-muted-foreground">
                <Mail className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium">Support Email</p>
                <p className="text-xs text-muted-foreground">
                  Our official email will be available in a future release.
                </p>
              </div>
            </div>
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              Soon
            </span>
          </div>

          <div className="flex items-center justify-between rounded-card border border-border/40 bg-background/40 px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-input bg-muted text-muted-foreground">
                <Linkedin className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium">LinkedIn</p>
                <p className="text-xs text-muted-foreground">Coming Soon</p>
              </div>
            </div>
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              Soon
            </span>
          </div>

          <div className="flex items-center justify-between rounded-card border border-border/40 bg-background/40 px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-input bg-muted text-muted-foreground">
                <Camera className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium">Instagram</p>
                <p className="text-xs text-muted-foreground">Coming Soon</p>
              </div>
            </div>
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              Soon
            </span>
          </div>
        </div>

        <div className="mt-4 border-t border-border/40 pt-4">
          <p className="mb-3 text-xs font-medium text-muted-foreground">
            Need help? These are available right now in Settings.
          </p>
          <div className="space-y-2">
              <Link
                href="/settings#feedback"
                className="flex items-center justify-between rounded-card border border-border/40 bg-background/40 px-4 py-3 transition-colors hover:border-primary/20"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-input bg-primary/10 text-primary">
                    <MessageSquare className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">Send Feedback</p>
                    <p className="text-xs text-muted-foreground">Share your thoughts and suggestions.</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-primary">Settings</span>
              </Link>
              <Link
                href="/settings#feedback"
                className="flex items-center justify-between rounded-card border border-border/40 bg-background/40 px-4 py-3 transition-colors hover:border-primary/20"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-input bg-primary/10 text-primary">
                    <Bug className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">Report a Bug</p>
                    <p className="text-xs text-muted-foreground">Let us know if something is not working.</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-primary">Settings</span>
              </Link>
              <Link
                href="/settings#feedback"
                className="flex items-center justify-between rounded-card border border-border/40 bg-background/40 px-4 py-3 transition-colors hover:border-primary/20"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-input bg-primary/10 text-primary">
                    <Lightbulb className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">Feature Requests</p>
                    <p className="text-xs text-muted-foreground">Suggest something you would love to see.</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-primary">Settings</span>
              </Link>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Our official website will be available in a future release.
        </p>
      </motion.section>

      <div className="flex justify-center pb-4">
        <p className="text-xs text-muted-foreground">
          Privacy Policy, Terms of Use and Licenses are available in Settings.
        </p>
      </div>
    </div>
  )
}
