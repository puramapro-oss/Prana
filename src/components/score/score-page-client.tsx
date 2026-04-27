"use client"

import { useState } from "react"
import { useScore, useReportSleep } from "@/hooks/use-score"
import {
  StressEnergyChart,
  SleepChart,
  FocusChart,
  AvancementChart,
} from "@/components/score/score-chart"
import { StreakBadge } from "@/components/score/streak-badge"
import { BadgesRow } from "@/components/score/badges-row"
import { PointsCard } from "@/components/score/points-card"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Moon } from "lucide-react"

export function ScorePageClient() {
  const { data, isLoading, error } = useScore(30)
  const reportSleep = useReportSleep()
  const [sleep, setSleep] = useState<number>(7)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[180px] w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card className="glass">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          {(error as Error | undefined)?.message ?? "Score indisponible pour le moment."}
        </CardContent>
      </Card>
    )
  }

  const today = data.today
  const streak = today?.streak_days ?? 0
  const todaySleep = today?.sleep_quality ?? null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <StreakBadge days={streak} />
        <div className="text-xs text-muted-foreground">
          {data.series.length} jours observés · mis à jour {new Date(data.generated_at).toLocaleString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <PointsCard
          balance={data.points.points}
          totalEarned={data.points.totalEarned}
          totalRedeemed={data.points.totalRedeemed}
        />
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Moon className="size-4 text-primary" strokeWidth={1.6} />
              Comment tu as dormi ?
            </CardTitle>
            <CardDescription>
              Auto-déclaré. Aucune déduction. {todaySleep !== null ? `Aujourd'hui : ${todaySleep}/10.` : "Pas encore renseigné."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-3 text-center">0</span>
              <Slider
                value={[sleep]}
                min={0}
                max={10}
                step={1}
                onValueChange={(v) => setSleep(Array.isArray(v) ? v[0] ?? 0 : v)}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-6 text-center font-medium tabular-nums">
                {sleep}
              </span>
            </div>
            <Button
              size="sm"
              className="w-full"
              disabled={reportSleep.isPending}
              onClick={() =>
                reportSleep.mutate(
                  { quality: sleep },
                  {
                    onSuccess: () => toast.success("Sommeil enregistré."),
                    onError: (e) => toast.error(e.message),
                  },
                )
              }
            >
              Enregistrer
            </Button>
          </CardContent>
        </Card>
      </div>

      <BadgesRow badges={data.badges} />

      <div className="grid gap-3 lg:grid-cols-2">
        <StressEnergyChart series={data.series} />
        <SleepChart series={data.series} />
        <FocusChart series={data.series} />
        <AvancementChart series={data.series} />
      </div>
    </div>
  )
}
