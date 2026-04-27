/**
 * PURAMA ONE — Daily Score compute.
 *
 * Server-only. Aggregates pulse_checks + regulation_sessions + tasks for a single
 * UTC day and upserts into prana.daily_scores.
 *
 * The computation is intentionally simple : Pulse averages drive stress/energy.
 * sleep_quality stays NULL until the user reports it (no inference).
 * focus_minutes = sum of completed protocol durations on the day (proxy until P5+).
 * one_action_done = at least one task completed today.
 * micro_actions_done = count of today's regulation_sessions completed (=protocols_done).
 * streak_days = consecutive days with daily_score row where one_action_done OR protocols_done>0.
 */

import { createAdminClient } from "@/lib/supabase/admin"
import type { DailyScore } from "@/lib/supabase/types"

interface ComputeInput {
  userId: string
  /** YYYY-MM-DD UTC. Defaults to today UTC. */
  date?: string
}

export function todayUtcISODate(now: Date = new Date()): string {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    .toISOString()
    .slice(0, 10)
}

function utcDayBounds(yyyymmdd: string): { startIso: string; endIso: string } {
  const [y, m, d] = yyyymmdd.split("-").map((s) => Number(s))
  const start = new Date(Date.UTC(y, m - 1, d))
  const end = new Date(Date.UTC(y, m - 1, d + 1))
  return { startIso: start.toISOString(), endIso: end.toISOString() }
}

interface PulseRow {
  stress: number
  energy: number
}
interface ProtocolDurationRow {
  duration_seconds_actual: number | null
  completed: boolean
}
interface TaskCompletedRow {
  id: string
}

/**
 * Compute & upsert one daily_scores row. Idempotent.
 * Returns the upserted row.
 */
export async function computeDailyScore(input: ComputeInput): Promise<DailyScore | null> {
  const date = input.date ?? todayUtcISODate()
  const { startIso, endIso } = utcDayBounds(date)
  const admin = createAdminClient()

  // 1) Pulse averages
  const pulsesResp = await admin
    .from("pulse_checks")
    .select("stress, energy")
    .eq("user_id", input.userId)
    .gte("created_at", startIso)
    .lt("created_at", endIso)

  const pulses = (pulsesResp.data ?? []) as PulseRow[]
  const stressAvg = pulses.length
    ? Number((pulses.reduce((acc, p) => acc + p.stress, 0) / pulses.length).toFixed(2))
    : null
  const energyAvg = pulses.length
    ? Number((pulses.reduce((acc, p) => acc + p.energy, 0) / pulses.length).toFixed(2))
    : null

  // 2) Protocols done + focus minutes
  const sessionsResp = await admin
    .from("regulation_sessions")
    .select("duration_seconds_actual, completed")
    .eq("user_id", input.userId)
    .eq("completed", true)
    .gte("created_at", startIso)
    .lt("created_at", endIso)

  const sessions = (sessionsResp.data ?? []) as ProtocolDurationRow[]
  const protocolsDone = sessions.length
  const focusMinutes = Math.round(
    sessions.reduce((acc, s) => acc + (s.duration_seconds_actual ?? 0), 0) / 60,
  )
  const microActionsDone = protocolsDone

  // 3) Tasks done today (one_action_done = true if at least 1 task done)
  const tasksDoneResp = await admin
    .from("tasks")
    .select("id")
    .eq("user_id", input.userId)
    .eq("status", "done")
    .gte("updated_at", startIso)
    .lt("updated_at", endIso)
    .limit(1)

  const tasksDone = (tasksDoneResp.data ?? []) as TaskCompletedRow[]
  const oneActionDone = tasksDone.length > 0

  // 4) Streak — count back from this date while previous day has activity
  const isActiveDay = oneActionDone || protocolsDone > 0 || pulses.length > 0
  const streakDays = isActiveDay ? await computeStreak(input.userId, date) : 0

  // 5) Upsert
  const upsertResp = await admin
    .from("daily_scores")
    .upsert(
      {
        user_id: input.userId,
        date,
        stress_avg: stressAvg,
        energy_avg: energyAvg,
        focus_minutes: focusMinutes,
        one_action_done: oneActionDone,
        micro_actions_done: microActionsDone,
        protocols_done: protocolsDone,
        streak_days: streakDays,
      },
      { onConflict: "user_id,date" },
    )
    .select()
    .maybeSingle()

  if (upsertResp.error) {
    console.error("[score/compute] upsert", { userId: input.userId, date, error: upsertResp.error })
    return null
  }
  return (upsertResp.data ?? null) as DailyScore | null
}

