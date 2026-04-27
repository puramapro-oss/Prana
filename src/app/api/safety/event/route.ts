import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { apiLimiter } from "@/lib/upstash"
import type { SafetySeverity, SafetyTrigger, ProfileMetadata } from "@/lib/supabase/types"

const TRIGGERS: SafetyTrigger[] = [
  "sos_button",
  "classifier_flag",
  "keyword_match",
  "consult_prompt",
  "user_self_report",
]
const SEVERITIES: SafetySeverity[] = ["low", "medium", "high", "critical"]

const Schema = z.object({
  trigger: z.enum(TRIGGERS as [SafetyTrigger, ...SafetyTrigger[]]),
  severity: z.enum(SEVERITIES as [SafetySeverity, ...SafetySeverity[]]).optional(),
  context: z.string().max(500).optional(),
  hotlines_shown: z.array(z.string().max(100)).max(10).optional(),
  pro_referred: z.boolean().optional(),
})

/**
 * POST /api/safety/event — log manual user-initiated safety events.
 *
 * Used by :
 *   - SOSFloatingButton click (`trigger: "sos_button"`)
 *   - User dismisses ProConsultPrompt as "consulted" (`trigger: "consult_prompt"` + `pro_referred: true`)
 *   - User self-reports distress in /sos page (`trigger: "user_self_report"`)
 *
 * Always inserts via admin client (RLS allows owner-read but writes go through service role for guarantee).
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Connecte-toi." }, { status: 401 })
    }

    const limited = await apiLimiter.limit(`safety:${user.id}`)
    if (!limited.success) {
      return NextResponse.json({ ok: true, throttled: true })
    }

    const body = await req.json().catch(() => null)
    const parsed = Schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
    }

    const admin = createAdminClient()
    const { error } = await admin.from("safety_events").insert({
      user_id: user.id,
      trigger: parsed.data.trigger,
      severity: parsed.data.severity ?? null,
      context_text: parsed.data.context ?? null,
      hotlines_shown: parsed.data.hotlines_shown ?? null,
      pro_referred: parsed.data.pro_referred ?? false,
    })

    if (error) {
      console.error("[api/safety/event] insert", error)
      return NextResponse.json({ error: "Impossible d'enregistrer." }, { status: 500 })
    }

    // If trigger is consult_prompt, update profile.metadata.last_pro_consult_prompt_at
    if (parsed.data.trigger === "consult_prompt") {
      const profileResp = await admin
        .from("profiles")
        .select("metadata")
        .eq("id", user.id)
        .maybeSingle()
      const currentMeta = (profileResp.data?.metadata as ProfileMetadata | null) ?? {}
      const nextMeta: ProfileMetadata = {
        ...currentMeta,
        last_pro_consult_prompt_at: new Date().toISOString(),
      }
      await admin
        .from("profiles")
        .update({ metadata: nextMeta as unknown as Record<string, unknown> })
        .eq("id", user.id)
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[api/safety/event]", e)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
