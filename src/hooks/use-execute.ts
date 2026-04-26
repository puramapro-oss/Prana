"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createBrowserClient } from "@supabase/ssr"
import type { Database, Execution, ExecutionType } from "@/lib/supabase/types"
import type { ExecuteOutput } from "@/lib/agent/prompts/execute"

let _client: ReturnType<typeof createBrowserClient<Database, "prana">> | null = null
function getBrowserClient() {
  if (_client) return _client
  _client = createBrowserClient<Database, "prana">(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { db: { schema: "prana" } },
  )
  return _client
}

export interface ExecuteRequest {
  type: ExecutionType
  situation: string
  recipient?: string
  tone?: string
}

export interface ExecuteSuccess {
  ok: true
  execution: { id: string; type: ExecutionType; created_at: string } | null
  response: ExecuteOutput
  fallback_used: boolean
  safetyRedirect: string | null
  quota: { used: number; limit: number; unlimited: boolean }
}

export const executeKeys = {
  history: (type?: ExecutionType) => ["executions", type ?? "all"] as const,
}

export function useExecuteHistory(type?: ExecutionType) {
  return useQuery({
    queryKey: executeKeys.history(type),
    queryFn: async (): Promise<Execution[]> => {
      const supabase = getBrowserClient()
      let q = supabase
        .from("executions")
        .select(
          "id, user_id, type, context_json, draft_text, draft_alternatives, approved, used_at, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(40)
      if (type) q = q.eq("type", type)
      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as Execution[]
    },
  })
}

export function useGenerateExecution() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: ExecuteRequest): Promise<ExecuteSuccess> => {
      const r = await fetch("/api/agent/execute", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(vars),
      })
      const j = (await r.json()) as ExecuteSuccess | { error: string; quotaReached?: boolean; upgradeRequired?: string }
      if (!r.ok || !("ok" in j)) {
        const err = "error" in j ? j.error : "Erreur"
        throw new Error(err)
      }
      return j
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["executions"] })
    },
  })
}

export function useMarkExecutionUsed() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch("/api/agent/execute", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, approved: true, used: true }),
      })
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string }
        throw new Error(j.error ?? "Erreur")
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["executions"] })
    },
  })
}
