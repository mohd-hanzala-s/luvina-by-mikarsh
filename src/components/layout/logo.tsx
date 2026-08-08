import { cn } from '@/lib/utils'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

/**
 * The Luvina mark: a violet droplet cradled between a violet flame (left)
 * and a gold flame (right), with a small sparkle — a literal reading of
 * "understand your cycle, embrace your flow." Ships as a single high-res
 * transparent PNG (public/brand/mark.png, source in scripts/assets/) rather
 * than hand-authored vectors, so it always matches the approved brand art
 * exactly. It has enough native resolution to stay crisp at any size this
 * app uses it at.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <img
      src={`${basePath}/brand/mark.png`}
      alt="Luvina"
      className={cn('size-10 select-none object-contain', className)}
      draggable={false}
      fetchPriority="high"
    />
  )
}

/** Small wordmark lockup — the mark plus "Luvina" + tracked "by Mikarsh" subtitle. */
export function Wordmark({
  className,
  markClassName,
  showSubtitle = true,
}: {
  className?: string
  markClassName?: string
  showSubtitle?: boolean
}) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <Logo className={cn('size-9', markClassName)} />
      <div className="flex flex-col leading-none">
        <span className="font-display text-lg font-semibold tracking-tight">Luvina</span>
        {showSubtitle && (
          <span className="text-[9px] font-medium uppercase tracking-[0.28em] text-accent-strong">
            by&nbsp;M&nbsp;I&nbsp;K&nbsp;&Lambda;&nbsp;R&nbsp;S&nbsp;H
          </span>
        )}
      </div>
    </div>
  )
}
