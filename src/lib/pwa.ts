'use client'

/**
 * Service worker URL resolution.
 *
 * next-pwa generates `public/sw.js`; registration is handled in
 * `usePwaUpdater` so the worker URL respects the GitHub Pages base path. The
 * worker uses skipWaiting + clientsClaim, so a freshly installed worker
 * activates immediately and a full reload (offered through the UI) applies
 * the new bundle.
 */

export function getSwUrl(): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  return `${basePath}/sw.js`
}

/**
 * True when the app is running inside the native Android shell (the bundled
 * WebView build, loaded from `https://appassets.androidplatform.net` via
 * `WebViewAssetLoader`), as opposed to the hosted PWA in a real browser.
 *
 * This matters for the service worker: `WebViewAssetLoader` only intercepts
 * requests made directly by the `WebView`'s own `WebViewClient`. Fetches
 * issued *by a running service worker* (precaching, `NetworkFirst`
 * navigation, etc.) go through Android's normal network stack instead, and
 * `appassets.androidplatform.net` isn't a real reachable host there — so the
 * worker's precache never populates and every SW-controlled navigation
 * (including client-side route changes, e.g. the guided tour) fails with a
 * network error. The Android shell already serves the whole bundle from disk
 * via the asset loader, so the service worker is redundant there and must be
 * skipped rather than registered.
 */
export function isAndroidShell(): boolean {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).has('android_shell')
}
