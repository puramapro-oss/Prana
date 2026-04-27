import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { apiLimiter } from "@/lib/upstash"
import type { Plan, Room } from "@/lib/supabase/types"

const Schema = z.object({
  slug: z.string().min(1).max(80),
})

const PLAN_TIER: Record<Plan, number> = { free: 0, starter: 1, pro: 2, ultime: 3 }

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Connecte-toi pour rejoindre une room." }, { status: 401 })
    }

    const limited = await apiLimiter.limit(`rooms-join:${user.id}`)
    if (!limited.success) {
      return NextResponse.json({ error: "Trop de requêtes. Patiente." }, { status: 429 })
    }

    const body = await req.json().catch(() => null)
    const parsed = Schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
    }

    const profileResp = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .maybeSingle()
    const userPlan: Plan = (profileResp.data?.plan as Plan | undefined) ?? "free"

    const roomResp = await supabase
      .from("rooms")
      .select("id, slug, is_premium")
      .eq("slug", parsed.data.slug)
      .maybeSingle()
    const room = roomResp.data as Pick<Room, "id" | "slug" | "is_premium"> | null
    if (!room) {
      return NextResponse.json({ error: "Room introuvable." }, { status: 404 })
    }

    if (room.is_premium && PLAN_TIER[userPlan] < PLAN_TIER.pro) {
      return NextResponse.json(
        {
          error: "Cette room est réservée aux plans Pro et Ultime.",
          upgradeRequired: "pro",
        },
        { status: 402 },
      )
    }

    // Insert membership (unique constraint on (room_id, user_id) → conflict-safe)
    const insertResp = await supabase
      .from("room_memberships")
      .insert({ room_id: room.id, user_id: user.id })
      .select("id")
      .maybeSingle()

    // If conflict (already member), look up existing
    if (insertResp.error || !insertResp.data) {
      const existing = await supabase
        .from("room_memberships")
        .select("id")
        .eq("user_id", user.id)
        .eq("room_id", room.id)
        .maybeSingle()
      if (existing.data) {
        return NextResponse.json({ ok: true, membership_id: (existing.data as { id: string }).id, already: true })
      }
      console.error("[api/rooms/join] insert", insertResp.error)
      return NextResponse.json(
        { error: "Impossible de rejoindre la room. Réessaie." },
        { status: 500 },
      )
    }

    return NextResponse.json({
      ok: true,
      membership_id: (insertResp.data as { id: string }).id,
    })
  } catch (e) {
    console.error("[api/rooms/join]", e)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
