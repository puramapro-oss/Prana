import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { aiLimiter } from "@/lib/upstash"
import { askClaudeJSON } from "@/lib/agent/anthropic"
import {
  TWIN_BUILDER_SYSTEM,
  buildTwinBuilderUserMessage,
  TWIN_BUILDER_FALLBACK,
  type TwinBuilderInput,
  type TwinBuilderOutput,
} from "@/lib/agent/prompts/twin-builder"
import type {
  Plan,
  Profile,
  PulseCheck,
  Capture,
  Task,
  Execution,
  TwinProfile,
} from "@/lib/supabase/types"

export const runtime = "nodejs"

const TIMEOUT_MS = 30000
const MIN_HOURS_BETWEEN_REBUILDS = 23 // 1×/jour soft

const ResponseSchema = z.object({
  communication_style: z.object({
    tone: z.enum(["casual", "warm", "professional", "direct", "playful"]).nullable().optional(),
    length: z.enum(["short", "medium", "long"]).nullable().optional(),
    formality: z.enum(["low", "medium", "high"]).nullable().optional(),
    emoji_use: z.enum(["none", "rare", "moderate", "frequent"]).nullable().optional(),
  }),
  decision_patterns: z.object({
    speed: z.enum(["fast", "deliberate", "context_dependent"]).nullable().optional(),
    evidence_preference: z.enum(["data", "intuition", "balanced"]).nullable().optional(),
    risk_appetite: z.enum(["low", "medium", "high"]).nullable().optional(),
    consultation: z.enum(["solo", "with_others", "varies"]).nullable().optional(),
  }),
  working_habits: z.object({
    best_focus_window: z.enum(["morning", "afternoon", "evening", "night"]).nullable().optional(),
    break_frequency_minutes: z.number().int().min(15).max(240).nullable().optional(),
    preferred_session_minutes: z.number().int().min(15).max(240).nullable().optional(),
    avoid_meetings_before_hour: z.number().int().min(0).max(12).nullable().optional(),
    weekends_off: z.boolean().nullable().optional(),
  }),
  stress_triggers: z.array(z.string().min(1).max(80)).max(10).default([]),
  recharge_activities: z.array(z.string().min(1).max(80)).max(10).default([]),
  efficient_hours: z.array(z.number().int().min(0).max(23)).max(24).default([]),
  personal_rules: z.array(z.string().min(1).max(160)).max(15).default([]),
  values: z.array(z.string().min(1).max(40)).max(10).default([]),
  summary: z.string().min(1).max(1200),
  confidence: z.enum(["low", "medium", "high"]),
})

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Non connecté." }, { status: 401 })
    }

    const profileResp = await supabase
      .from("twin_profiles")
      .select(
        "id, user_id, communication_style, decision_patterns, stress_triggers, recharge_activities, efficient_hours, working_habits, personal_rules, values, protective_mode, last_full_update, created_at, updated_at",
      )
      .eq("user_id", user.id)
      .maybeSingle()

    return NextResponse.json({
      ok: true,
      twin: profileResp.data ?? null,
    })
  } catch (e) {
    console.error("[twin GET]", e)
    return NextResponse.json({ error: "Impossible de charger ton Twin." }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Non connecté." }, { status: 401 })
    }

    const limit = await aiLimiter.limit(user.id)
    if (!limit.success) {
      return NextResponse.json(
        { error: "Trop de rebuilds rapprochés. Réessaie dans 1 minute." },
        { status: 429 },
      )
    }

    const profileResp = await supabase
      .from("profiles")
      .select("plan, locale")
      .eq("id", user.id)
      .maybeSingle()
    const profile = profileResp.data as Pick<Profile, "plan" | "locale"> | null
    const userPlan: Plan = profile?.plan ?? "free"

    if (userPlan !== "pro" && userPlan !== "ultime") {
      return NextResponse.json(
        {
          error: "Le rebuild IA du Twin fait partie du plan Pro.",
          upgradeRequired: "pro",
        },
        { status: 402 },
      )
    }

    // 1×/24h soft limit (DB-counted via last_full_update)
    const priorResp = await supabase
      .from("twin_profiles")
      .select(
        "id, user_id, communication_style, decision_patterns, stress_triggers, recharge_activities, efficient_hours, working_habits, personal_rules, values, protective_mode, last_full_update, created_at, updated_at",
      )
      .eq("user_id", user.id)
      .maybeSingle()
    const prior = priorResp.data as TwinProfile | null

    const body = (await req.json().catch(() => ({}))) as { force?: boolean }

    if (prior?.last_full_update && !body.force) {
      const hoursSince =
        (Date.now() - new Date(prior.last_full_update).getTime()) / (1000 * 60 * 60)
      if (hoursSince < MIN_HOURS_BETWEEN_REBUILDS) {
        const waitHours = Math.ceil(MIN_HOURS_BETWEEN_REBUILDS - hoursSince)
        return NextResponse.json(
          {
            error: `Ton Twin a été recalculé il y a ${Math.round(hoursSince)}h. Reviens dans ${waitHours}h ou utilise force=true.`,
            cooldown_hours: waitHours,
          },
          { status: 429 },
        )
      }
    }

    // Gather signal
    const [pulsesResp, capturesResp, tasksResp, execsResp] = await Promise.all([
      supabase
        .from("pulse_checks")
        .select("stress, energy, time_available, context, mood_tags, notes, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("captures")
        .select("raw_text, source, classification, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("tasks")
        .select("title, description, priority, energy_required, time_estimate_minutes, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("executions")
        .select("type, context_json, draft_text, approved, used_at, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20),
    ])

    const input: TwinBuilderInput = {
      locale: profile?.locale ?? "fr",
      recentPulses: (pulsesResp.data ?? []) as TwinBuilderInput["recentPulses"],
      recentCaptures: (capturesResp.data ?? []) as TwinBuilderInput["recentCaptures"],
      recentTasks: (tasksResp.data ?? []) as TwinBuilderInput["recentTasks"],
      recentExecutions: (execsResp.data ?? []) as TwinBuilderInput["recentExecutions"],
      prior,
    }

    let output: TwinBuilderOutput
    let fallbackUsed = false

    try {
      const aiCall = askClaudeJSON<unknown>(buildTwinBuilderUserMessage(input), {
        system: TWIN_BUILDER_SYSTEM,
        tier: "deep", // opus-4-7
        maxTokens: 4000,
        temperature: 0.3,
      })
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("twin_timeout")), TIMEOUT_MS),
      )
      const result = await Promise.race([aiCall, timeout])
      const validated = ResponseSchema.safeParse(result)
      if (validated.success) {
        output = validated.data as TwinBuilderOutput
      } else {
        console.error("[twin] invalid shape", validated.error.flatten())
        fallbackUsed = true
        output = TWIN_BUILDER_FALLBACK(input)
      }
    } catch (err) {
      console.error("[twin] AI", err)
      fallbackUsed = true
      output = TWIN_BUILDER_FALLBACK(input)
    }

    // Upsert via admin (auth context already validated)
    const admin = createAdminClient()
    const upsertResp = await admin
      .from("twin_profiles")
      .upsert(
        {
          user_id: user.id,
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
      .select(
        "id, user_id, communication_style, decision_patterns, stress_triggers, recharge_activities, efficient_hours, working_habits, personal_rules, values, protective_mode, last_full_update, created_at, updated_at",
      )
      .maybeSingle()

    return NextResponse.json({
      ok: true,
      twin: upsertResp.data ?? null,
      summary: output.summary,
      confidence: output.confidence,
      fallback_used: fallbackUsed,
      signal: {
        pulses: input.recentPulses.length,
        captures: input.recentCaptures.length,
        tasks: input.recentTasks.length,
        executions: input.recentExecutions.length,
      },
    })
  } catch (e) {
    console.error("[api/twin-update]", e)
    return NextResponse.json(
      { error: "Rebuild impossible. Réessaie dans un instant." },
      { status: 500 },
    )
  }
}

const PatchSchema = z.object({
  communication_style: z.record(z.string(), z.unknown()).optional(),
  stress_triggers: z.array(z.string().min(1).max(80)).max(10).optional(),
  recharge_activities: z.array(z.string().min(1).max(80)).max(10).optional(),
  efficient_hours: z.array(z.number().int().min(0).max(23)).max(24).optional(),
  personal_rules: z.array(z.string().min(1).max(160)).max(15).optional(),
  values: z.array(z.string().min(1).max(40)).max(10).optional(),
  protective_mode: z.boolean().optional(),
})

/** Manual edits from /twin/personality, /twin/rules, /twin/values, mode toggle. */
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Non connecté." }, { status: 401 })

    const profileResp = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .maybeSingle()
    const userPlan: Plan = ((profileResp.data?.plan as Plan | undefined) ?? "free")

    if (userPlan === "free") {
      return NextResponse.json(
        { error: "L'édition manuelle du Twin fait partie du plan Starter.", upgradeRequired: "starter" },
        { status: 402 },
      )
    }

    const body = await req.json().catch(() => null)
    const parsed = PatchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Requête invalide.", details: parsed.error.flatten() }, { status: 400 })
    }
    const update = parsed.data

    if (update.protective_mode && userPlan !== "pro" && userPlan !== "ultime") {
      return NextResponse.json(
        { error: "Le mode protecteur fait partie du plan Pro.", upgradeRequired: "pro" },
        { status: 402 },
      )
    }

    const admin = createAdminClient()
    // Ensure row exists
    await admin
      .from("twin_profiles")
      .upsert({ user_id: user.id }, { onConflict: "user_id", ignoreDuplicates: true })

    const { error } = await admin
      .from("twin_profiles")
      .update(update as unknown as Record<string, unknown>)
      .eq("user_id", user.id)

    if (error) {
      console.error("[twin PATCH]", error)
      return NextResponse.json({ error: "Mise à jour impossible." }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[api/twin-update PATCH]", e)
    return NextResponse.json({ error: "Erreur." }, { status: 500 })
  }
}
