import { Bell, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

/**
 * A miniature slice of the real UI (header, buttons, badge, progress bar)
 * rendered with ordinary theme-token classes. It needs no theme-aware logic
 * of its own — because it's built from `bg-primary`, `bg-accent` etc, it
 * repaints the instant the CSS variables change, giving an accurate,
 * always-current preview of whatever theme is selected.
 */
export function PersonalizationPreview({ name }: { name?: string | null }) {
  return (
    <div className="space-y-4 rounded-card border border-border/60 bg-gradient-to-br from-primary/10 via-card to-accent/10 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Good morning</p>
          <p className="font-display text-base font-semibold tracking-tight">
            {name ? name : 'Luvina'}
          </p>
        </div>
        <span className="flex size-9 items-center justify-center rounded-input bg-muted text-foreground/80">
          <Bell className="size-4" aria-hidden="true" />
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm">
          <Heart className="size-3.5" aria-hidden="true" />
          Log today
        </Button>
        <Button size="sm" variant="outline">
          Details
        </Button>
        <Badge className="ml-auto">Day 14</Badge>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Cycle progress</span>
          <span>14 / 28</span>
        </div>
        <Progress value={50} />
      </div>
    </div>
  )
}
