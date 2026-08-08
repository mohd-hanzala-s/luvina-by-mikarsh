import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/lib/db/db'
import { NamePromptDialog } from '@/components/onboarding/name-prompt-dialog'

async function resetDb() {
  await db.settings.clear()
}

describe('NamePromptDialog', () => {
  beforeEach(resetDb)

  it('asks for a name on a fresh install', async () => {
    render(<NamePromptDialog />)
    expect(await screen.findByText('What should we call you?')).toBeInTheDocument()
  })

  it('saves the trimmed name and closes when submitted', async () => {
    const user = userEvent.setup()
    render(<NamePromptDialog />)

    const input = await screen.findByLabelText('Your name')
    await user.type(input, '  Aanya  ')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    await waitFor(() => {
      expect(screen.queryByText('What should we call you?')).not.toBeInTheDocument()
    })
    const settings = await db.settings.get(1)
    expect(settings?.name).toBe('Aanya')
    expect(settings?.nameCaptureDismissed).toBe(true)
  })

  it('records the skip without setting a name', async () => {
    const user = userEvent.setup()
    render(<NamePromptDialog />)

    await screen.findByText('What should we call you?')
    await user.click(screen.getByRole('button', { name: /skip for now/i }))

    await waitFor(() => {
      expect(screen.queryByText('What should we call you?')).not.toBeInTheDocument()
    })
    const settings = await db.settings.get(1)
    expect(settings?.name).toBeNull()
    expect(settings?.nameCaptureDismissed).toBe(true)
  })

  it('never asks again once already dismissed', async () => {
    await db.settings.put({
      id: 1,
      theme: 'system',
      cycleLengthDefault: 28,
      periodLengthDefault: 5,
      lutealPhaseDays: 14,
      fertileWindowDays: 5,
      notificationsEnabled: true,
      hapticsEnabled: true,
      lastBackupAt: null,
      onBoardingDone: false,
      name: null,
      nameCaptureDismissed: true,
      themeId: 'royal-purple',
      customPrimaryHue: 345,
      customPrimarySaturation: 84,
      customAccentHue: 292,
      customAccentSaturation: 70,
      hueShift: 275,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    render(<NamePromptDialog />)
    await waitFor(() => expect(db.settings.get(1)).resolves.toBeDefined())
    expect(screen.queryByText('What should we call you?')).not.toBeInTheDocument()
  })
})
