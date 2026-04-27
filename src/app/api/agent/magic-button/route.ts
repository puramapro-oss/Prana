import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { magicButtonLimiter } from "@/lib/upstash"
import { checkDailyQuota } from "@/lib/quotas"
import { findMagicButton, isMagicButtonAccessible } from "@/lib/agent/magic-buttons-config"
import { askClaudeJSON } from "@/lib/agent/anthropic"
import { getSystemPrompt } from "@/lib/agent/prompts/system-prana"
import { loadTwin, toTwinSnapshot } from "@/lib/agent/twin-loader"
import { MAGIC_BUTTON_PROMPTS, JSON_OUTPUT_INSTRUCTION, type MagicButtonResponse } from "@/lib/agent/prompts/magic-buttons"
import { classifyForSafety } from "@/lib/safety/classifier"
import { logSafetyEvent, escalationHint } from "@/lib/safety/escalation"
import { grantPoints } from "@/lib/redistribution/points"
import type { Plan, PulseCheck, Profile } from "@/lib/supabase/types"

const Schema = z.object({
  slug: z.string().min(1).max(40),
  /** Optional free-text context the user types in (target task, situation, etc.). */
  user_context: z.string().max(2000).optional(),
})

const ResponseSchema = z.object({
  intro: z.string().min(1),
  protocol_steps: z
    .array(z.object({ label: z.string().min(1), duration_seconds: z.number().int().min(0).max(7200).optional() }))
    .max(12),
  action: z.string().min(1),
  cta: z.string().min(1).max(40),
})

const RESPONSE_TIMEOUT_MS = 9000

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Connecte-toi pour utiliser les boutons magiques." }, { status: 401 })
    }

    const limit = await magicButtonLimiter.limit(user.id)
    if (!limit.success) {
      return NextResponse.json(
        { error: "Tu utilises beaucoup les boutons. Repose-toi 5 minutes." },
        { status: 429 },
      )
    }

    const body = await req.json().catch(() => null)
    const parsed = Schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Requête invalide.", details: parsed.error.flatten() }, { status: 400 })
    }
    const { slug, user_context } = parsed.data

    const button = findMagicButton(slug)
    if (!button) {
      return NextResponse.json({ error: "Bouton inconnu." }, { status: 404 })
    }

    const profileResp = await supabase
      .from("profiles")
      .select("plan, locale")
      .eq("id", user.id)
      .maybeSingle()
    const profile = profileResp.data as Pick<Profile, "plan" | "locale"> | null
    const userPlan: Plan = profile?.plan ?? "free"
    const locale = profile?.locale ?? "fr"

    if (!isMagicButtonAccessible(button, userPlan)) {
      return NextResponse.json(
        {
          error: `Ce bouton fait partie du plan ${button.plan}.`,
          upgradeRequired: button.plan,
        },
        { status: 402 },
      )
    }

    const quota = await checkDailyQuota(user.id, userPlan, "magicButtons")
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: `Tu as utilisé tes ${quota.limit} boutons gratuits du jour. Reviens demain ou passe en plan supérieur.`,
          quotaReached: true,
          used: quota.used,
          limit: quota.limit,
        },
        { status: 402 },
      )
    }

    let safetyRedirect: string | null = null
    if (user_context && user_context.trim().length >= 4) {
      const safety = await classifyForSafety(user_context)
      if (safety.action === "force_sos") {
        await logSafetyEvent({
          userId: user.id,
          trigger: "classifier_flag",
          result: safety,
          contextText: user_context,
        })
        safetyRedirect = escalationHint(safety)?.redirect ?? "/sos"
      }
    }

    const recentPulses = await supabase
      .from("pulse_checks")
      .select("stress, energy, time_available, context, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(7)

    const pulses = (recentPulses.data ?? []) as Pick<
      PulseCheck,
      "stress" | "energy" | "time_available" | "context" | "created_at"
    >[]

    const fullTwin = await loadTwin(user.id)
    const twinSnapshot = toTwinSnapshot(fullTwin)
    const promptDef = MAGIC_BUTTON_PROMPTS[button.slug]
    const system = `${getSystemPrompt({
      locale,
      plan: userPlan,
      twin: twinSnapshot,
      recentPulses: pulses,
      protectiveMode: fullTwin.protectiveMode,
    })}\n\n${promptDef.promptInstructions}\n\n${JSON_OUTPUT_INSTRUCTION}`

    const lastPulse = pulses[0]
    const userMessage = [
      `Bouton activé : ${button.slug} — ${button.name}.`,
      lastPulse
        ? `Pulse actuel : stress ${lastPulse.stress}/10, énergie ${lastPulse.energy}/10, ${lastPulse.time_available}, contexte ${lastPulse.context}.`
        : "Pas de pulse récent.",
      user_context ? `Contexte fourni par l'utilisateur : ${user_context}` : "",
    ]
      .filter(Boolean)
      .join("\n")

    let output: MagicButtonResponse = promptDef.fallback
    let fallbackUsed = false
    try {
      const aiCall = askClaudeJSON<MagicButtonResponse>(userMessage, {
        system,
        tier: "default",
        maxTokens: 768,
        temperature: 0.6,
      })
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("magic_button_timeout")), RESPONSE_TIMEOUT_MS),
      )
      const result = await Promise.race([aiCall, timeout])
      const validated = ResponseSchema.safeParse(result)
      if (validated.success) {
        output = validated.data as MagicButtonResponse
      } else {
        fallbackUsed = true
      }
    } catch (err) {
      console.error("[api/magic-button] ai", err)
      fallbackUsed = true
    }

    // Persist usage. Admin client because we want to log the usage even if RLS hiccups,
    // and user_id is enforced from authenticated session above.
    const admin = createAdminClient()
    await admin.from("magic_button_usages").insert({
      user_id: user.id,
      button_slug: button.slug,
      prompt_input: user_context ? { user_context } : null,
      output: output as unknown as Record<string, unknown>,
      fallback_used: fallbackUsed,
    })

    // Points : +5 only when the IA call succeeded (no fallback). Fail-soft.
    let pointsGranted = 0
    if (!fallbackUsed) {
      try {
        const grant = await grantPoints(user.id, "magic_button", { button_slug: button.slug })
        if (grant.ok) pointsGranted = grant.granted
      } catch (err) {
        console.error("[api/magic-button] points", err)
      }
    }

    return NextResponse.json({
      ok: true,
      button: { slug: button.slug, name: button.name },
      response: output,
      fallback_used: fallbackUsed,
      safetyRedirect,
      quota: { used: quota.used + 1, limit: quota.limit, unlimited: quota.unlimited },
      pointsGranted,
    })
  } catch (e) {
    console.error("[api/magic-button]", e)
    return NextResponse.json({ error: "Une erreur est survenue. Réessaie dans un instant." }, { status: 500 })
  }
}
