import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { WELCOME_SCREENS } from '@/lib/help/content'
import { WelcomeTour } from '@/components/help/welcome-tour'

describe('WelcomeTour', () => {
  it('renders the first screen when open', () => {
    render(<WelcomeTour open onFinish={vi.fn()} onLaunchTour={vi.fn()} />)
    expect(screen.getByRole('dialog', { name: 'Welcome to Luvina' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: WELCOME_SCREENS[0].title }),
    ).toBeInTheDocument()
  })

  it('renders nothing when closed', () => {
    const { container } = render(
      <WelcomeTour open={false} onFinish={vi.fn()} onLaunchTour={vi.fn()} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('advances forward and back through the screens', async () => {
    const user = userEvent.setup()
    render(<WelcomeTour open onFinish={vi.fn()} onLaunchTour={vi.fn()} />)

    expect(
      screen.getByRole('heading', { name: WELCOME_SCREENS[0].title }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /continue/i }))
    expect(
      await screen.findByRole('heading', { name: WELCOME_SCREENS[1].title }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /previous/i }))
    expect(
      await screen.findByRole('heading', { name: WELCOME_SCREENS[0].title }),
    ).toBeInTheDocument()
  })

  it('disables back on the first screen', () => {
    render(<WelcomeTour open onFinish={vi.fn()} onLaunchTour={vi.fn()} />)
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
  })

  it('calls onFinish(false) when skipped', async () => {
    const onFinish = vi.fn()
    const user = userEvent.setup()
    render(<WelcomeTour open onFinish={onFinish} onLaunchTour={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /skip welcome tour/i }))
    expect(onFinish).toHaveBeenCalledWith(false)
  })

  it('calls onFinish(true) from Get started on the final screen', async () => {
    const onFinish = vi.fn()
    const user = userEvent.setup()
    render(<WelcomeTour open onFinish={onFinish} onLaunchTour={vi.fn()} />)

    for (let i = 1; i < WELCOME_SCREENS.length; i++) {
      await user.click(screen.getByRole('button', { name: /continue/i }))
      await screen.findByRole('heading', { name: WELCOME_SCREENS[i].title })
    }

    await user.click(screen.getByRole('button', { name: /get started/i }))
    expect(onFinish).toHaveBeenCalledWith(true)
  })

  it('hands off to the guided tour from the final screen', async () => {
    const onLaunchTour = vi.fn()
    const user = userEvent.setup()
    render(<WelcomeTour open onFinish={vi.fn()} onLaunchTour={onLaunchTour} />)

    for (let i = 1; i < WELCOME_SCREENS.length; i++) {
      await user.click(screen.getByRole('button', { name: /continue/i }))
      await screen.findByRole('heading', { name: WELCOME_SCREENS[i].title })
    }

    await user.click(screen.getByRole('button', { name: /take a quick tour/i }))
    expect(onLaunchTour).toHaveBeenCalled()
  })
})
