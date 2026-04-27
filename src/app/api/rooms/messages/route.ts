import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { apiLimiter } from "@/lib/upstash"
import { classifyForSafety } from "@/lib/safety/classifier"
import { logSafetyEvent, escalationHint } from "@/lib/safety/escalation"
import type { Room, RoomMessage } from "@/lib/supabase/types"

const PostSchema = z.object({
  slug: z.string().min(1).max(80),
  body: z.string().min(2).max(1000),
})

/**
 * GET /api/rooms/messages?slug=… — last 100 messages of the room (membership required via RLS).
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Connecte-toi." }, { status: 401 })
    }

    const url = new URL(req.url)
    const slug = url.searchParams.get("slug")
    if (!slug) {
      return NextResponse.json({ error: "slug requis." }, { status: 400 })
    }

    const roomResp = await supabase
      .from("rooms")
      .select("id")
      .eq("slug", slug)
      .maybeSingle()
    const room = roomResp.data as { id: string } | null
    if (!room) {
      return NextResponse.json({ error: "Room introuvable." }, { status: 404 })
    }

    // RLS already guards : SELECT only allowed if membership exists.
    const messagesResp = await supabase
      .from("room_messages")
      .select("id, room_id, user_id, is_ai_host, body, day_number, created_at")
      .eq("room_id", room.id)
      .order("created_at", { ascending: true })
      .limit(100)

    return NextResponse.json({
      ok: true,
      messages: (messagesResp.data ?? []) as RoomMessage[],
    })
  } catch (e) {
    console.error("[api/rooms/messages GET]", e)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}

/**
 * POST /api/rooms/messages — user posts a message in the room.
 * Safety classifier on body : if force_sos → return safetyRedirect, do NOT post.
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

    const limited = await apiLimiter.limit(`rooms-msg:${user.id}`)
    if (!limited.success) {
      return NextResponse.json({ error: "Trop de messages rapprochés. Pose-toi une minute." }, { status: 429 })
    }

    const body = await req.json().catch(() => null)
    const parsed = PostSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Message invalide (2 à 1000 caractères)." }, { status: 400 })
    }

    const roomResp = await supabase
      .from("rooms")
      .select("id")
      .eq("slug", parsed.data.slug)
      .maybeSingle()
    const room = roomResp.data as Pick<Room, "id"> | null
    if (!room) {
      return NextResponse.json({ error: "Room introuvable." }, { status: 404 })
    }

    // Safety scan
    let safetyRedirect: string | null = null
    const safety = await classifyForSafety(parsed.data.body)
    if (safety.action === "force_sos") {
      await logSafetyEvent({
        userId: user.id,
        trigger: "classifier_flag",
        result: safety,
        contextText: parsed.data.body,
      })
      safetyRedirect = escalationHint(safety)?.redirect ?? "/sos"
      return NextResponse.json({
        ok: false,
        error: "On suspend l'envoi pour t'écouter.",
        safetyRedirect,
      }, { status: 200 })
    }

    // Get membership current_day to tag the message (optional)
    const memResp = await supabase
      .from("room_memberships")
      .select("current_day")
      .eq("user_id", user.id)
      .eq("room_id", room.id)
      .maybeSingle()
    const dayNumber = (memResp.data as { current_day: number } | null)?.current_day ?? null

    const { error } = await supabase.from("room_messages").insert({
      room_id: room.id,
      user_id: user.id,
      is_ai_host: false,
      body: parsed.data.body,
      day_number: dayNumber,
    })

    if (error) {
      console.error("[api/rooms/messages POST] insert", error)
      return NextResponse.json({ error: "Impossible d'envoyer le message." }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[api/rooms/messages POST]", e)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
