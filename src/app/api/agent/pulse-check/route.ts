import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { pulseLimiter } from "@/lib/upstash"
import { classifyForSafety } from "@/lib/safety/classifier"
import { logSafetyEvent, escalationHint } from "@/lib/safety/escalation"

const TIME_VALUES = ["20s", "2min", "10min", "1h"] as const
const CONTEXT_VALUES = ["home", "work", "outside", "transit", "bed", "other"] as const

const Schema = z.object({
  stress: z.number().int().min(0).max(10),
  energy: z.number().int().min(0).max(10),
  time_available: z.enum(TIME_VALUES),
  context: z.enum(CONTEXT_VALUES),
  mood_tags: z.array(z.string().min(1).max(40)).max(8).optional(),
  notes: z.string().max(2000).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Connecte-toi pour enregistrer ton Pulse Check." }, { status: 401 })
    }

    const limited = await pulseLimiter.limit(user.id)
    if (!limited.success) {
      return NextResponse.json(
        { error: "Tu enregistres trop vite. Repose-toi 1 minute, puis recommence." },
        { status: 429 },
      )
    }

    const body = await req.json().catch(() => null)
    const parsed = Schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données du Pulse Check invalides.", details: parsed.error.flatten() },
        { status: 400 },
      )
    }
    const input = parsed.data

    let safetyRedirect: string | null = null
    if (input.notes && input.notes.trim().length >= 4) {
      const result = await classifyForSafety(input.notes)
      if (result.action === "force_sos") {
        await logSafetyEvent({
          userId: user.id,
          trigger: "classifier_flag",
          result,
          contextText: input.notes,
        })
        safetyRedirect = escalationHint(result)?.redirect ?? "/sos"
      }
    }

    const { data, error } = await supabase
      .from("pulse_checks")
      .insert({
        user_id: user.id,
        stress: input.stress,
        energy: input.energy,
        time_available: input.time_available,
        context: input.context,
        mood_tags: input.mood_tags ?? [],
        notes: input.notes ?? null,
      })
      .select("id, stress, energy, time_available, context, mood_tags, notes, created_at")
      .single()

    if (error || !data) {
      console.error("[api/pulse-check] insert", error)
      return NextResponse.json(
        { error: "Impossible d'enregistrer ton Pulse Check. Réessaie dans un instant." },
        { status: 500 },
      )
    }

    return NextResponse.json({ ok: true, pulse: data, safetyRedirect })
  } catch (e) {
    console.error("[api/pulse-check]", e)
    return NextResponse.json(
      { error: "Une erreur est survenue. Réessaie dans un instant." },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Connecte-toi." }, { status: 401 })
    }
    const { data, error } = await supabase
      .from("pulse_checks")
      .select("id, stress, energy, time_available, context, mood_tags, notes, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(7)

    if (error) {
      console.error("[api/pulse-check] select", error)
      return NextResponse.json({ error: "Impossible de charger l'historique." }, { status: 500 })
    }
    const items = data ?? []
    return NextResponse.json({ ok: true, last: items[0] ?? null, recent: items })
  } catch (e) {
    console.error("[api/pulse-check] GET", e)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
