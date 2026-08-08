import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/lib/db/db'
import { APP_VERSION } from '@/constants'
import {
  dismissTip,
  getSettings,
  setProductTourSeen,
  setVersionSeen,
  setWelcomeTourSeen,
} from '@/lib/db/settings'

async function resetDb() {
  await db.transaction('rw', db.settings, async () => {
    await db.settings.clear()
  })
}

describe('discovery settings helpers', () => {
  beforeEach(resetDb)

  it('tracks welcome and product tour as seen', async () => {
    await getSettings()
    await setWelcomeTourSeen()
    await setProductTourSeen()

    const settings = await getSettings()
    expect(settings.welcomeTourSeen).toBe(true)
    expect(settings.productTourSeen).toBe(true)
  })

  it('records the seen version and dismisses what\'s new for it', async () => {
    await getSettings()
    await setVersionSeen(APP_VERSION)

    const settings = await getSettings()
    expect(settings.lastSeenVersion).toBe(APP_VERSION)
    expect(settings.whatsNewDismissed).toBe(true)
  })

  it('dismisses a tip without duplicating it', async () => {
    await getSettings()
    await dismissTip('try-tour')
    await dismissTip('try-tour')
    await dismissTip('complete-checkin')

    const settings = await getSettings()
    expect(settings.dismissedTips).toEqual(['try-tour', 'complete-checkin'])
  })
})
