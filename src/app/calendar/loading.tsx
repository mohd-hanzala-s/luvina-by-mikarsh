import { Skeleton } from '@/components/ui/skeleton'

/** See src/app/loading.tsx for why this exists alongside each page's own data-loading skeleton. */
export default function CalendarLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="size-9 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-96 w-full rounded-card" />
    </div>
  )
}
