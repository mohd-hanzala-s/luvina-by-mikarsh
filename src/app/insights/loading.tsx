import { Skeleton } from '@/components/ui/skeleton'

/** See src/app/loading.tsx for why this exists alongside each page's own data-loading skeleton. */
export default function InsightsLoading() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-8 w-32" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-card" />
        ))}
      </div>
      <Skeleton className="h-56 w-full rounded-card" />
    </div>
  )
}
