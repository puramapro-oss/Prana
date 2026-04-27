import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { addDays } from "date-fns"

const REF_COOKIE = "prana_ref"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/today"
  const refQuery = searchParams.get("ref")

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const supabase = await createClient()
  const { error, data } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
  }

  // Read ref cookie (set by /r/[code]) — query param wins if both present.
  const cookieStore = await cookies()
  const refCookie = cookieStore.get(REF_COOKIE)?.value ?? null
  const ref = refQuery ?? refCookie

  const response = NextResponse.redirect(`${origin}${next}`)

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

    // Referral attribution: only on first ever signup, only if ref present and resolves
    // to a different user. We accept either the new short referral_code (8 chars b58)
    // or a raw user UUID for backwards-compat.
    if (ref && profile && !profile.onboarded_at) {
      const lookupCol = /^[0-9a-fA-F-]{36}$/.test(ref) ? "id" : "referral_code"
      const { data: referrer } = await admin
        .from("profiles")
        .select("id")
        .eq(lookupCol, ref)
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

  // Always clear the ref cookie after callback so it never lingers.
  response.cookies.set({
    name: REF_COOKIE,
    value: "",
    maxAge: 0,
    path: "/",
  })

  return response
}
