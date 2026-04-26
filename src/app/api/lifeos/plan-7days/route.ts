import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { aiLimiter } from "@/lib/upstash"
import { askClaudeJSON } from "@/lib/agent/anthropic"
import {
  PLAN_7_DAYS_SYSTEM,
  buildPlan7DaysUserMessage,
  PLAN_7_DAYS_FALLBACK,
  type Plan7DaysInput,
  type Plan7DaysOutput,
} from "@/lib/agent/prompts/plan-7days"
import { loadTwin, toTwinSnapshot } from "@/lib/agent/twin-loader"
import type {
  Plan,
  Profile,
  PulseCheck,
  Task,
  Project,
} from "@/lib/supabase/types"

export const runtime = "nodejs"

const ResponseSchema = z.object({
  days: z
    .array(
      z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        focus: z.string().min(1).max(240),
        action: z.string().min(1).max(240),
        micro_actions: z.array(z.string().min(1).max(160)).max(3).default([]),
        energy_hint: z.enum(["low", "medium", "high"]),
        related_task_ids: z.array(z.string()).max(8).default([]),
        related_project_ids: z.array(z.string()).max(4).default([]),
      }),
    )
    .length(7),
  summary: z.string().min(1).max(800),
})

const TIMEOUT_MS = 18000

function todayISO(): string {
  const d = new Date()
  d.setUTCHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Non connecté." }, { status: 401 })
    }

    const start = todayISO()
    const planResp = await supabase
      .from("lifeos_plans")
      .select("id, user_id, start_date, payload, generated_at")
      .eq("user_id", user.id)
      .eq("start_date", start)
      .maybeSingle()

    return NextResponse.json({
      ok: true,
      plan: planResp.data ?? null,
    })
  } catch (e) {
    console.error("[api/plan-7days GET]", e)
    return NextResponse.json(
      { error: "Impossible de charger ton plan." },
      { status: 500 },
    )
  }
}

const PostSchema = z.object({
  force: z.boolean().optional(),
})

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
        { error: "Trop de générations rapprochées. Réessaie dans 1 minute." },
        { status: 429 },
      )
    }

    const body = await req.json().catch(() => ({}))
    const parsed = PostSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
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
          error: "Le Plan 7 jours fait partie du plan Pro.",
          upgradeRequired: "pro",
        },
        { status: 402 },
      )
    }

    const start = todayISO()
    const existingResp = await supabase
      .from("lifeos_plans")
      .select("id, payload, generated_at")
      .eq("user_id", user.id)
      .eq("start_date", start)
      .maybeSingle()
    const existing = existingResp.data

    if (existing && !parsed.data.force) {
      return NextResponse.json({
        ok: true,
        plan: { ...existing, start_date: start, user_id: user.id },
        cached: true,
      })
    }

    // Gather context
    const [pulsesResp, tasksResp, projectsResp] = await Promise.all([
      supabase
        .from("pulse_checks")
        .select("stress, energy, time_available, context, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(7),
      supabase
        .from("tasks")
        .select("id, title, priority, energy_required, time_estimate_minutes, due_at, project_id")
        .eq("user_id", user.id)
        .lte("priority", 2)
        .in("status", ["todo", "doing"])
        .order("priority", { ascending: true })
        .order("due_at", { ascending: true, nullsFirst: false })
        .limit(20),
      supabase
        .from("projects")
        .select("id, name, why")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(10),
    ])

    const recentPulses = (pulsesResp.data ?? []) as Pick<
      PulseCheck,
      "stress" | "energy" | "time_available" | "context" | "created_at"
    >[]
    const openTasks = (tasksResp.data ?? []) as Pick<
      Task,
      "id" | "title" | "priority" | "energy_required" | "time_estimate_minutes" | "due_at" | "project_id"
    >[]
    const activeProjects = (projectsResp.data ?? []) as Pick<Project, "id" | "name" | "why">[]

    const fullTwin = await loadTwin(user.id)
    const input: Plan7DaysInput = {
      startDate: start,
      locale: profile?.locale ?? "fr",
      recentPulses,
      openTasks,
      activeProjects,
      twin: toTwinSnapshot(fullTwin),
    }

    let output: Plan7DaysOutput
    let fallbackUsed = false

    try {
      const aiCall = askClaudeJSON<unknown>(buildPlan7DaysUserMessage(input), {
        system: PLAN_7_DAYS_SYSTEM,
        tier: "default",
        maxTokens: 2400,
        temperature: 0.5,
      })
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("plan_7days_timeout")), TIMEOUT_MS),
      )
      const result = await Promise.race([aiCall, timeout])
      const validated = ResponseSchema.safeParse(result)
      if (validated.success) {
        output = validated.data as Plan7DaysOutput
      } else {
        console.error("[plan-7days] invalid shape", validated.error.flatten())
        fallbackUsed = true
        output = PLAN_7_DAYS_FALLBACK(input)
      }
    } catch (err) {
      console.error("[plan-7days] AI", err)
      fallbackUsed = true
      output = PLAN_7_DAYS_FALLBACK(input)
    }

    // Upsert via admin (auth context already validated)
    const admin = createAdminClient()
    const upsertResp = await admin
      .from("lifeos_plans")
      .upsert(
        {
          user_id: user.id,
          start_date: start,
          payload: output as unknown as Record<string, unknown>,
          generated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,start_date" },
      )
      .select("id, payload, generated_at")
      .maybeSingle()

    return NextResponse.json({
      ok: true,
      plan: {
        ...upsertResp.data,
        start_date: start,
        user_id: user.id,
      },
      cached: false,
      fallback_used: fallbackUsed,
    })
  } catch (e) {
    console.error("[api/plan-7days POST]", e)
    return NextResponse.json(
      { error: "Génération impossible. Réessaie dans un instant." },
      { status: 500 },
    )
  }
}
