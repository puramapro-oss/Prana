import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { apiLimiter } from "@/lib/upstash"

export const runtime = "nodejs"

const Schema = z.object({
  /** "SUPPRIMER" en majuscule pour confirmation explicite */
  confirm: z.literal("SUPPRIMER"),
})

/**
 * POST /api/settings/data/delete — RGPD delete account.
 *
 * Cascades : every prana.* row referencing this user is removed via
 * `on delete cascade` from auth.users → prana.profiles → all child tables.
 *
 * The auth.users delete is performed via service-role admin API.
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

    const limited = await apiLimiter.limit(`delete:${user.id}`)
    if (!limited.success) {
      return NextResponse.json({ error: "Trop de requêtes." }, { status: 429 })
    }

    const body = await req.json().catch(() => null)
    const parsed = Schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Tape SUPPRIMER en majuscule pour confirmer." },
        { status: 400 },
      )
    }

    const admin = createAdminClient()
    const { error } = await admin.auth.admin.deleteUser(user.id)
    if (error) {
      console.error("[api/settings/data/delete] auth.deleteUser", error)
      return NextResponse.json(
        {
          error:
            "Suppression impossible. Écris-nous à matiss.frasne@gmail.com avec ton email de compte, on s'en occupe sous 72h.",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[api/settings/data/delete]", e)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
