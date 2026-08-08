import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import HelpPage from '@/app/help/page'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}))

describe('HelpPage', () => {
  it('renders the Help & Discover header', () => {
    render(<HelpPage />)
    expect(screen.getByRole('heading', { name: /Help & Discover/ })).toBeInTheDocument()
  })

  it('shows search results and restores the default content after clearing', async () => {
    const user = userEvent.setup()
    render(<HelpPage />)

    await user.type(screen.getByLabelText('Search help'), 'backup')
    expect(await screen.findByText('Backing up & exporting your data')).toBeInTheDocument()
    expect(screen.queryByText('Frequently asked questions')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Clear search' }))
    expect(await screen.findByText('Frequently asked questions')).toBeInTheDocument()
    // "Backing up & exporting your data" also exists in the default grouped
    // articles view — the article is naturally visible when search is off.
    expect(screen.getByText('Backing up & exporting your data')).toBeInTheDocument()
  })

  it('shows an empty state when nothing matches', async () => {
    const user = userEvent.setup()
    render(<HelpPage />)

    await user.type(screen.getByLabelText('Search help'), 'zzzzzz')
    expect(await screen.findByText(/No matches yet/)).toBeInTheDocument()
  })
})
