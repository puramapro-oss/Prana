import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { apiLimiter } from "@/lib/upstash"
import { grantPoints, hasGrantedToday } from "@/lib/redistribution/points"
import type { Room, RoomMembership } from "@/lib/supabase/types"

const Schema = z.object({
  slug: z.string().min(1).max(80),
})

/**
 * POST /api/rooms/tick — user marks today's room action as done.
 *
 * Effects :
 *   1. Verify user is member of this room and not yet completed
 *   2. Block double-tick today (room_day grant exists in last 24h UTC)
 *   3. Grant +20 pts (room_day) on first tick of the day
 *   4. If current_day == duration_days → mark completed=true + grant +200 (room_done)
 *   5. Else increment current_day by 1
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

    const limited = await apiLimiter.limit(`rooms-tick:${user.id}`)
    if (!limited.success) {
      return NextResponse.json({ error: "Trop de requêtes." }, { status: 429 })
    }

    const body = await req.json().catch(() => null)
    const parsed = Schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
    }

    const roomResp = await supabase
      .from("rooms")
      .select("id, duration_days")
      .eq("slug", parsed.data.slug)
      .maybeSingle()
    const room = roomResp.data as Pick<Room, "id" | "duration_days"> | null
    if (!room) {
      return NextResponse.json({ error: "Room introuvable." }, { status: 404 })
    }

    const memResp = await supabase
      .from("room_memberships")
      .select("id, current_day, completed")
      .eq("user_id", user.id)
      .eq("room_id", room.id)
      .maybeSingle()
    const membership = memResp.data as Pick<
      RoomMembership,
      "id" | "current_day" | "completed"
    > | null
    if (!membership) {
      return NextResponse.json({ error: "Tu n'es pas membre de cette room." }, { status: 404 })
    }
    if (membership.completed) {
      return NextResponse.json({ error: "La room est déjà terminée." }, { status: 409 })
    }

    const already = await hasGrantedToday(user.id, "room_day")
    if (already) {
      return NextResponse.json({ error: "Tu as déjà validé une action de room aujourd'hui." }, { status: 409 })
    }

    const dayGrant = await grantPoints(user.id, "room_day", {
      slug: parsed.data.slug,
      day: membership.current_day,
    })
    let pointsGranted = dayGrant.granted
    let completed = false
    let nextDay = membership.current_day

    if (membership.current_day >= room.duration_days) {
      // Final tick → complete + bonus
      const finalGrant = await grantPoints(user.id, "room_done", { slug: parsed.data.slug })
      pointsGranted += finalGrant.granted
      completed = true
      const upd = await supabase
        .from("room_memberships")
        .update({ completed: true })
        .eq("id", membership.id)
      if (upd.error) console.error("[api/rooms/tick] complete update", upd.error)
    } else {
      nextDay = membership.current_day + 1
      const upd = await supabase
        .from("room_memberships")
        .update({ current_day: nextDay })
        .eq("id", membership.id)
      if (upd.error) console.error("[api/rooms/tick] day update", upd.error)
    }

    return NextResponse.json({
      ok: true,
      pointsGranted,
      current_day: nextDay,
      completed,
    })
  } catch (e) {
    console.error("[api/rooms/tick]", e)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
