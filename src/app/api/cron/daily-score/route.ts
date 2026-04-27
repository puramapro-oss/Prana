import { NextResponse, type NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { computeDailyScore, todayUtcISODate } from "@/lib/score/compute"
import type { Profile } from "@/lib/supabase/types"

export const runtime = "nodejs"
export const maxDuration = 300

/**
 * CRON daily-score — runs 03:00 UTC (vercel.json schedule).
 *
 * For every active user (any pulse OR capture OR task in last 7 days),
 * upsert their daily_scores row for J-1 (yesterday UTC).
 *
 * Why J-1 : at 03:00 UTC the calendar day already rolled over but late
 * activity (e.g. journaling at midnight UTC) still counts in J-1.
 *
 * Auth : `Authorization: Bearer ${CRON_SECRET}` (Vercel cron).
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

  // J-1 UTC
  const yesterday = new Date()
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)
  const targetDate = todayUtcISODate(yesterday)

  // Users active in last 7 days (any pulse) — bounded 2000/run.
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7)

  const recentPulses = await admin
    .from("pulse_checks")
    .select("user_id")
    .gte("created_at", sevenDaysAgo.toISOString())
    .limit(5000)

  const userIds = new Set<string>()
  for (const r of (recentPulses.data ?? []) as Pick<Profile, "id">[] | { user_id: string }[]) {
    const id = (r as { user_id?: string; id?: string }).user_id ?? (r as { id?: string }).id
    if (id) userIds.add(id)
  }

  if (userIds.size === 0) {
    return NextResponse.json({
      ok: true,
      target_date: targetDate,
      eligible: 0,
      processed: 0,
      duration_ms: Date.now() - startedAt,
    })
  }

  let processed = 0
  let failed = 0
  const ids = Array.from(userIds).slice(0, 2000)
  for (const userId of ids) {
    try {
      const row = await computeDailyScore({ userId, date: targetDate })
      if (row) processed++
      else failed++
    } catch (err) {
      console.error("[cron daily-score]", userId, err)
      failed++
    }
  }

  return NextResponse.json({
    ok: true,
    target_date: targetDate,
    eligible: userIds.size,
    processed,
    failed,
    duration_ms: Date.now() - startedAt,
  })
}
