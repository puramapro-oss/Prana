"use client"

import { useState } from "react"
import { Check, Sparkles, Lock } from "lucide-react"
import { useTickRoom } from "@/hooks/use-rooms"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type { RoomDayAction, EnergyRequired } from "@/lib/supabase/types"

interface RoomDayActionCardProps {
  slug: string
  durationDays: number
  currentDay: number
  completed: boolean
  /** Today's action for current_day (1-indexed). Null if no template / out of range. */
  today: RoomDayAction | null
  /** True if the user already ticked today (we know via daily activity check passed by parent). */
  alreadyTickedToday: boolean
}

const ENERGY_LABEL: Record<EnergyRequired, string> = {
  low: "douce",
  medium: "moyenne",
  high: "forte",
}

export function RoomDayActionCard({
  slug,
  durationDays,
  currentDay,
  completed,
  today,
  alreadyTickedToday,
}: RoomDayActionCardProps) {
  const tick = useTickRoom()
  const [done, setDone] = useState(alreadyTickedToday)

  if (completed) {
    return (
      <Card className="glass border-primary/40">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Check className="size-4 text-primary" strokeWidth={1.8} />
            <CardTitle className="text-base font-medium">Room terminée</CardTitle>
          </div>
          <CardDescription>
            Tu as fini les {durationDays} jours. Tu reprends ce que tu veux quand tu veux.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!today) {
    return (
      <Card className="glass">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Pas d&apos;action prévue pour aujourd&apos;hui.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass border-primary/30">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Jour {currentDay} / {durationDays}
            </p>
            <CardTitle className="text-lg font-medium leading-snug">{today.title}</CardTitle>
          </div>
          <Badge variant="secondary" className="shrink-0 text-[10px]">
            énergie {ENERGY_LABEL[today.energy] ?? today.energy}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed">{today.action}</p>
        <div className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground leading-relaxed">
          <span className="font-medium text-foreground">Pourquoi : </span>
          {today.why}
        </div>

        {done ? (
          <div className="flex items-center gap-2 text-sm text-primary">
            <Check className="size-4" strokeWidth={2} />
            Validée. Bravo. Reviens demain pour la suivante.
          </div>
        ) : (
          <Button
            size="lg"
            className="w-full"
            disabled={tick.isPending}
            onClick={() =>
              tick.mutate(
                { slug },
                {
                  onSuccess: (data) => {
                    setDone(true)
                    if (data.completed) {
                      toast.success(`Room terminée. +${data.pointsGranted} pts.`)
                    } else {
                      toast.success(`Validée. +${data.pointsGranted} pts.`)
                    }
                  },
                  onError: (e) => {
                    if (e.message.includes("déjà")) {
                      setDone(true)
                      toast.message("Déjà validée pour aujourd'hui.")
                    } else {
                      toast.error(e.message)
                    }
                  },
                },
              )
            }
          >
            <Sparkles className="size-4" />
            {tick.isPending ? "Validation…" : "C'est fait"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export function RoomLockedCard({ requiredPlan }: { requiredPlan: "pro" | "ultime" }) {
  return (
    <Card className="glass border-amber-300/40">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Lock className="size-4 text-amber-500" strokeWidth={1.6} />
          <CardTitle className="text-base font-medium">Room {requiredPlan.toUpperCase()}</CardTitle>
        </div>
        <CardDescription>
          Cette room fait partie du plan {requiredPlan === "pro" ? "Pro" : "Ultime"}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full">
          <a href="/pricing">Voir les plans</a>
        </Button>
      </CardContent>
    </Card>
  )
}
