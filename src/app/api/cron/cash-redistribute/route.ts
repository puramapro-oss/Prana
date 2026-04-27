import { NextResponse, type NextRequest } from "next/server"

export const runtime = "nodejs"

/**
 * CRON cash-redistribute — Phase 1 = STUB (no-op).
 *
 * Phase 2 (post-Treezor activation) will :
 *  1. Pull Stripe net (CA - frais) for the period
 *  2. Split : 50% users (cash via Treezor SEPA instant) + 10% Asso PURAMA
 *     + 10% ADYA + 30% SASU
 *  3. For each active user, convert their points into cash_eur_centimes
 *     using formula in `/lib/redistribution/formula.ts`
 *  4. Trigger Treezor SEPA payouts.
 *
 * For now, this endpoint exists to keep `vercel.json` honest when the schedule
 * is added. Returns 200 with `phase: 1` and logs nothing destructive.
 *
 * NOT scheduled in vercel.json yet — wired up post-Treezor approval.
 *
 * Auth : `Authorization: Bearer ${CRON_SECRET}`.
 */
export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET
  if (expected) {
    const auth = req.headers.get("authorization") ?? ""
    if (auth !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  } else if (!req.headers.get("x-vercel-cron")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return NextResponse.json({
    ok: true,
    phase: 1,
    message: "Treezor pending — Phase 1 keeps points only. No cash payout executed.",
    timestamp: new Date().toISOString(),
  })
}
