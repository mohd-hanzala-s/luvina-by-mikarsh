import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ProductTour } from '@/components/help/product-tour'
import { TOUR_STEPS } from '@/lib/help/content'
import { useAppStore } from '@/store/appStore'

const { routerMock, pathnameFn } = vi.hoisted(() => {
  const pathnameFn = vi.fn(() => '/')
  return {
    routerMock: {
      push: vi.fn((path: string) => {
        pathnameFn.mockReturnValue(path)
      }),
      replace: vi.fn((path: string) => {
        pathnameFn.mockReturnValue(path)
      }),
      back: vi.fn(),
      prefetch: vi.fn(),
    },
    pathnameFn,
  }
})

vi.mock('next/navigation', () => ({
  useRouter: () => routerMock,
  usePathname: () => pathnameFn(),
}))

const TOTAL = TOUR_STEPS.length

async function advanceFlush(ms: number) {
  const step = 200
  for (let t = 0; t < ms; t += step) {
    await act(async () => {
      vi.advanceTimersByTime(Math.min(step, ms - t))
    })
  }
}

describe('ProductTour', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useAppStore.getState().setRequestProductTour(false)
  })

  afterEach(() => {
    vi.useRealTimers()
    useAppStore.getState().setRequestProductTour(false)
  })

  it('opens on the first step when requested', async () => {
    useAppStore.getState().setRequestProductTour(true)
    render(<ProductTour />)
    await advanceFlush(9_000)

    expect(screen.getByRole('dialog', { name: 'Guided tour' })).toBeInTheDocument()
    expect(screen.getByText(`Step 1 of ${TOTAL}`)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: TOUR_STEPS[0].title })).toBeInTheDocument()
  })

  it('renders nothing when not requested', () => {
    const { container } = render(<ProductTour />)
    expect(container).toBeEmptyDOMElement()
  })

  it('advances to the next step', async () => {
    useAppStore.getState().setRequestProductTour(true)
    render(<ProductTour />)
    await advanceFlush(9_000)

    fireEvent.click(screen.getByRole('button', { name: /^next$/i }))
    await advanceFlush(9_000)

    expect(screen.getByText(`Step 2 of ${TOTAL}`)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: TOUR_STEPS[1].title })).toBeInTheDocument()
  })

  it('goes back to the previous step', async () => {
    useAppStore.getState().setRequestProductTour(true)
    render(<ProductTour />)
    await advanceFlush(9_000)

    fireEvent.click(screen.getByRole('button', { name: /^next$/i }))
    await advanceFlush(9_000)
    fireEvent.click(screen.getByRole('button', { name: /previous step/i }))
    await advanceFlush(9_000)

    expect(screen.getByText(`Step 1 of ${TOTAL}`)).toBeInTheDocument()
  })

  it('closes on skip and clears the request flag', async () => {
    useAppStore.getState().setRequestProductTour(true)
    render(<ProductTour />)
    await advanceFlush(9_000)

    fireEvent.click(screen.getByRole('button', { name: /skip tour/i }))
    await act(async () => {
      vi.advanceTimersByTime(0)
    })

    expect(screen.queryByRole('dialog', { name: 'Guided tour' })).not.toBeInTheDocument()
    expect(useAppStore.getState().requestProductTour).toBe(false)
  })

  it('finishes the last step with the Finish button', async () => {
    useAppStore.getState().setRequestProductTour(true)
    render(<ProductTour />)
    await advanceFlush(9_000)

    for (let i = 1; i < TOTAL; i++) {
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /^next$/i }))
      })
      await advanceFlush(9_000)
    }

    fireEvent.click(screen.getByRole('button', { name: /^finish$/i }))
    await act(async () => {
      vi.advanceTimersByTime(0)
    })

    expect(screen.queryByRole('dialog', { name: 'Guided tour' })).not.toBeInTheDocument()
    expect(useAppStore.getState().requestProductTour).toBe(false)
  })
})
