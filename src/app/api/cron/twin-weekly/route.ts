import { NextResponse, type NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { askClaudeJSON } from "@/lib/agent/anthropic"
import {
  TWIN_BUILDER_SYSTEM,
  buildTwinBuilderUserMessage,
  TWIN_BUILDER_FALLBACK,
  type TwinBuilderInput,
  type TwinBuilderOutput,
} from "@/lib/agent/prompts/twin-builder"
import type { Profile, TwinProfile } from "@/lib/supabase/types"

export const runtime = "nodejs"
export const maxDuration = 300 // Vercel : up to 5 min for the cron run

const TIMEOUT_MS = 30000

/**
 * CRON twin-weekly — runs Sunday 04:00 UTC (vercel.json schedule).
 *
 * For every Pro/Ultime user active in the last 30 days, rebuild the Twin
 * profile via opus-4-7. Tolerant to per-user failures (logs, continues).
 *
 * Auth : `Authorization: Bearer ${CRON_SECRET}` — Vercel cron sets it.
 */
export async function GET(req: NextRequest) {
  // Vercel cron auth : prefers the `x-vercel-cron` header but supports CRON_SECRET.
  const expected = process.env.CRON_SECRET
  if (expected) {
    const auth = req.headers.get("authorization") ?? ""
    if (auth !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  } else if (!req.headers.get("x-vercel-cron")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const admin = createAdminClient()
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

  // Eligible users : Pro/Ultime with activity in last 30 days (any pulse insert).
  const eligibleResp = await admin
    .from("profiles")
    .select("id, plan, locale")
    .in("plan", ["pro", "ultime"])
    .limit(500)

  const profiles = (eligibleResp.data ?? []) as Pick<Profile, "id" | "plan" | "locale">[]
  if (profiles.length === 0) {
    return NextResponse.json({ ok: true, processed: 0, message: "no eligible users" })
  }

  let processed = 0
  let skipped = 0
  let failed = 0
  let fallback = 0
  const startedAt = Date.now()

  for (const profile of profiles) {
    try {
      // Activity gate : at least 1 pulse OR 1 capture in last 30d
      const activityResp = await admin
        .from("pulse_checks")
        .select("id", { count: "exact", head: true })
        .eq("user_id", profile.id)
        .gte("created_at", thirtyDaysAgo)

      const hasActivity = (activityResp.count ?? 0) > 0
      if (!hasActivity) {
        skipped++
        continue
      }

      const [pulsesResp, capturesResp, tasksResp, execsResp, priorResp] = await Promise.all([
        admin
          .from("pulse_checks")
          .select("stress, energy, time_available, context, mood_tags, notes, created_at")
          .eq("user_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(30),
        admin
          .from("captures")
          .select("raw_text, source, classification, created_at")
          .eq("user_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(30),
        admin
          .from("tasks")
          .select("title, description, priority, energy_required, time_estimate_minutes, status, created_at")
          .eq("user_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(30),
        admin
          .from("executions")
          .select("type, context_json, draft_text, approved, used_at, created_at")
          .eq("user_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(20),
        admin
          .from("twin_profiles")
          .select(
            "id, user_id, communication_style, decision_patterns, stress_triggers, recharge_activities, efficient_hours, working_habits, personal_rules, values, protective_mode, last_full_update, created_at, updated_at",
          )
          .eq("user_id", profile.id)
          .maybeSingle(),
      ])

      const input: TwinBuilderInput = {
        locale: profile.locale ?? "fr",
        recentPulses: (pulsesResp.data ?? []) as TwinBuilderInput["recentPulses"],
        recentCaptures: (capturesResp.data ?? []) as TwinBuilderInput["recentCaptures"],
        recentTasks: (tasksResp.data ?? []) as TwinBuilderInput["recentTasks"],
        recentExecutions: (execsResp.data ?? []) as TwinBuilderInput["recentExecutions"],
        prior: (priorResp.data as TwinProfile | null) ?? null,
      }

      let output: TwinBuilderOutput
      let fallbackUsed = false
      try {
        const aiCall = askClaudeJSON<TwinBuilderOutput>(buildTwinBuilderUserMessage(input), {
          system: TWIN_BUILDER_SYSTEM,
          tier: "deep",
          maxTokens: 4000,
          temperature: 0.3,
        })
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("twin_timeout")), TIMEOUT_MS),
        )
        output = await Promise.race([aiCall, timeout])
      } catch (err) {
        console.error("[cron twin-weekly] user", profile.id, err)
        fallbackUsed = true
        output = TWIN_BUILDER_FALLBACK(input)
      }

      await admin
        .from("twin_profiles")
        .upsert(
          {
            user_id: profile.id,
            communication_style: output.communication_style as unknown as Record<string, unknown>,
            decision_patterns: output.decision_patterns as unknown as Record<string, unknown>,
            working_habits: output.working_habits as unknown as Record<string, unknown>,
            stress_triggers: output.stress_triggers,
            recharge_activities: output.recharge_activities,
            efficient_hours: output.efficient_hours,
            personal_rules: output.personal_rules,
            values: output.values,
            last_full_update: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        )

      processed++
      if (fallbackUsed) fallback++
    } catch (err) {
      console.error("[cron twin-weekly] user fail", profile.id, err)
      failed++
    }
  }

  const durationMs = Date.now() - startedAt
  return NextResponse.json({
    ok: true,
    eligible: profiles.length,
    processed,
    skipped_inactive: skipped,
    failed,
    fallback,
    duration_ms: durationMs,
  })
}
