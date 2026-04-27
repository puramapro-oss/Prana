import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { apiLimiter } from "@/lib/upstash"

const Schema = z.object({
  slug: z.string().min(1).max(80),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Connecte-toi." }, { status: 401 })
    }

    const limited = await apiLimiter.limit(`rooms-leave:${user.id}`)
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
      .select("id")
      .eq("slug", parsed.data.slug)
      .maybeSingle()
    const room = roomResp.data as { id: string } | null
    if (!room) {
      return NextResponse.json({ error: "Room introuvable." }, { status: 404 })
    }

    const { error } = await supabase
      .from("room_memberships")
      .delete()
      .eq("user_id", user.id)
      .eq("room_id", room.id)

    if (error) {
      console.error("[api/rooms/leave] delete", error)
      return NextResponse.json({ error: "Impossible de quitter la room." }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[api/rooms/leave]", e)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
