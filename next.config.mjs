import withPWAInit from 'next-pwa'
import { readFileSync } from 'node:fs'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))

// Static-exported routes (their .html shell and .txt RSC payload). The RSC
// payloads are prefetched by the Next router *before* the service worker
// takes control, so they must be precached at build time to be reachable
// offline.
const RSC_PAYLOADS = [
  { url: `${basePath}/index.txt`, revision: pkg.version },
  { url: `${basePath}/about.txt`, revision: pkg.version },
  { url: `${basePath}/calendar.txt`, revision: pkg.version },
  { url: `${basePath}/history.txt`, revision: pkg.version },
  { url: `${basePath}/insights.txt`, revision: pkg.version },
  { url: `${basePath}/settings.txt`, revision: pkg.version },
  { url: `${basePath}/help.txt`, revision: pkg.version },
]

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: false,
  skipWaiting: true,
  clientsClaim: true,
  scope: `${basePath}/`,
  buildExcludes: [/middleware-manifest\.json$/, /app-build-manifest\.json$/],
  additionalManifestEntries: RSC_PAYLOADS,
  // The Next.js router appends `?_rsc=...` to RSC payload requests; match the
  // precached entry regardless of that value so client-side navigation works
  // offline.
  ignoreURLParametersMatching: [/^_rsc$/],
  runtimeCaching: [
    {
      urlPattern: ({ request }) =>
        request.mode === 'navigate',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'luvina-pages-v1',
        networkTimeoutSeconds: 3,
        expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 * 7 },
      },
    },
    {
      // RSC payloads used by client-side navigation between routes so that
      // every section remains reachable after the network drops.
      urlPattern: ({ url }) => url.pathname.endsWith('.txt'),
      handler: 'CacheFirst',
      options: {
        cacheName: 'luvina-rsc-v1',
        expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 * 7 },
      },
    },
    {
      urlPattern: ({ request }) =>
        request.destination === 'style' ||
        request.destination === 'script' ||
        request.destination === 'font' ||
        request.destination === 'image',
      handler: 'CacheFirst',
      options: {
        cacheName: 'luvina-assets-v1',
        expiration: { maxEntries: 128, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
  ],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath,
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
  trailingSlash: false,
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
}

export default withPWA(nextConfig)
