"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { TwinProfile, TwinCommunicationStyle } from "@/lib/supabase/types"

interface TwinResponse {
  ok: true
  twin: TwinProfile | null
}

interface TwinRebuildResponse {
  ok: true
  twin: TwinProfile | null
  summary: string
  confidence: "low" | "medium" | "high"
  fallback_used: boolean
  signal: {
    pulses: number
    captures: number
    tasks: number
    executions: number
  }
}

const TWIN_KEY = ["twin", "self"] as const

export function useTwin() {
  return useQuery({
    queryKey: TWIN_KEY,
    queryFn: async (): Promise<TwinProfile | null> => {
      const r = await fetch("/api/agent/twin-update")
      if (!r.ok) {
        if (r.status === 401) return null
        throw new Error("fetch failed")
      }
      const j = (await r.json()) as TwinResponse
      return j.twin ?? null
    },
  })
}

export function useRebuildTwin() {
  const qc = useQueryClient()
  return useMutation<TwinRebuildResponse, Error, boolean | undefined>({
    mutationFn: async (force?: boolean): Promise<TwinRebuildResponse> => {
      const r = await fetch("/api/agent/twin-update", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ force: force === true }),
      })
      const j = (await r.json()) as TwinRebuildResponse | { error: string; cooldown_hours?: number }
      if (!r.ok || !("ok" in j)) {
        throw new Error("error" in j ? j.error : "Erreur")
      }
      return j
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TWIN_KEY })
    },
  })
}

export interface TwinPatch {
  communication_style?: TwinCommunicationStyle
  stress_triggers?: string[]
  recharge_activities?: string[]
  efficient_hours?: number[]
  personal_rules?: string[]
  values?: string[]
  protective_mode?: boolean
}

export function useUpdateTwin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (patch: TwinPatch): Promise<void> => {
      const r = await fetch("/api/agent/twin-update", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patch),
      })
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string }
      if (!r.ok || !j.ok) {
        throw new Error(j.error ?? "Mise à jour impossible.")
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TWIN_KEY })
    },
  })
}
