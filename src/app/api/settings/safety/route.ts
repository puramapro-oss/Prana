import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { apiLimiter } from "@/lib/upstash"
import type { ProfileMetadata } from "@/lib/supabase/types"

const Schema = z.object({
  safety_country: z.enum(["FR", "US", "INTL"]).optional(),
  emergency_contact: z
    .object({
      name: z.string().min(1).max(80),
      phone: z.string().min(3).max(40),
      relationship: z.string().max(40).optional().nullable(),
    })
    .nullable()
    .optional(),
})

/**
 * PATCH /api/settings/safety — update profile.metadata.safety_country + emergency_contact.
 */
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Connecte-toi." }, { status: 401 })
    }

    const limited = await apiLimiter.limit(`settings-safety:${user.id}`)
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

    const next: ProfileMetadata = { ...current }
    if (parsed.data.safety_country !== undefined) next.safety_country = parsed.data.safety_country
    if (parsed.data.emergency_contact !== undefined) next.emergency_contact = parsed.data.emergency_contact

    const { error } = await admin
      .from("profiles")
      .update({ metadata: next as unknown as Record<string, unknown> })
      .eq("id", user.id)

    if (error) {
      console.error("[api/settings/safety] update", error)
      return NextResponse.json({ error: "Impossible d'enregistrer." }, { status: 500 })
    }
    return NextResponse.json({ ok: true, metadata: next })
  } catch (e) {
    console.error("[api/settings/safety]", e)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
