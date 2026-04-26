"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { PulseCheck } from "@/lib/supabase/types"

export interface PulseCheckPayload {
  stress: number
  energy: number
  time_available: PulseCheck["time_available"]
  context: PulseCheck["context"]
  mood_tags?: string[]
  notes?: string
}

interface PulseFetchResponse {
  ok: boolean
  last: PulseCheck | null
  recent: PulseCheck[]
}

interface PulseCreateResponse {
  ok: boolean
  pulse: PulseCheck
  safetyRedirect: string | null
}

const PULSE_KEY = ["pulse-check", "recent"] as const

export function usePulseChecks() {
  return useQuery({
    queryKey: PULSE_KEY,
    queryFn: async (): Promise<PulseFetchResponse> => {
      const r = await fetch("/api/agent/pulse-check")
      if (!r.ok) throw new Error("fetch failed")
      return r.json()
    },
  })
}

export function useLastPulseCheck() {
  const q = usePulseChecks()
  return {
    ...q,
    last: q.data?.last ?? null,
    recent: q.data?.recent ?? [],
  }
}

export function useCreatePulseCheck() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: PulseCheckPayload): Promise<PulseCreateResponse> => {
      const r = await fetch("/api/agent/pulse-check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = (await r.json()) as PulseCreateResponse | { error: string }
      if (!r.ok) {
        const err = (json as { error: string }).error ?? "Erreur"
        throw new Error(err)
      }
      return json as PulseCreateResponse
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PULSE_KEY })
    },
  })
}
