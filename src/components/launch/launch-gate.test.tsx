import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ComponentType } from 'react'

vi.mock('@/components/onboarding/splash-screen', () => ({
  SplashScreen: ({ onComplete }: { onComplete: () => void }) => (
    <div data-testid="splash">
      <button onClick={onComplete}>complete</button>
    </div>
  ),
}))

vi.mock('@/components/onboarding/features-card', () => ({
  FeaturesCard: ({ onContinue }: { onContinue: () => void }) => (
    <div data-testid="features">
      <button onClick={onContinue}>continue</button>
    </div>
  ),
}))

vi.mock('@/components/onboarding/onboarding-dialog', () => ({
  OnboardingDialog: () => <div data-testid="onboarding" />,
}))

type LaunchGateProps = { isFreshInstall: boolean; settingsReady: boolean }

let LaunchGate: ComponentType<LaunchGateProps>

// Each test gets a fresh module so the module-scoped `splashCompleted` flag
// starts false — this mirrors a genuinely new page load. Session storage is
// cleared so no test inherits the "splash already shown" marker from another.
beforeEach(async () => {
  vi.resetModules()
  sessionStorage.clear()
  const mod = await import('@/components/launch/launch-gate')
  LaunchGate = mod.LaunchGate
})

describe('LaunchGate launch flow', () => {
  it('renders the splash on the first mount (a cold launch)', () => {
    render(<LaunchGate isFreshInstall settingsReady />)
    expect(screen.getByTestId('splash')).toBeInTheDocument()
    expect(screen.queryByTestId('features')).not.toBeInTheDocument()
    expect(screen.queryByTestId('onboarding')).not.toBeInTheDocument()
  })

  it('walks a first-time user through splash → features → onboarding', async () => {
    const user = userEvent.setup()
    render(<LaunchGate isFreshInstall settingsReady />)

    await user.click(screen.getByRole('button', { name: 'complete' }))
    expect(screen.getByTestId('features')).toBeInTheDocument()
    expect(screen.queryByTestId('onboarding')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'continue' }))
    expect(screen.getByTestId('onboarding')).toBeInTheDocument()
  })

  it('sends a returning user straight home after the splash', async () => {
    const user = userEvent.setup()
    render(<LaunchGate isFreshInstall={false} settingsReady />)

    await user.click(screen.getByRole('button', { name: 'complete' }))
    expect(screen.queryByTestId('splash')).not.toBeInTheDocument()
    expect(screen.queryByTestId('features')).not.toBeInTheDocument()
    expect(screen.queryByTestId('onboarding')).not.toBeInTheDocument()
  })

  it('never replays the splash on remounts during the same session', async () => {
    const user = userEvent.setup()
    const first = render(<LaunchGate isFreshInstall settingsReady />)
    await user.click(screen.getByRole('button', { name: 'complete' }))
    first.unmount()

    // A remount (e.g. route change re-rendering the shell) must not bring the
    // splash back; the session continues straight to the introduction.
    const second = render(<LaunchGate isFreshInstall settingsReady />)
    expect(screen.queryByTestId('splash')).not.toBeInTheDocument()
    expect(screen.getByTestId('features')).toBeInTheDocument()
    second.unmount()
  })

  it('does not replay the splash after a page refresh in the same tab', async () => {
    const user = userEvent.setup()
    const first = render(<LaunchGate isFreshInstall settingsReady />)
    await user.click(screen.getByRole('button', { name: 'complete' }))
    first.unmount()

    // Simulate a full page refresh: the module reloads (module flag resets),
    // but sessionStorage survives, so the splash must not come back.
    vi.resetModules()
    const { LaunchGate: Refreshed } = await import('@/components/launch/launch-gate')
    const after = render(<Refreshed isFreshInstall settingsReady />)
    expect(screen.queryByTestId('splash')).not.toBeInTheDocument()
    expect(screen.getByTestId('features')).toBeInTheDocument()
    after.unmount()
  })

  it('holds the introduction until real settings have loaded', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<LaunchGate isFreshInstall settingsReady={false} />)
    await user.click(screen.getByRole('button', { name: 'complete' }))
    expect(screen.queryByTestId('features')).not.toBeInTheDocument()

    rerender(<LaunchGate isFreshInstall settingsReady />)
    expect(screen.getByTestId('features')).toBeInTheDocument()
  })
})
