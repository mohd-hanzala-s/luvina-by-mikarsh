'use client'

import { cn } from '@/lib/utils'

export function SettingsSection({
  title,
  description,
  children,
  className,
  ...rest
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn('space-y-3', className)} {...rest}>
      <div className="px-1">
        <h2 className="font-display text-base font-semibold tracking-tight">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="overflow-hidden rounded-card border border-border/60 bg-card shadow-soft">
        {children}
      </div>
    </section>
  )
}

export function SettingsRow({
  icon,
  title,
  description,
  right,
  className,
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  right?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 px-5 py-3.5 sm:min-h-[64px] sm:flex-row sm:items-center sm:gap-3 sm:py-3.5 last:border-b-0',
        'border-b border-border/50',
        className,
      )}
    >
      <div className="flex items-center gap-3 sm:min-w-0 sm:flex-1">
        {icon && (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground/80">
            {icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{title}</p>
          {description && (
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {right && <div className="sm:shrink-0">{right}</div>}
    </div>
  )
}
