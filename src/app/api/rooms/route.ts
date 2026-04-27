import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { apiLimiter } from "@/lib/upstash"
import type { Plan } from "@/lib/supabase/types"

const Schema = z.object({
  name: z.string().min(3).max(80),
  description: z.string().max(500).optional(),
  duration_days: z.number().int().min(1).max(60),
  category: z.enum(["focus", "sleep", "mind", "morning", "execute", "reset"]),
  is_premium: z.boolean().optional(),
})

const PLAN_TIER: Record<Plan, number> = { free: 0, starter: 1, pro: 2, ultime: 3 }

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
}

/**
 * POST /api/rooms — create a new room (Pro / Ultime only).
 * Generates a unique slug from the name (with random suffix on collision).
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

    const limited = await apiLimiter.limit(`rooms-create:${user.id}`)
    if (!limited.success) {
      return NextResponse.json({ error: "Trop de requêtes." }, { status: 429 })
    }

    const profileResp = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .maybeSingle()
    const userPlan: Plan = (profileResp.data?.plan as Plan | undefined) ?? "free"
    if (PLAN_TIER[userPlan] < PLAN_TIER.pro) {
      return NextResponse.json(
        { error: "La création de rooms est réservée aux plans Pro et Ultime.", upgradeRequired: "pro" },
        { status: 402 },
      )
    }

    const body = await req.json().catch(() => null)
    const parsed = Schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides." }, { status: 400 })
    }

    const admin = createAdminClient()
    const baseSlug = slugify(parsed.data.name) || "room"
    let candidate = baseSlug
    for (let attempt = 0; attempt < 6; attempt++) {
      const exists = await admin
        .from("rooms")
        .select("id", { count: "exact", head: true })
        .eq("slug", candidate)
        .limit(1)
      if ((exists.count ?? 0) === 0) break
      candidate = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`
    }

    const insertResp = await supabase
      .from("rooms")
      .insert({
        slug: candidate,
        name_fr: parsed.data.name,
        name_en: parsed.data.name,
        description_fr: parsed.data.description ?? null,
        description_en: parsed.data.description ?? null,
        duration_days: parsed.data.duration_days,
        category: parsed.data.category,
        is_official: false,
        is_premium: parsed.data.is_premium ?? false,
        created_by: user.id,
        daily_action_template: [],
      })
      .select("slug")
      .maybeSingle()

    if (insertResp.error || !insertResp.data) {
      console.error("[api/rooms POST] insert", insertResp.error)
      return NextResponse.json(
        { error: "Impossible de créer la room. Réessaie." },
        { status: 500 },
      )
    }

    return NextResponse.json({ ok: true, slug: (insertResp.data as { slug: string }).slug })
  } catch (e) {
    console.error("[api/rooms POST]", e)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
