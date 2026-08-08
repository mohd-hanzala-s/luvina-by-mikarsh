import { Skeleton } from '@/components/ui/skeleton'

/** See src/app/loading.tsx for why this exists alongside each page's own data-loading skeleton. */
export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-40 w-full rounded-card" />
      <Skeleton className="h-40 w-full rounded-card" />
      <Skeleton className="h-32 w-full rounded-card" />
    </div>
  )
}
