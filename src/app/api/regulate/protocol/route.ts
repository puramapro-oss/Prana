import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { apiLimiter } from "@/lib/upstash"
import { findProtocol } from "@/lib/regulate/protocols"
import { checkDailyQuota } from "@/lib/quotas"
import { grantPoints } from "@/lib/redistribution/points"
import type { Plan } from "@/lib/supabase/types"

const StartSchema = z.object({
  action: z.literal("start"),
  protocol_slug: z.string().min(1).max(60),
  pulse_before_id: z.string().uuid().nullable().optional(),
})

const CompleteSchema = z.object({
  action: z.literal("complete"),
  session_id: z.string().uuid(),
  pulse_after_id: z.string().uuid().nullable().optional(),
  duration_seconds_actual: z.number().int().min(0).max(60 * 60),
})

const Schema = z.discriminatedUnion("action", [StartSchema, CompleteSchema])

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Connecte-toi pour utiliser un protocole." }, { status: 401 })
    }

    const limit = await apiLimiter.limit(`protocol:${user.id}`)
    if (!limit.success) {
      return NextResponse.json({ error: "Trop de requêtes. Patiente une minute." }, { status: 429 })
    }

    const body = await req.json().catch(() => null)
    const parsed = Schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Requête invalide.", details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    if (parsed.data.action === "start") {
      const protocol = findProtocol(parsed.data.protocol_slug)
      if (!protocol) {
        return NextResponse.json({ error: "Protocole inconnu." }, { status: 404 })
      }

      const profileResp = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .maybeSingle()
      const profile = profileResp.data as { plan: Plan } | null
      const userPlan: Plan = profile?.plan ?? "free"

      const PLAN_TIER: Record<Plan, number> = { free: 0, starter: 1, pro: 2, ultime: 3 }
      if (PLAN_TIER[userPlan] < PLAN_TIER[protocol.base_plan]) {
        return NextResponse.json(
          {
            error: `Ce protocole fait partie du plan ${protocol.base_plan}.`,
            upgradeRequired: protocol.base_plan,
          },
          { status: 402 },
        )
      }

      const quota = await checkDailyQuota(user.id, userPlan, "protocols")
      if (!quota.allowed) {
        return NextResponse.json(
          {
            error: `Tu as terminé ton protocole quotidien gratuit. Reviens demain ou passe en plan supérieur.`,
            quotaReached: true,
            used: quota.used,
            limit: quota.limit,
          },
          { status: 402 },
        )
      }

      // Resolve protocol_id by slug. We'd prefer to store protocol_slug in sessions, but
      // schema references `protocol_id` so we look it up. Admin client (untyped) — protocol
      // table is read-only / public.
      const admin = createAdminClient()
      const protoResp = await admin
        .from("regulation_protocols")
        .select("id")
        .eq("slug", protocol.slug)
        .maybeSingle()
      const protoRow = protoResp.data as { id: string } | null
      if (!protoRow) {
        return NextResponse.json(
          { error: "Le protocole n'est pas encore actif côté serveur. Reviens dans un instant." },
          { status: 503 },
        )
      }

      const session = await supabase
        .from("regulation_sessions")
        .insert({
          user_id: user.id,
          protocol_id: protoRow.id,
          pulse_before_id: parsed.data.pulse_before_id ?? null,
          completed: false,
        })
        .select("id")
        .single()
      if (session.error || !session.data) {
        console.error("[api/regulate] start", session.error)
        return NextResponse.json(
          { error: "Impossible de démarrer le protocole. Réessaie." },
          { status: 500 },
        )
      }
      return NextResponse.json({ ok: true, session_id: (session.data as { id: string }).id })
    }

    // complete
    const { error } = await supabase
      .from("regulation_sessions")
      .update({
        pulse_after_id: parsed.data.pulse_after_id ?? null,
        completed: true,
        duration_seconds_actual: parsed.data.duration_seconds_actual,
      })
      .eq("id", parsed.data.session_id)
      .eq("user_id", user.id)

    if (error) {
      console.error("[api/regulate] complete", error)
      return NextResponse.json(
        { error: "Impossible de terminer le protocole." },
        { status: 500 },
      )
    }

    let pointsGranted = 0
    try {
      const grant = await grantPoints(user.id, "protocol_done", {
        session_id: parsed.data.session_id,
      })
      if (grant.ok) pointsGranted = grant.granted
    } catch (err) {
      console.error("[api/regulate] points", err)
    }

    return NextResponse.json({ ok: true, pointsGranted })
  } catch (e) {
    console.error("[api/regulate]", e)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
