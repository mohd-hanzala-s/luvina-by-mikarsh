import { Skeleton } from '@/components/ui/skeleton'

/**
 * Shown by the Next.js router the instant a client-side navigation to this
 * route starts, while the route's own JS chunk streams in — before
 * `useAppData`'s `loaded` flag even exists yet. Kept intentionally simple
 * and route-shaped; the richer, data-aware skeleton for "IndexedDB hasn't
 * resolved yet" still lives in each page via its own `loaded` check.
 */
export default function HomeLoading() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-40 w-full rounded-card" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Skeleton className="h-24 rounded-card" />
        <Skeleton className="h-24 rounded-card" />
      </div>

      <Skeleton className="h-64 w-full rounded-card" />
    </div>
  )
}
