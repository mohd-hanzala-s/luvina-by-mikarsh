import { Skeleton } from '@/components/ui/skeleton'

/** See src/app/loading.tsx for why this exists alongside each page's own data-loading skeleton. */
export default function HistoryLoading() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-24 w-full rounded-card" />
      <Skeleton className="h-24 w-full rounded-card" />
      <Skeleton className="h-24 w-full rounded-card" />
    </div>
  )
}
