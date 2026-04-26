import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { addDays } from "date-fns"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/today"
  const ref = searchParams.get("ref")

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const supabase = await createClient()
  const { error, data } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
  }

  // Trial 7j Pro on first login + referral tracking
  if (data?.user) {
    const admin = createAdminClient()
    const userId = data.user.id

    // Look up profile (auto-created by trigger). If trial_ends_at is null → set 7d Pro trial.
    const { data: profile } = await admin
      .from("profiles")
      .select("id, trial_ends_at, plan, onboarded_at")
      .eq("id", userId)
      .maybeSingle()

    if (profile && !profile.trial_ends_at) {
      await admin
        .from("profiles")
        .update({ trial_ends_at: addDays(new Date(), 7).toISOString() })
        .eq("id", userId)
    }

    // Referral attribution (only on first ever signup)
    if (ref && profile && !profile.onboarded_at) {
      const { data: referrer } = await admin
        .from("profiles")
        .select("id")
        .eq("id", ref)
        .maybeSingle()

      if (referrer && referrer.id !== userId) {
        await admin
          .from("referrals")
          .upsert(
            { referrer_id: referrer.id, referee_id: userId, status: "pending" },
            { onConflict: "referrer_id,referee_id" },
          )
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
