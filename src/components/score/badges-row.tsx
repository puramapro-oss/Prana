import { Heart, Moon, Target, Flame, Crown, Lock } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BadgeStatus } from "@/app/api/score/daily/route"

const ICONS: Record<BadgeStatus["slug"], LucideIcon> = {
  calm_7d: Heart,
  sleep_7d: Moon,
  focus_7d: Target,
  streak_7d: Flame,
  streak_30d: Crown,
}

interface BadgesRowProps {
  badges: BadgeStatus[]
}

export function BadgesRow({ badges }: BadgesRowProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {badges.map((b) => {
        const Icon = ICONS[b.slug] ?? Lock
        const pct = Math.round((b.progress ?? 0) * 100)
        return (
          <div
            key={b.slug}
            className={cn(
              "rounded-2xl glass border p-3 flex flex-col items-center gap-1.5 text-center",
              b.earned ? "border-primary/40" : "border-border/40 opacity-80",
            )}
          >
            <div
              className={cn(
                "size-9 rounded-full flex items-center justify-center",
                b.earned ? "bg-primary/15" : "bg-muted",
              )}
            >
              <Icon
                className={cn("size-4", b.earned ? "text-primary" : "text-muted-foreground")}
                strokeWidth={1.6}
              />
            </div>
            <p className="text-xs font-medium leading-tight">{b.label}</p>
            <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2">
              {b.description}
            </p>
            {!b.earned && (
              <div className="w-full h-1 rounded-full bg-muted overflow-hidden mt-1">
                <div
                  className="h-full bg-primary/60 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
