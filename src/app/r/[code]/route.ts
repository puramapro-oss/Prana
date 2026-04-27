import { type NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"

const COOKIE_NAME = "prana_ref"
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 // 30 days, seconds

/**
 * Public referral entry point.
 *
 * GET /r/<code> :
 *  1. Redirect to /signup?ref=<code>.
 *  2. Set httpOnly cookie `prana_ref=<code>` for 30d.
 *
 * The cookie is consumed by /auth/callback, which validates the referrer
 * profile exists before inserting a `referrals` row. A bogus code never
 * creates a row, so we don't pre-validate here.
 *
 * Implementation note : we use the Web standard `Response` (not
 * `NextResponse.redirect()`) because the latter applies its own cache
 * headers and, on Vercel, the Set-Cookie can be dropped at the edge for
 * cached redirect responses. Manual response = full header control.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params
  const safeCode = (code ?? "").slice(0, 16)

  const origin = new URL(req.url).origin

  if (!safeCode || safeCode.length < 4) {
    return new Response(null, {
      status: 307,
      headers: {
        Location: `${origin}/signup`,
        "Cache-Control": "no-store",
      },
    })
  }

  // Best-effort lookup for telemetry (logs only — never gates the cookie).
  try {
    const admin = createAdminClient()
    await admin
      .from("profiles")
      .select("id")
      .eq("referral_code", safeCode)
      .maybeSingle()
  } catch {
    // ignore — cookie set regardless
  }

  const cookieValue = `${COOKIE_NAME}=${encodeURIComponent(safeCode)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${COOKIE_MAX_AGE}`

  return new Response(null, {
    status: 307,
    headers: {
      Location: `${origin}/signup?ref=${encodeURIComponent(safeCode)}`,
      "Cache-Control": "no-store",
      "Set-Cookie": cookieValue,
    },
  })
}
