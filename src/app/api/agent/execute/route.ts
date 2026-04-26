import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { aiLimiter } from "@/lib/upstash"
import { checkDailyQuota } from "@/lib/quotas"
import { askClaudeJSON } from "@/lib/agent/anthropic"
import {
  EXECUTE_SYSTEM,
  buildExecuteUserMessage,
  EXECUTE_FALLBACK,
  type ExecuteInput,
  type ExecuteOutput,
} from "@/lib/agent/prompts/execute"
import { classifyForSafety } from "@/lib/safety/classifier"
import { logSafetyEvent, escalationHint } from "@/lib/safety/escalation"
import { loadTwin } from "@/lib/agent/twin-loader"
import type { Plan, Profile } from "@/lib/supabase/types"
import type { TwinSnapshot } from "@/lib/agent/prompts/system-prana"

export const runtime = "nodejs"

const Schema = z.object({
  type: z.enum(["message", "email", "post", "plan", "doc", "script"]),
  situation: z.string().min(4).max(2000),
  recipient: z.string().max(160).optional(),
  tone: z.string().max(60).optional(),
})

const ResponseSchema = z.object({
  alternatives: z
    .array(
      z.object({
        title: z.string().min(1).max(80),
        body: z.string().min(1).max(4000),
        tone: z.string().min(1).max(40),
      }),
    )
    .min(1)
    .max(3),
  guidance: z.string().min(1).max(240),
})

const TIMEOUT_MS = 16000

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: "Connecte-toi pour générer un brouillon." },
        { status: 401 },
      )
    }

    const limit = await aiLimiter.limit(user.id)
    if (!limit.success) {
      return NextResponse.json(
        { error: "Trop de générations rapprochées. Réessaie dans 1 minute." },
        { status: 429 },
      )
    }

    const body = await req.json().catch(() => null)
    const parsed = Schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides.", details: parsed.error.flatten() },
        { status: 400 },
      )
    }
    const input = parsed.data

    const profileResp = await supabase
      .from("profiles")
      .select("plan, locale")
      .eq("id", user.id)
      .maybeSingle()
    const profile = profileResp.data as Pick<Profile, "plan" | "locale"> | null
    const userPlan: Plan = profile?.plan ?? "free"
    const locale = profile?.locale ?? "fr"

    if (userPlan === "free") {
      return NextResponse.json(
        {
          error: "La génération Execute fait partie du plan Starter.",
          upgradeRequired: "starter",
        },
        { status: 402 },
      )
    }

    const quota = await checkDailyQuota(user.id, userPlan, "executions")
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: `Tu as utilisé tes ${quota.limit} générations du jour (plan ${userPlan}). Reviens demain ou passe en plan supérieur.`,
          quotaReached: true,
          used: quota.used,
          limit: quota.limit,
        },
        { status: 402 },
      )
    }

    // Safety classifier on the situation text
    let safetyRedirect: string | null = null
    const safety = await classifyForSafety(input.situation)
    if (safety.action === "force_sos") {
      await logSafetyEvent({
        userId: user.id,
        trigger: "classifier_flag",
        result: safety,
        contextText: input.situation,
      })
      safetyRedirect = escalationHint(safety)?.redirect ?? "/sos"
    }

    const fullTwin = await loadTwin(user.id)
    const twin: TwinSnapshot | null = fullTwin.hasProfile
      ? {
          tone: fullTwin.tone,
          length: fullTwin.length,
          formality: fullTwin.formality,
          stressTriggers: fullTwin.stressTriggers,
          rechargeActivities: fullTwin.rechargeActivities,
          efficientHours: fullTwin.efficientHours,
          personalRules: fullTwin.personalRules,
        }
      : null

    const executeInput: ExecuteInput = {
      type: input.type,
      situation: input.situation,
      recipient: input.recipient,
      tone: input.tone,
      locale,
      twin,
    }

    let output: ExecuteOutput
    let fallbackUsed = false

    try {
      const aiCall = askClaudeJSON<unknown>(buildExecuteUserMessage(executeInput), {
        system: EXECUTE_SYSTEM,
        tier: "default",
        maxTokens: 2400,
        temperature: 0.6,
      })
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("execute_timeout")), TIMEOUT_MS),
      )
      const result = await Promise.race([aiCall, timeout])
      const validated = ResponseSchema.safeParse(result)
      if (validated.success) {
        output = validated.data
      } else {
        console.error("[execute] invalid shape", validated.error.flatten())
        fallbackUsed = true
        output = EXECUTE_FALLBACK(executeInput)
      }
    } catch (err) {
      console.error("[execute] AI", err)
      fallbackUsed = true
      output = EXECUTE_FALLBACK(executeInput)
    }

    const admin = createAdminClient()
    const persisted = await admin
      .from("executions")
      .insert({
        user_id: user.id,
        type: input.type,
        context_json: {
          situation: input.situation,
          recipient: input.recipient ?? null,
          tone: input.tone ?? null,
          fallback_used: fallbackUsed,
        },
        draft_text: output.alternatives[0]?.body ?? "",
        draft_alternatives: output as unknown as Record<string, unknown>,
      })
      .select("id, type, created_at")
      .maybeSingle()

    return NextResponse.json({
      ok: true,
      execution: persisted.data ?? null,
      response: output,
      fallback_used: fallbackUsed,
      safetyRedirect,
      quota: { used: quota.used + 1, limit: quota.limit, unlimited: quota.unlimited },
    })
  } catch (e) {
    console.error("[api/agent/execute]", e)
    return NextResponse.json(
      { error: "Génération impossible. Réessaie dans un instant." },
      { status: 500 },
    )
  }
}

const PatchSchema = z.object({
  id: z.string().uuid(),
  approved: z.boolean().optional(),
  used: z.boolean().optional(),
})

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Non connecté." }, { status: 401 })

    const body = await req.json().catch(() => null)
    const parsed = PatchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
    }

    const update: { approved?: boolean; used_at?: string } = {}
    if (parsed.data.approved !== undefined) update.approved = parsed.data.approved
    if (parsed.data.used) update.used_at = new Date().toISOString()

    const { error } = await supabase
      .from("executions")
      .update(update)
      .eq("id", parsed.data.id)
      .eq("user_id", user.id)

    if (error) {
      console.error("[execute PATCH]", error)
      return NextResponse.json({ error: "Mise à jour impossible." }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[api/agent/execute PATCH]", e)
    return NextResponse.json({ error: "Erreur." }, { status: 500 })
  }
}
