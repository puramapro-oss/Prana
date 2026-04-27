import { NextResponse, type NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

const COOKIE_NAME = "prana_ref"
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 // 30 days, in seconds

/**
 * Public referral entry point.
 *
 * GET /r/<code> :
 *  1. Always redirect to /signup?ref=<code> (helps the signup page show a "Bienvenue, untel·le t'invite").
 *  2. Set httpOnly cookie `prana_ref=<code>` for 30d ONLY if the code resolves to a real profile.
 *
 * The cookie is the canonical source consumed by /auth/callback. The callback
 * itself validates the referrer profile exists before inserting a `referrals`
 * row, so passing a bogus code through the query string is harmless.
 *
 * Anonymous-friendly. Never 404s — protects creator anonymity (no probing).
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
  if (found) {
    response.cookies.set({
      name: COOKIE_NAME,
      value: safeCode,
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    })
  }
  return response
}
