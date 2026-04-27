import { Flame } from "lucide-react"
import { cn } from "@/lib/utils"

interface StreakBadgeProps {
  days: number
  className?: string
}

/**
 * Volontairement non-punitif. Si la série est cassée → on affiche encore un message
 * doux invitant à reprendre. JAMAIS d'icône triste, jamais de "tu as perdu".
 */
export function StreakBadge({ days, className }: StreakBadgeProps) {
  const active = days > 0
  const label = active
    ? `${days} jour${days > 1 ? "s" : ""} d'affilée`
    : "Reprends quand tu veux"

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 glass border",
        active ? "border-primary/30" : "border-border/40",
        className,
      )}
    >
      <Flame
        className={cn(
          "size-3.5",
          active ? "text-primary" : "text-muted-foreground",
        )}
        strokeWidth={1.6}
      />
      <span className={cn("text-xs font-medium", !active && "text-muted-foreground")}>
        {label}
      </span>
    </div>
  )
}
