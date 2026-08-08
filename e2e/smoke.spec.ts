import { test, expect, type Page } from '@playwright/test'

/**
 * Navigates and waits for React hydration so clicks land on the interactive
 * (re-hydrated) DOM rather than racing the server-rendered markup.
 */
async function gotoApp(page: Page, url = '/') {
  await page.goto(url)
  await page.waitForSelector('html[data-hydrated="true"]')
}

/** Seed sample data from the home screen and wait for the hero to appear. */
async function loadSampleData(page: Page) {
  await gotoApp(page)
  await page.getByRole('button', { name: 'Load sample data' }).click()
  await expect(page.getByText('Cycle day')).toBeVisible()
}

test.describe('Home', () => {
  test('shows the getting-started welcome on an empty device', async ({ page }) => {
    await gotoApp(page, '/')
    await expect(page.getByRole('heading', { name: 'Welcome to Luvina' })).toBeVisible()
    await expect(page.getByText('No account, no tracking, no uploads.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Load sample data' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Quick add' })).toBeVisible()
  })

  test('quick add opens the day detail sheet for today', async ({ page }) => {
    await gotoApp(page, '/')
    await page.getByRole('button', { name: 'Quick add' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Start period' })).toBeVisible()
    await expect(dialog.getByRole('region', { name: 'Mood' })).toBeVisible()
    await expect(dialog.getByRole('region', { name: 'Journal' })).toBeVisible()
  })

  test('sample data populates the hero, notes and reminders', async ({ page }) => {
    await loadSampleData(page)
    await expect(page.getByText(/period in \d+ days?|period expected today/)).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Latest note' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Upcoming reminder' })).toBeVisible()
  })
})

test.describe('Navigation', () => {
  test('bottom/sidebar navigation reaches every section', async ({ page }) => {
    await gotoApp(page, '/')
    const nav = page.getByRole('navigation', { name: 'Main navigation' })

    await nav.getByText('Calendar').click()
    await expect(page.getByRole('heading', { name: 'Calendar' })).toBeVisible()

    await nav.getByText('History').click()
    await expect(page.getByRole('heading', { name: 'History' })).toBeVisible()

    await nav.getByText('Insights').click()
    await expect(page.getByRole('heading', { name: 'Insights' })).toBeVisible()

    await nav.getByText('Settings').click()
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()

    await nav.getByText('Home').click()
    await expect(
      page.getByRole('heading', { name: /^Good (morning|afternoon|evening)$/ }),
    ).toBeVisible()
  })
})

test.describe('Calendar', () => {
  test('renders the month grid and legend', async ({ page }) => {
    await gotoApp(page, '/calendar')
    await expect(page.getByRole('heading', { name: 'Calendar' })).toBeVisible()
    const legend = page.getByRole('region', { name: 'Calendar legend' })
    for (const label of ['Period', 'Predicted', 'Ovulation', 'Fertile', 'Past']) {
      await expect(legend.getByText(label)).toBeVisible()
    }
    await expect(page.getByRole('button', { name: /, \d{4}$/ }).first()).toBeVisible()
  })

  test('month arrows change the displayed month', async ({ page }) => {
    await gotoApp(page, '/calendar')
    const month = page.getByRole('heading', { name: /[A-Z][a-z]+ \d{4}$/ })
    await expect(month).toBeVisible()
    const before = (await month.textContent()) ?? ''
    await page.getByRole('button', { name: 'Next month' }).click()
    await expect(month).not.toHaveText(before)
    await page.getByRole('button', { name: 'Previous month' }).click()
    await expect(month).toHaveText(before)
  })

  test('logging a period from a day cell opens the sheet and saves', async ({ page }) => {
    await gotoApp(page, '/calendar')
    const todayLabel = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    await page.getByRole('button', { name: todayLabel }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('button', { name: 'Start period' })).toBeVisible()
    await dialog.getByRole('button', { name: 'Start period' }).click()
    await expect(page.getByText('Period started')).toBeVisible()
  })

  test('journal text fields preserve characters like ampersands', async ({ page }) => {
    await gotoApp(page, '/calendar')
    const todayLabel = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    await page.getByRole('button', { name: todayLabel }).click()
    const dialog = page.getByRole('dialog')
    const note = "Cramps & cramps, don't like it"
    await dialog.getByLabel('Notes').fill(note)
    await dialog.getByLabel('Notes').blur()
    await expect(page.getByText(note)).toHaveCount(1)
  })
})

test.describe('History & Insights', () => {
  test('empty history explains there are no cycles yet', async ({ page }) => {
    await gotoApp(page, '/history')
    await expect(page.getByRole('heading', { name: 'No cycles yet' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Open the calendar' })).toBeVisible()
  })

  test('history lists cycles after loading sample data', async ({ page }) => {
    await loadSampleData(page)
    await page.getByRole('navigation', { name: 'Main navigation' }).getByText('History').click()
    await expect(page.getByText(/day cycle/).first()).toBeVisible()
  })

  test('empty insights asks for more data', async ({ page }) => {
    await gotoApp(page, '/insights')
    await expect(page.getByRole('heading', { name: 'Insights coming soon' })).toBeVisible()
  })

  test('insights show stats after loading sample data', async ({ page }) => {
    await loadSampleData(page)
    await page.getByRole('navigation', { name: 'Main navigation' }).getByText('Insights').click()
    await expect(page.getByText('Average cycle')).toBeVisible()
    await expect(page.getByText('Prediction accuracy')).toBeVisible()
    await expect(page.getByText('Cycle length trend')).toBeVisible()
    await expect(page.getByText('Period days')).toBeVisible()
  })
})

test.describe('Settings', () => {
  test('theme switching persists and applies the dark class', async ({ page }) => {
    await gotoApp(page, '/settings')
    const dark = page.getByRole('button', { name: 'Dark' })
    await dark.click()
    await expect(dark).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('html')).toHaveClass(/dark/)
    await page.reload()
    await expect(page.locator('html')).toHaveClass(/dark/)
  })

  test('notifications master switch toggles', async ({ page }) => {
    await gotoApp(page, '/settings')
    const toggle = page.getByRole('switch', { name: 'Notifications' })
    await expect(toggle).toBeChecked()
    await toggle.click()
    await expect(toggle).not.toBeChecked()
  })

  test('adding a reminder shows it in the list', async ({ page }) => {
    await gotoApp(page, '/settings')
    await page.getByRole('button', { name: 'New reminder' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'New reminder' })).toBeVisible()
    await dialog.getByLabel('Title').fill('Take medication')
    await dialog.getByRole('button', { name: 'Add', exact: true }).click()
    await expect(page.getByText('Take medication')).toBeVisible()
  })

  test('backup dialog rejects short passwords', async ({ page }) => {
    await gotoApp(page, '/settings')
    await page.getByRole('button', { name: 'Create' }).click()
    const dialog = page.getByRole('dialog')
    await expect(
      dialog.getByRole('heading', { name: 'Create encrypted backup' }),
    ).toBeVisible()
    await dialog.getByLabel('Password', { exact: true }).fill('short')
    await dialog.getByLabel('Confirm password', { exact: true }).fill('short')
    await dialog.getByRole('button', { name: 'Create backup' }).click()
    await expect(page.getByText(/at least 8 characters/)).toBeVisible()
  })

  test('a valid password produces a downloadable backup file', async ({ page }) => {
    await gotoApp(page, '/settings')
    await page.getByRole('button', { name: 'Create' }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Password', { exact: true }).fill('correct horse battery')
    await dialog.getByLabel('Confirm password', { exact: true }).fill('correct horse battery')
    const download = page.waitForEvent('download')
    await dialog.getByRole('button', { name: 'Create backup' }).click()
    const file = await download
    expect(file.suggestedFilename()).toMatch(/^luvina-backup-.*\.json$/)
  })
})
