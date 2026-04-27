import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { stripe } from "@/lib/stripe/client"
import { PLANS, TRIAL_DAYS } from "@/lib/stripe/plans"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { apiLimiter } from "@/lib/upstash"

const Body = z.object({
  planId: z.enum(["starter", "pro", "ultime"]),
  cycle: z.enum(["monthly", "yearly"]),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Connecte-toi pour passer à l'abonnement." }, { status: 401 })
    }

    const limit = await apiLimiter.limit(`checkout:${user.id}`)
    if (!limit.success) {
      return NextResponse.json(
        { error: "Trop de tentatives. Patiente quelques secondes." },
        { status: 429 },
      )
    }

    const json = await req.json()
    const parsed = Body.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides." }, { status: 400 })
    }
    const { planId, cycle } = parsed.data

    const plan = PLANS.find((p) => p.id === planId)
    const priceId = cycle === "monthly" ? plan?.stripePriceMonthlyId : plan?.stripePriceYearlyId
    if (!priceId) {
      return NextResponse.json(
        {
          error:
            "Les tarifs Stripe ne sont pas encore configurés. Contacte-nous : matiss.frasne@gmail.com.",
        },
        { status: 503 },
      )
    }

    // Get or create Stripe customer
    const admin = createAdminClient()
    const { data: profile } = await admin
      .from("profiles")
      .select("stripe_customer_id, email")
      .eq("id", user.id)
      .maybeSingle()

    let customerId = profile?.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? profile?.email ?? undefined,
        metadata: { user_id: user.id, app: "prana" },
      })
      customerId = customer.id
      await admin.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id)
    }

    const origin =
      req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://prana.purama.dev"

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: TRIAL_DAYS,
        metadata: { user_id: user.id, plan: planId },
      },
      success_url: `${origin}/today?welcome=1`,
      cancel_url: `${origin}/pricing?canceled=1`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const detail = err instanceof Error ? `${err.name}: ${err.message}` : String(err)
    console.error("[stripe/checkout] error:", detail, err)
    return NextResponse.json(
      {
        error: "Une erreur est survenue. Réessaie dans un instant.",
        ...(process.env.VERCEL_ENV !== "production" || process.env.STRIPE_DEBUG === "1"
          ? { detail }
          : {}),
      },
      { status: 500 },
    )
  }
}
