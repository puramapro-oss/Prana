import { NextResponse, type NextRequest } from "next/server"
import type Stripe from "stripe"
import { stripe } from "@/lib/stripe/client"
import { createAdminClient } from "@/lib/supabase/admin"
import { grantPoints } from "@/lib/redistribution/points"
import { addDays } from "date-fns"
import type { Referral } from "@/lib/supabase/types"

export const runtime = "nodejs"

type SubLike = Stripe.Subscription & {
  current_period_end?: number | null
}

function planFromPriceId(priceId: string | undefined | null): "starter" | "pro" | "ultime" | null {
  if (!priceId) return null
  // Resolved at runtime by matching against env-configured price IDs.
  // For now we return null and rely on subscription metadata.
  return null
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature")
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !secret) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 })
  }

  const rawBody = await req.text()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret)
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 })
  }

  const admin = createAdminClient()

  // Idempotency
  const { data: alreadyProcessed } = await admin
    .from("stripe_events")
    .select("id")
    .eq("id", event.id)
    .maybeSingle()
  if (alreadyProcessed) return NextResponse.json({ received: true, replay: true })

  await admin.from("stripe_events").insert({ id: event.id, type: event.type, payload: event as unknown as object })

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = (session.subscription as unknown as Stripe.Subscription | null)
          ? null
          : ((session.metadata?.user_id as string | undefined) ?? null)
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id
        if (customerId) {
          if (userId) {
            await admin.from("profiles").update({ stripe_customer_id: customerId }).eq("id", userId)
          }
        }
        break
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as SubLike
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id
        const planFromMeta = (sub.metadata?.plan as string | undefined) ?? null
        const priceId = sub.items.data[0]?.price.id
        const plan = planFromMeta ?? planFromPriceId(priceId) ?? "starter"
        const trialEndsAt = sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null

        await admin
          .from("profiles")
          .update({
            stripe_subscription_id: sub.id,
            plan,
            trial_ends_at: trialEndsAt,
          })
          .eq("stripe_customer_id", customerId)

        // Referral conversion: only on subscription.created (not updated), and only
        // if the active subscription actually means the user is paying (status active/trialing).
        // We look up the user_id from customerId, then find a pending referral for this referee.
        if (event.type === "customer.subscription.created" && (sub.status === "active" || sub.status === "trialing")) {
          const { data: profile } = await admin
            .from("profiles")
            .select("id, trial_ends_at")
            .eq("stripe_customer_id", customerId)
            .maybeSingle()
          const refereeProfile = profile as { id: string; trial_ends_at: string | null } | null
          if (refereeProfile) {
            const { data: pending } = await admin
              .from("referrals")
              .select("id, referrer_id, referee_id, status")
              .eq("referee_id", refereeProfile.id)
              .eq("status", "pending")
              .maybeSingle()
            const pendingRow = pending as Pick<Referral, "id" | "referrer_id" | "referee_id" | "status"> | null
            if (pendingRow) {
              const grant = await grantPoints(pendingRow.referrer_id, "referral_converted", {
                referee_id: pendingRow.referee_id,
                subscription_id: sub.id,
              })
              const extendedTrial = addDays(new Date(), 30).toISOString()
              await admin
                .from("profiles")
                .update({ trial_ends_at: extendedTrial })
                .eq("id", refereeProfile.id)
              await admin
                .from("referrals")
                .update({
                  status: "converted",
                  reward_points: grant.granted,
                })
                .eq("id", pendingRow.id)
            }
          }
        }
        break
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as SubLike
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id
        await admin
          .from("profiles")
          .update({
            plan: "free",
            stripe_subscription_id: null,
            trial_ends_at: null,
          })
          .eq("stripe_customer_id", customerId)
        break
      }
      default:
        // No-op for other events; logged in stripe_events for audit
        break
    }
  } catch {
    return NextResponse.json({ error: "handler error" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
