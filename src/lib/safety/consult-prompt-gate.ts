/**
 * Decides whether the "Quand consulter un pro" sheet should auto-open
 * for the current user on this app entry.
 *
 * Triggers (any of) :
 *   1. No `last_pro_consult_prompt_at` in profile.metadata AND user is at least 14 days old
 *      (we don't bombard fresh signups; we wait until the relationship is built).
 *   2. ≥30 days since last prompt.
 *   3. ≥1 critical safety_event in the last 7 days, even if last prompt was recent.
 *
 * Server-only — uses the admin client and reads `profile.metadata`.
 */

import { createAdminClient } from "@/lib/supabase/admin"
import type { Profile, ProfileMetadata } from "@/lib/supabase/types"

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000
const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

export async function shouldShowConsultPrompt(userId: string): Promise<boolean> {
  const admin = createAdminClient()
  const profileResp = await admin
    .from("profiles")
    .select("metadata, created_at")
    .eq("id", userId)
    .maybeSingle()
  const profile = profileResp.data as Pick<Profile, "metadata" | "created_at"> | null
  if (!profile) return false

  const meta = (profile.metadata as ProfileMetadata | null) ?? {}
  const now = Date.now()
  const accountAgeMs = now - new Date(profile.created_at).getTime()

  // Critical event in last 7 days → always show
  const sevenDaysAgo = new Date(now - SEVEN_DAYS_MS).toISOString()
  const criticalResp = await admin
    .from("safety_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("severity", "critical")
    .gte("created_at", sevenDaysAgo)
    .limit(1)
  if ((criticalResp.count ?? 0) > 0) return true

  const last = meta.last_pro_consult_prompt_at
    ? new Date(meta.last_pro_consult_prompt_at).getTime()
    : null

  if (last === null) {
    // First-time prompt: only after 14 days of usage.
    return accountAgeMs >= FOURTEEN_DAYS_MS
  }
  return now - last >= THIRTY_DAYS_MS
}
