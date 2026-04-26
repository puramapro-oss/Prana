import { Flame } from "lucide-react"
import { cn } from "@/lib/utils"

interface StreakBadgeProps {
  streakDays: number
  className?: string
}

/**
 * Affiche la série de jours actifs. Jamais punitif :
 * 0 jour = "tu commences", 1 = encouragement, ≥2 = compteur.
 */
export function StreakBadge({ streakDays, className }: StreakBadgeProps) {
  let label: string
  if (streakDays === 0) label = "Tu commences"
  else if (streakDays === 1) label = "1 jour"
  else label = `${streakDays} jours`

  const intensity = Math.min(streakDays / 30, 1) // 0..1
  const flameOpacity = 0.55 + intensity * 0.45

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border/40 bg-card/60 px-3 py-1.5 text-xs",
        className,
      )}
      title={streakDays > 0 ? `Série : ${streakDays} jours` : "Pas de pression — tu commences."}
    >
      <Flame
        className="size-3.5 text-orange-500"
        strokeWidth={2}
        style={{ opacity: flameOpacity }}
        aria-hidden
      />
      <span className="font-medium text-foreground/90 tabular-nums">{label}</span>
    </div>
  )
}
