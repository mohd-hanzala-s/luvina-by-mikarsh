import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SplashScreen } from '@/components/onboarding/splash-screen'
import { APP_NAME, APP_TAGLINE } from '@/constants'

describe('SplashScreen', () => {
  it('renders the brand name and official tagline', () => {
    render(<SplashScreen onComplete={vi.fn()} />)
    expect(screen.getByRole('heading', { name: APP_NAME })).toBeInTheDocument()
    expect(screen.getByText(APP_TAGLINE)).toBeInTheDocument()
  })
})
