/**
 * PURAMA ONE — Points engine (Cash Phase 1).
 *
 * Phase 1 = points only (no cash). Phase 2 (post-Treezor) :
 * 100 points = 1€ via SEPA instant. See BRIEF §9.
 *
 * The engine NEVER calls Anthropic or external APIs. It writes to DB only.
 * All grants go through `grantPoints()` which calls the SECURITY DEFINER RPC
 * `prana.grant_points` for atomic insert(point_events) + upsert(user_points).
 *
 * Idempotency : caller is responsible for deciding whether the grant should
 * happen at all (e.g. checking "already granted today" via `hasGrantedToday`).
 */

import { createAdminClient } from "@/lib/supabase/admin"

/**
 * Reasons enumerated. Keep in sync with `prana.point_events.reason` comment in 0004 migration.
 * Adding a new reason : add here + update barème + bump unit tests.
 */
export type PointReason =
  | "daily_pulse"
  | "magic_button"
  | "protocol_done"
  | "capture_first"
  | "room_day"
  | "room_done"
  | "referral_converted"
  | "manual"

export const POINT_REWARDS: Record<PointReason, number> = {
  daily_pulse: 10, // first pulse_check of the day
  magic_button: 5, // each successful (non-fallback) magic button
  protocol_done: 5, // regulation protocol completed
  capture_first: 3, // first capture of the day (LifeOS gentle reward)
  room_day: 20, // room daily action validated (P5)
  room_done: 200, // full room completed (P5)
  referral_converted: 500, // referee converted to paying plan
  manual: 0, // admin grant — caller passes explicit delta
}

export interface GrantResult {
  ok: boolean
  granted: number
  newBalance: number | null
  newTotalEarned: number | null
  reason: PointReason
}

/**
 * Atomic grant via DB RPC. Service role only.
 *
 * @param userId - target user
 * @param reason - one of POINT_REWARDS keys (drives delta unless `delta` passed)
 * @param metadata - optional JSON context (e.g. `{ button_slug }` for magic_button)
 * @param delta - override the barème (only used by `manual`)
 */
export async function grantPoints(
  userId: string,
  reason: PointReason,
  metadata: Record<string, unknown> = {},
  delta?: number,
): Promise<GrantResult> {
  const amount = typeof delta === "number" ? delta : POINT_REWARDS[reason]
  if (amount === 0) {
    return { ok: true, granted: 0, newBalance: null, newTotalEarned: null, reason }
  }

  const admin = createAdminClient()
  const { data, error } = await admin.rpc("grant_points", {
    p_user_id: userId,
    p_delta: amount,
    p_reason: reason,
    p_metadata: metadata as never,
  })

  if (error || !data) {
    console.error("[points] grant fail", { userId, reason, amount, error })
    return { ok: false, granted: 0, newBalance: null, newTotalEarned: null, reason }
  }

  const row = Array.isArray(data) ? data[0] : data
  return {
    ok: true,
    granted: amount,
    newBalance: row?.new_balance ?? null,
    newTotalEarned: row?.new_total_earned ?? null,
    reason,
  }
}

/**
 * Was a grant of this reason already given today (UTC) for this user ?
 * Used to enforce "1 daily_pulse / 24h" without race-condition risk.
 */
export async function hasGrantedToday(
  userId: string,
  reason: PointReason,
  utcDate: Date = new Date(),
): Promise<boolean> {
  const admin = createAdminClient()
  const startOfDayUtc = new Date(
    Date.UTC(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate()),
  ).toISOString()

  const resp = await admin
    .from("point_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("reason", reason)
    .gte("created_at", startOfDayUtc)
    .limit(1)

  return (resp.count ?? 0) > 0
}

/** Read user balance — server side. Returns 0/0 if no row yet. */
export async function getUserPoints(userId: string): Promise<{
  points: number
  totalEarned: number
  totalRedeemed: number
}> {
  const admin = createAdminClient()
  const resp = await admin
    .from("user_points")
    .select("points, total_earned, total_redeemed")
    .eq("user_id", userId)
    .maybeSingle()

  return {
    points: resp.data?.points ?? 0,
    totalEarned: resp.data?.total_earned ?? 0,
    totalRedeemed: resp.data?.total_redeemed ?? 0,
  }
}
