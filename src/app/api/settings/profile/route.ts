import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { apiLimiter } from "@/lib/upstash"

const Schema = z.object({
  display_name: z.string().min(1).max(60).optional(),
  locale: z.enum(["fr", "en"]).optional(),
  timezone: z.string().min(2).max(40).optional(),
})

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Connecte-toi." }, { status: 401 })
    }

    const limited = await apiLimiter.limit(`settings-profile:${user.id}`)
    if (!limited.success) {
      return NextResponse.json({ error: "Trop de requêtes." }, { status: 429 })
    }

    const body = await req.json().catch(() => null)
    const parsed = Schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides.", details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const update: {
      display_name?: string
      locale?: "fr" | "en"
      timezone?: string
    } = {}
    if (parsed.data.display_name !== undefined) update.display_name = parsed.data.display_name
    if (parsed.data.locale !== undefined) update.locale = parsed.data.locale
    if (parsed.data.timezone !== undefined) update.timezone = parsed.data.timezone

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ ok: true, noop: true })
    }

    const { error } = await supabase.from("profiles").update(update).eq("id", user.id)
    if (error) {
      console.error("[api/settings/profile] update", error)
      return NextResponse.json({ error: "Impossible d'enregistrer." }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[api/settings/profile]", e)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
