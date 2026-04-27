import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { BillingCard } from "@/components/settings/billing-card"

export const dynamic = "force-dynamic"

export default async function SettingsBillingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login?next=/settings/billing")

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, stripe_customer_id, trial_ends_at")
    .eq("id", user.id)
    .maybeSingle()

  return (
    <BillingCard
      plan={profile?.plan ?? "free"}
      trialEndsAt={profile?.trial_ends_at ?? null}
      hasCustomer={!!profile?.stripe_customer_id}
    />
  )
}
