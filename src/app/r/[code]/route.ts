import { type NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"

const COOKIE_NAME = "prana_ref"
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 // 30 days, seconds

/**
 * Public referral entry point.
 *
 * GET /r/<code> :
 *   - Set httpOnly cookie `prana_ref=<code>` for 30d.
 *   - Return a 200 HTML interstitial that JS-redirects to /signup?ref=<code>.
 *
 * Why an HTML interstitial and not a 30x redirect : on Vercel, Set-Cookie
 * sometimes gets stripped from cached redirect responses. A 200 with explicit
 * `Cache-Control: no-store` is the only reliable way to plant the cookie on
 * the very first hop.
 *
 * The cookie is consumed by /auth/callback, which validates the referrer
 * profile exists before inserting a `referrals` row. A bogus code never
 * creates a row, so we don't pre-validate here.
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

  // Best-effort lookup for telemetry only (never gates the cookie).
  try {
    const admin = createAdminClient()
    await admin
      .from("profiles")
      .select("id")
      .eq("referral_code", safeCode)
      .maybeSingle()
  } catch {
    // ignore
  }

  const target = `${origin}/signup?ref=${encodeURIComponent(safeCode)}`
  const cookie = `${COOKIE_NAME}=${encodeURIComponent(safeCode)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${COOKIE_MAX_AGE}`

  // Minimal HTML : meta refresh as fallback for no-JS, JS replace() preserves history.
  const safeTargetHtml = target.replace(/&/g, "&amp;").replace(/"/g, "&quot;")
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=${safeTargetHtml}"><meta name="robots" content="noindex"><title>Bienvenue sur PURAMA ONE</title></head><body><script>window.location.replace(${JSON.stringify(target)})</script><p style="font-family:system-ui;padding:24px">Redirection en cours… <a href="${safeTargetHtml}">Continuer</a></p></body></html>`

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Set-Cookie": cookie,
    },
  })
}
