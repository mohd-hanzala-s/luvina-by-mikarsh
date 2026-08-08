import { memo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CalendarDays,
  Home,
  History,
  ChartPie,
  Settings,
  Info,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NavItem } from '@/types'

const NAV_ICONS: Record<string, LucideIcon> = {
  home: Home,
  calendar: CalendarDays,
  history: History,
  insights: ChartPie,
  settings: Settings,
  info: Info,
}

type SidebarNavProps = { items: NavItem[]; currentPath: string; footer?: React.ReactNode }
type BottomNavProps = { items: NavItem[]; currentPath: string }

function SidebarNavInner({ items, currentPath, footer }: SidebarNavProps) {
  return (
    <nav
      aria-label="Main navigation"
      className="flex h-full flex-col gap-1.5 px-3 py-4"
    >
      {items.map((item) => {
        const Icon = NAV_ICONS[item.icon] ?? Home
        const active = currentPath === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'group flex items-center gap-3 rounded-input px-3.5 py-2.5 text-sm font-medium transition-all',
              active
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            <Icon
              className={cn(
                'size-5 shrink-0 transition-colors',
                active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
              )}
            />
            {item.label}
            {active && (
              <span className="ml-auto size-1.5 rounded-full bg-primary" aria-hidden="true" />
            )}
          </Link>
        )
      })}
      {footer && <div className="mt-auto px-3.5">{footer}</div>}
    </nav>
  )
}

export const SidebarNav = memo(SidebarNavInner)

function BottomNavInner({ items, currentPath }: BottomNavProps) {
  return (
    <nav
      aria-label="Main navigation"
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/80 backdrop-blur-xl"
    >
      <div className="mx-auto grid max-w-md grid-cols-6 gap-1 px-2 py-1.5 sm:max-w-lg sm:gap-2 sm:px-4 sm:py-2">
        {items.map((item) => {
          const Icon = NAV_ICONS[item.icon] ?? Home
          const active = currentPath === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center gap-1 rounded-input py-1.5 text-[11px] font-medium transition-colors sm:text-xs',
                active ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-12 items-center justify-center rounded-full transition-colors sm:h-9 sm:w-14',
                  active ? 'bg-primary/10' : '',
                )}
              >
                <Icon className="size-5 sm:size-5" strokeWidth={active ? 2.2 : 1.8} />
              </span>
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export const BottomNav = memo(BottomNavInner)

export function useCurrentNavPath() {
  const pathname = usePathname()
  return pathname
}
