import { NextResponse, type NextRequest } from "next/server"
import { stripe } from "@/lib/stripe/client"
import { createClient } from "@/lib/supabase/server"
import { apiLimiter } from "@/lib/upstash"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Connecte-toi d'abord." }, { status: 401 })
    }

    const limit = await apiLimiter.limit(`portal:${user.id}`)
    if (!limit.success) {
      return NextResponse.json(
        { error: "Trop de tentatives. Patiente quelques secondes." },
        { status: 429 },
      )
    }

    const { data: profileRaw } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle()
    const profile = profileRaw as { stripe_customer_id: string | null } | null

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: "Aucun abonnement à gérer pour l'instant." },
        { status: 404 },
      )
    }

    const origin =
      req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://prana.purama.dev"

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${origin}/settings/billing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const detail = err instanceof Error ? `${err.name}: ${err.message}` : String(err)
    console.error("[stripe/portal] error:", detail, err)
    return NextResponse.json(
      {
        error: "Impossible d'ouvrir le portail. Réessaie dans un instant.",
        ...(process.env.STRIPE_DEBUG === "1" ? { detail } : {}),
      },
      { status: 500 },
    )
  }
}
