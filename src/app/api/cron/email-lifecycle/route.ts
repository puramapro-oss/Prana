import { NextResponse, type NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendLifecycleEmail } from "@/lib/email/sender"
import { SEQUENCE_TEMPLATES } from "@/lib/email/templates"

export const runtime = "nodejs"
export const maxDuration = 300

/**
 * CRON email-lifecycle — runs 09:00 UTC (vercel.json).
 *
 * For each user signed up exactly N days ago (UTC), send the matching
 * lifecycle email if not already sent. Bounded 1000 users / template / run.
 *
 * Auth : Bearer CRON_SECRET (matches other prana crons).
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

  const startedAt = Date.now()
  const admin = createAdminClient()

  const summary: Record<string, { eligible: number; sent: number; skipped: number; failed: number }> = {}

  for (const { template, ageDays } of SEQUENCE_TEMPLATES) {
    const since = new Date()
    since.setUTCDate(since.getUTCDate() - ageDays)
    since.setUTCHours(0, 0, 0, 0)
    const until = new Date(since)
    until.setUTCDate(until.getUTCDate() + 1)

    const { data, error } = await admin
      .from("profiles")
      .select("id")
      .gte("created_at", since.toISOString())
      .lt("created_at", until.toISOString())
      .limit(1000)

    if (error) {
      summary[template] = { eligible: 0, sent: 0, skipped: 0, failed: 1 }
      continue
    }

    const counters = { eligible: data?.length ?? 0, sent: 0, skipped: 0, failed: 0 }
    for (const row of data ?? []) {
      const result = await sendLifecycleEmail({ userId: row.id, template })
      if (result.skipped) counters.skipped += 1
      else if (result.ok) counters.sent += 1
      else counters.failed += 1
    }
    summary[template] = counters
  }

  return NextResponse.json({
    ok: true,
    duration_ms: Date.now() - startedAt,
    summary,
  })
}
