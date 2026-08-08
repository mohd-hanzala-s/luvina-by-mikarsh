import { test, expect, type Page } from '@playwright/test'

/**
 * PWA / offline tests run against the production static export (served by
 * scripts/serve-out.mjs on the PLAYWRIGHT_PROD_URL port). They verify the
 * manifest, service-worker registration, precaching and that the app remains
 * fully usable with the network disconnected.
 */

const PROD_URL = process.env.PLAYWRIGHT_PROD_URL || 'http://localhost:4173'

async function prodExportAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${PROD_URL}/`)
    return res.ok
  } catch {
    return false
  }
}

let available = false

/**
 * Each section's URL and the heading it shows with empty data (what a fresh
 * install renders) as well as with data present.
 */
const SECTION_HEADINGS: Array<[string, RegExp]> = [
  ['Calendar', /^Calendar$/],
  ['History', /^(No cycles yet|History)$/],
  ['Insights', /^(Insights coming soon|Insights)$/],
  ['Settings', /^Settings$/],
]

async function gotoProd(page: Page, url = '/') {
  await page.goto(`${PROD_URL}${url}`)
  await page.waitForSelector('html[data-hydrated="true"]')
}

/** The offline indicator. Scoped to the visible instance (sidebar vs. header). */
function offlinePill(page: Page) {
  return page.locator('[role="status"]:visible')
}

test.describe('PWA / offline', () => {
  test.beforeAll(async () => {
    available = await prodExportAvailable()
  })

  test('serves the web app manifest', async ({ page }) => {
    test.skip(!available, 'Production export not built; run `pnpm build` first.')
    await gotoProd(page)
    const manifest = page.locator('link[rel="manifest"]')
    await expect(manifest).toBeAttached()
    const href = await manifest.getAttribute('href')
    expect(href).toContain('manifest.json')
    await expect(page.locator('meta[name="mobile-web-app-capable"]')).toBeAttached()
  })

  test('registers a service worker and precaches the app shell', async ({ page }) => {
    test.skip(!available, 'Production export not built; run `pnpm build` first.')

    await gotoProd(page)
    await waitForActiveSw(page)

    await expect
      .poll(async () =>
        page.evaluate(async () => {
          const names = await caches.keys()
          return names.length > 0
        }),
      )
      .toBe(true)

    const swUrl = await page.evaluate(async () => {
      const reg = await navigator.serviceWorker.getRegistration()
      return reg?.active?.scriptURL ?? null
    })
    expect(swUrl).toContain('sw.js')
  })

  test('app remains usable with the network disconnected', async ({ page, context }) => {
    test.skip(!available, 'Production export not built; run `pnpm build` first.')

    await gotoProd(page)
    await expect(page.getByRole('heading', { name: 'Welcome to Luvina' })).toBeVisible()

    // Wait until the SW is active and controlling this page.
    await waitForActiveSw(page)

    // Warm the offline cache: visit every section online so its RSC payload
    // and navigation entry are written to the SW caches before going offline.
    const nav = page.getByRole('navigation', { name: 'Main navigation' })
    for (const [section, heading] of SECTION_HEADINGS) {
      await nav.getByText(section).click()
      await expect(page).toHaveURL(new RegExp(`/${section.toLowerCase()}$`))
      await expect(page.getByRole('heading', { name: heading })).toBeVisible()
    }
    await nav.getByText('Home').click()
    await expect(page.getByRole('heading', { name: 'Welcome to Luvina' })).toBeVisible()

    // Reload once online so the start URL is served and cached via the SW.
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Welcome to Luvina' })).toBeVisible()

    await context.setOffline(true)
    await expect(offlinePill(page)).toHaveText('Offline')

    // Full reload offline must be served from the SW cache.
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Welcome to Luvina' })).toBeVisible()
    await page.waitForSelector('html[data-hydrated="true"]')

    // Client-side navigation to every section works offline.
    for (const [section, heading] of SECTION_HEADINGS) {
      await nav.getByText(section).click()
      await expect(page).toHaveURL(new RegExp(`/${section.toLowerCase()}$`))
      await expect(page.getByRole('heading', { name: heading })).toBeVisible()
    }

    await context.setOffline(false)
    await expect(offlinePill(page)).toHaveCount(0)
  })
})

async function waitForActiveSw(page: Page) {
  // Phase 1: wait for the worker to take control WITHOUT querying the
  // registration, so we never poll the SW lifecycle mid-install. Polling
  // `getRegistration()` during the install window can race Chromium's
  // update checks and force a redundant re-install.
  await page.waitForFunction(() => {
    if (!('serviceWorker' in navigator)) return false
    return navigator.serviceWorker.controller !== null
  }, { timeout: 20_000 })

  // Phase 2: give any spurious update-check re-install time to settle, then
  // verify the same worker stays active and in control before proceeding.
  await page.waitForTimeout(1_000)
  await page.waitForFunction(
    async () => {
      const reg = await navigator.serviceWorker.getRegistration()
      const sw = reg?.active
      if (!sw || sw.state !== 'activated' || navigator.serviceWorker.controller === null) {
        return false
      }
      const url = sw.scriptURL
      await new Promise((r) => setTimeout(r, 750))
      const reg2 = await navigator.serviceWorker.getRegistration()
      return reg2?.active?.scriptURL === url && reg2.active.state === 'activated'
    },
    { timeout: 20_000 },
  )
}
