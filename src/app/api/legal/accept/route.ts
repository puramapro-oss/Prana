import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { apiLimiter } from "@/lib/upstash"
import { CURRENT_LEGAL_VERSIONS } from "@/lib/legal/versions"
import { getRequestMeta } from "@/lib/legal/request-meta"

export const runtime = "nodejs"

const Schema = z.object({
  docType: z.enum(["mentions", "cgu", "cgv", "confidentialite"]),
})

/**
 * POST /api/legal/accept — preuve d'acceptation horodatée d'un document légal.
 * Client SSR normal (RLS `legal_acceptances_insert_own`, cf supabase/migrations/0009_legal_core.sql)
 * — pas de client admin, cette écriture est déjà scopée à l'utilisateur authentifié.
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

    const limited = await apiLimiter.limit(`legal-accept:${user.id}`)
    if (!limited.success) {
      return NextResponse.json({ error: "Trop de requêtes." }, { status: 429 })
    }

    const body = await req.json().catch(() => null)
    const parsed = Schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
    }

    const { ip, userAgent } = getRequestMeta(req)
    const { error } = await supabase.from("legal_acceptances").upsert(
      {
        user_id: user.id,
        doc_type: parsed.data.docType,
        version: CURRENT_LEGAL_VERSIONS[parsed.data.docType],
        ip,
        user_agent: userAgent,
      },
      { onConflict: "user_id,doc_type" },
    )

    if (error) {
      console.error("[api/legal/accept]", error)
      return NextResponse.json({ error: "Enregistrement impossible." }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[api/legal/accept]", e)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