/**
 * Walk back from `endDate` (inclusive) and count consecutive days with activity
 * (any pulse OR any completed protocol OR any done task that day).
 *
 * Bounded to 60 days to keep query cost predictable.
 */
async function computeStreak(userId: string, endDate: string): Promise<number> {
  const admin = createAdminClient()
  const MAX_LOOKBACK = 60
  const { startIso: endDayStartIso, endIso: endDayEndIso } = utcDayBounds(endDate)

  // Fetch a window of activity once : 60 days back to today
  const lookbackStart = new Date(endDayStartIso)
  lookbackStart.setUTCDate(lookbackStart.getUTCDate() - MAX_LOOKBACK + 1)

  const [pulsesResp, sessionsResp, tasksResp] = await Promise.all([
    admin
      .from("pulse_checks")
      .select("created_at")
      .eq("user_id", userId)
      .gte("created_at", lookbackStart.toISOString())
      .lt("created_at", endDayEndIso),
    admin
      .from("regulation_sessions")
      .select("created_at")
      .eq("user_id", userId)
      .eq("completed", true)
      .gte("created_at", lookbackStart.toISOString())
      .lt("created_at", endDayEndIso),
    admin
      .from("tasks")
      .select("updated_at")
      .eq("user_id", userId)
      .eq("status", "done")
      .gte("updated_at", lookbackStart.toISOString())
      .lt("updated_at", endDayEndIso),
  ])

  const activeDays = new Set<string>()
  for (const r of (pulsesResp.data ?? []) as { created_at: string }[]) {
    activeDays.add(r.created_at.slice(0, 10))
  }
  for (const r of (sessionsResp.data ?? []) as { created_at: string }[]) {
    activeDays.add(r.created_at.slice(0, 10))
  }
  for (const r of (tasksResp.data ?? []) as { updated_at: string }[]) {
    activeDays.add(r.updated_at.slice(0, 10))
  }

  let streak = 0
  const cursor = new Date(endDayStartIso)
  while (streak < MAX_LOOKBACK) {
    const key = cursor.toISOString().slice(0, 10)
    if (!activeDays.has(key)) break
    streak += 1
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }
  return streak
}

/**
 * Read last N days of daily_scores for a user. Caller renders charts from this.
 * Days without a row are filled with zero-filled placeholders (chart continuity).
 */
export async function getRangeScores(
  userId: string,
  days: number = 30,
): Promise<DailyScore[]> {
  const admin = createAdminClient()
  const today = todayUtcISODate()
  const { startIso: todayStartIso } = utcDayBounds(today)
  const start = new Date(todayStartIso)
  start.setUTCDate(start.getUTCDate() - days + 1)
  const startDate = start.toISOString().slice(0, 10)

  const resp = await admin
    .from("daily_scores")
    .select(
      "id, user_id, date, stress_avg, energy_avg, sleep_quality, focus_minutes, one_action_done, micro_actions_done, protocols_done, streak_days, created_at",
    )
    .eq("user_id", userId)
    .gte("date", startDate)
    .lte("date", today)
    .order("date", { ascending: true })

  const rows = ((resp.data ?? []) as DailyScore[])
  const byDate = new Map<string, DailyScore>(rows.map((r) => [r.date, r]))

  const filled: DailyScore[] = []
  const cursor = new Date(start)
  for (let i = 0; i < days; i++) {
    const key = cursor.toISOString().slice(0, 10)
    const existing = byDate.get(key)
    if (existing) {
      filled.push(existing)
    } else {
      filled.push({
        id: `placeholder-${key}`,
        user_id: userId,
        date: key,
        stress_avg: null,
        energy_avg: null,
        sleep_quality: null,
        focus_minutes: 0,
        one_action_done: false,
        micro_actions_done: 0,
        protocols_done: 0,
        streak_days: 0,
        created_at: cursor.toISOString(),
      })
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return filled
}
