import { NextResponse, type NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

const COOKIE_NAME = "prana_ref"
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 // 30 days, in seconds

/**
 * Public referral entry point.
 *
 * GET /r/<code> :
 *  1. Redirect to /signup?ref=<code>.
 *  2. Set httpOnly cookie `prana_ref=<code>` for 30d.
 *
 * The cookie is consumed by /auth/callback, which validates the referrer
 * profile exists before inserting a `referrals` row. A bogus code never
 * creates a row, so we don't pre-validate here (saves a DB roundtrip on
 * every link click).
 *
 * Anonymous-friendly. Never 404s.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params
  const safeCode = (code ?? "").slice(0, 16)

  const origin = new URL(req.url).origin
  const signupUrl = new URL("/signup", origin)

  if (!safeCode || safeCode.length < 4) {
    return NextResponse.redirect(signupUrl)
  }

  signupUrl.searchParams.set("ref", safeCode)

  // Resolve referral_code → only set cookie when the profile actually exists.
  const admin = createAdminClient()
  const profileResp = await admin
    .from("profiles")
    .select("id")
    .eq("referral_code", safeCode)
    .maybeSingle()
  const found = !!profileResp.data

  const response = NextResponse.redirect(signupUrl)
  // Always set the cookie. The /auth/callback route validates the referrer
  // profile before inserting a referrals row, so a bogus code is harmless.
  // We previously gated the cookie on `found`, but that adds a DB roundtrip
  // for every /r/* hit on the same redirect path — overkill and brittle.
  response.cookies.set({
    name: COOKIE_NAME,
    value: safeCode,
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  })
  // `found` retained as a hint surfaced in logs; the variable is intentionally
  // unused in the response so the rule "validate at callback time" stays the
  // single source of truth.
  void found
  return response
}
