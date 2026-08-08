import type { Metadata, Viewport } from 'next'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/500.css'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/700.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import './globals.css'
import { Providers } from '@/components/providers/providers'
import { AppShell } from '@/components/layout/app-shell'
import { APP_FULL_NAME, APP_NAME, APP_TAGLINE } from '@/constants'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

export const metadata: Metadata = {
  title: {
    default: `${APP_FULL_NAME} — ${APP_TAGLINE}`,
    template: `%s · ${APP_NAME}`,
  },
  description:
    'Luvina by Mikarsh is a private, offline-first menstrual cycle tracker. Track your cycle, symptoms and moods — everything stays on your device.',
  applicationName: APP_NAME,
  keywords: ['menstrual cycle tracker', 'period tracker', 'luvina', 'mikarsh', 'offline', 'privacy'],
  authors: [{ name: 'Mikarsh' }],
  creator: 'Mikarsh',
  publisher: 'Mikarsh',
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: `${basePath}/icons/icon-32.png`, sizes: '32x32', type: 'image/png' },
      { url: `${basePath}/icons/icon-192.png`, sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: `${basePath}/icons/apple-touch-icon.png`, sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: APP_NAME,
  },
  openGraph: {
    type: 'website',
    title: `${APP_FULL_NAME} — ${APP_TAGLINE}`,
    description:
      'A private, offline-first menstrual cycle tracker. Your data never leaves your device.',
    siteName: APP_NAME,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href={`${basePath}/manifest.json`} />
      </head>
      <body className="font-sans">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  )
}
