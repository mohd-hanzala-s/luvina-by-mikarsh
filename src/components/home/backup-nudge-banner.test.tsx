import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BackupNudgeBanner } from '@/components/home/backup-nudge-banner'

const now = new Date(2024, 0, 10, 12, 0, 0)

describe('BackupNudgeBanner', () => {
  it('renders nothing before the client time has resolved', () => {
    const { container } = render(<BackupNudgeBanner lastBackupAt={null} now={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('nudges when no backup has ever been made', () => {
    render(<BackupNudgeBanner lastBackupAt={null} now={now} />)
    expect(screen.getByText("You haven't backed up yet")).toBeInTheDocument()
  })

  it('nudges when the last backup is stale', () => {
    const threeDaysAgo = now.getTime() - 3 * 24 * 60 * 60 * 1000
    render(<BackupNudgeBanner lastBackupAt={threeDaysAgo} now={now} />)
    expect(screen.getByText("You haven't backed up in a while")).toBeInTheDocument()
  })

  it('stays hidden when the last backup is recent', () => {
    const oneHourAgo = now.getTime() - 60 * 60 * 1000
    const { container } = render(<BackupNudgeBanner lastBackupAt={oneHourAgo} now={now} />)
    expect(container).toBeEmptyDOMElement()
  })
})
