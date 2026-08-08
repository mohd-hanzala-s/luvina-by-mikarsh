/**
 * Generates public/manifest.json at build time so icon and scope paths respect
 * the GitHub Pages base path (NEXT_PUBLIC_BASE_PATH). Run automatically as a
 * prebuild step, or manually with `pnpm manifest`.
 */
import { writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
const outFile = join(__dirname, '..', 'public', 'manifest.json')

const manifest = {
  name: 'Luvina by Mikarsh — Understand Your Cycle',
  short_name: 'Luvina',
  description:
    'A private, offline-first menstrual cycle tracker. Track your cycle, symptoms and moods — everything stays on your device.',
  id: `${basePath}/`,
  start_url: `${basePath}/`,
  scope: `${basePath}/`,
  display: 'standalone',
  orientation: 'any',
  background_color: '#000000',
  theme_color: '#6B3FF5',
  lang: 'en',
  categories: ['health', 'lifestyle'],
  icons: [
    {
      src: `${basePath}/icons/icon-192.png`,
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: `${basePath}/icons/icon-512.png`,
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: `${basePath}/icons/icon-512-maskable.png`,
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ],
  shortcuts: [
    {
      name: 'Quick add',
      short_name: 'Quick add',
      description: 'Log a note or start a period',
      url: `${basePath}/`,
      icons: [{ src: `${basePath}/icons/icon-192.png`, sizes: '192x192' }],
    },
    {
      name: 'Calendar',
      short_name: 'Calendar',
      description: 'Open the cycle calendar',
      url: `${basePath}/calendar`,
      icons: [{ src: `${basePath}/icons/icon-192.png`, sizes: '192x192' }],
    },
  ],
}

await writeFile(outFile, JSON.stringify(manifest, null, 2))
console.log(`manifest written to ${outFile} (basePath "${basePath}")`)
