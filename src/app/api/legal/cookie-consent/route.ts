import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { apiLimiter } from "@/lib/upstash"

export const runtime = "nodejs"

const Schema = z.object({
  mesure: z.boolean(),
  marketing: z.boolean(),
})

/**
 * POST /api/legal/cookie-consent — synchronise en base le choix cookies d'un utilisateur
 * connecté (le choix est déjà appliqué côté client via localStorage, cf useCookieConsent).
 * Visiteur anonyme : rien à synchroniser, le localStorage seul fait foi.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ ok: true, synced: false })

    const limited = await apiLimiter.limit(`cookie-consent:${user.id}`)
    if (!limited.success) {
      return NextResponse.json({ error: "Trop de requêtes." }, { status: 429 })
    }

    const body = await req.json().catch(() => null)
    const parsed = Schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
    }

    const { error } = await supabase.from("cookie_consents").upsert(
      {
        user_id: user.id,
        necessaire: true,
        mesure: parsed.data.mesure,
        marketing: parsed.data.marketing,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )

    if (error) {
      console.error("[api/legal/cookie-consent]", error)
      return NextResponse.json({ error: "Enregistrement impossible." }, { status: 500 })
    }

    return NextResponse.json({ ok: true, synced: true })
  } catch (e) {
    console.error("[api/legal/cookie-consent]", e)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
