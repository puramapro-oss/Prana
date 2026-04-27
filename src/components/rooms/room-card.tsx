import Link from "next/link"
import { Users, Clock, Crown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

interface RoomCardProps {
  slug: string
  name: string
  description: string | null
  durationDays: number
  participantsCount: number
  isPremium: boolean
  isOfficial: boolean
  /** When the user is already a member, we display a subtle indicator. */
  membership?: { current_day: number; completed: boolean } | null
}

export function RoomCard({
  slug,
  name,
  description,
  durationDays,
  participantsCount,
  isPremium,
  isOfficial,
  membership,
}: RoomCardProps) {
  return (
    <Link
      href={`/rooms/${slug}`}
      className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
    >
      <Card
        className={cn(
          "glass border-border/40 group-hover:border-primary/40 transition-colors h-full overflow-hidden",
          membership && "border-primary/40",
        )}
      >
        <div
          className={cn(
            "h-20 -mx-px -mt-px relative",
            isPremium
              ? "bg-gradient-to-br from-amber-200/40 via-orange-200/30 to-pink-200/40 dark:from-amber-900/30 dark:via-orange-900/20 dark:to-pink-900/30"
              : "bg-gradient-to-br from-emerald-200/40 via-teal-200/30 to-sky-200/40 dark:from-emerald-900/30 dark:via-teal-900/20 dark:to-sky-900/30",
          )}
        >
          <div className="absolute top-2 right-2 flex items-center gap-1.5">
            {isPremium && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-background/80 backdrop-blur px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider">
                <Crown className="size-3" strokeWidth={1.6} /> premium
              </span>
            )}
            {isOfficial && !isPremium && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-background/80 backdrop-blur px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                officielle
              </span>
            )}
          </div>
          {membership && (
            <div className="absolute bottom-2 left-3 inline-flex items-center gap-1.5 rounded-full bg-background/85 backdrop-blur px-2 py-0.5 text-[10px] font-medium">
              {membership.completed ? (
                <>
                  <Check className="size-3 text-primary" strokeWidth={2} />
                  Terminée
                </>
              ) : (
                <>
                  Jour {membership.current_day} / {durationDays}
                </>
              )}
            </div>
          )}
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium leading-snug">{name}</CardTitle>
          {description && (
            <CardDescription className="text-xs leading-relaxed line-clamp-2">
              {description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="pt-0 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" strokeWidth={1.6} />
            {durationDays} j
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="size-3" strokeWidth={1.6} />
            {participantsCount}
          </span>
        </CardContent>
      </Card>
    </Link>
  )
}
