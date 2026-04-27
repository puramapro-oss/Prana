"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { DailyScore } from "@/lib/supabase/types"
import type { BadgeStatus } from "@/app/api/score/daily/route"

interface PointsBalance {
  points: number
  totalEarned: number
  totalRedeemed: number
}

export interface ScoreSnapshot {
  ok: true
  today: DailyScore | null
  series: DailyScore[]
  points: PointsBalance
  badges: BadgeStatus[]
  generated_at: string
  range_days: number
}

export function useScore(range: number = 30) {
  return useQuery<ScoreSnapshot>({
    queryKey: ["score", "daily", range],
    queryFn: async () => {
      const r = await fetch(`/api/score/daily?range=${range}`, { cache: "no-store" })
      const json = (await r.json()) as ScoreSnapshot | { error: string }
      if (!r.ok || !("ok" in json)) {
        throw new Error(("error" in json && json.error) || "Score indisponible.")
      }
      return json
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })
}

export function useReportSleep() {
  const qc = useQueryClient()
  return useMutation<void, Error, { quality: number; date?: string }>({
    mutationFn: async ({ quality, date }) => {
      const r = await fetch("/api/score/daily", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sleep_quality: quality, date }),
      })
      const json = (await r.json()) as { ok?: true; error?: string }
      if (!r.ok || !json.ok) throw new Error(json.error || "Impossible d'enregistrer.")
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["score", "daily"] })
    },
  })
}
