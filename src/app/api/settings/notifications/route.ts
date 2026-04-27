import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { apiLimiter } from "@/lib/upstash"
import type { ProfileMetadata } from "@/lib/supabase/types"

const Schema = z.object({
  push_enabled: z.boolean().optional(),
  email_enabled: z.boolean().optional(),
  sms_enabled: z.boolean().optional(),
  daily_reminder_hour: z.number().int().min(0).max(23).nullable().optional(),
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

    const limited = await apiLimiter.limit(`settings-notif:${user.id}`)
    if (!limited.success) {
      return NextResponse.json({ error: "Trop de requêtes." }, { status: 429 })
    }

    const body = await req.json().catch(() => null)
    const parsed = Schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides." }, { status: 400 })
    }

    const admin = createAdminClient()
    const profileResp = await admin
      .from("profiles")
      .select("metadata")
      .eq("id", user.id)
      .maybeSingle()
    const current = (profileResp.data?.metadata as ProfileMetadata | null) ?? {}
    const currentPrefs = current.notif_prefs ?? {}

    const nextPrefs = { ...currentPrefs, ...parsed.data }
    const next: ProfileMetadata = { ...current, notif_prefs: nextPrefs }

    const { error } = await admin
      .from("profiles")
      .update({ metadata: next as unknown as Record<string, unknown> })
      .eq("id", user.id)

    if (error) {
      console.error("[api/settings/notifications] update", error)
      return NextResponse.json({ error: "Impossible d'enregistrer." }, { status: 500 })
    }
    return NextResponse.json({ ok: true, prefs: nextPrefs })
  } catch (e) {
    console.error("[api/settings/notifications]", e)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
