import { NextResponse, type NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

const COOKIE_NAME = "prana_ref"
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 // 30 days, in seconds

/**
 * Public referral entry point.
 *
 * GET /r/<code> :
 *  1. Lookup the profile owning this referral_code (via admin client).
 *  2. If found → set httpOnly cookie `prana_ref=<code>` for 30d, redirect /signup?ref=<code>.
 *  3. If not found → 302 /signup (no cookie set, no error).
 *
 * Anonymous-friendly. Never reveals whether the code exists or not (no 404).
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params
  const safeCode = (code ?? "").slice(0, 16)

  // Build the absolute redirect URL based on the request origin (so it works on
  // both prana.purama.dev and ephemeral *.vercel.app preview hosts).
  const origin = new URL(req.url).origin
  const signupUrl = new URL("/signup", origin)

  if (!safeCode || safeCode.length < 4) {
    return NextResponse.redirect(signupUrl)
  }

  // Lookup via admin (bypasses RLS — we expose only existence, no profile data).
  const admin = createAdminClient()
  const profileResp = await admin
    .from("profiles")
    .select("id")
    .eq("referral_code", safeCode)
    .maybeSingle()
  const found = !!profileResp.data

  if (found) {
    signupUrl.searchParams.set("ref", safeCode)
  }

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
