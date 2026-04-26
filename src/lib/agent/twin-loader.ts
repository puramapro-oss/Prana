/**
 * Helpers to load a user's Twin profile and convert it into the lightweight
 * `TwinSnapshot` consumed by `getSystemPrompt()` (system-prana.ts).
 *
 * Used by every IA route that wants to personalize :
 *  - api/agent/magic-button
 *  - api/agent/execute
 *  - api/lifeos/plan-7days
 *  - cron room-tick (later)
 */

import { createAdminClient } from "@/lib/supabase/admin"
import type {
  TwinProfile,
  TwinCommunicationStyle,
  TwinWorkingHabits,
} from "@/lib/supabase/types"
import type { TwinSnapshot } from "@/lib/agent/prompts/system-prana"

export interface FullTwinSnapshot extends TwinSnapshot {
  protectiveMode: boolean
  values?: string[] | null
  workingHabits?: TwinWorkingHabits | null
  hasProfile: boolean
}

/** Server-only. Never exposes to the client. */
export async function loadTwin(userId: string): Promise<FullTwinSnapshot> {
  const admin = createAdminClient()
  const resp = await admin
    .from("twin_profiles")
    .select(
      "communication_style, working_habits, stress_triggers, recharge_activities, efficient_hours, personal_rules, values, protective_mode",
    )
    .eq("user_id", userId)
    .maybeSingle()

  const row = resp.data as Pick<
    TwinProfile,
    | "communication_style"
    | "working_habits"
    | "stress_triggers"
    | "recharge_activities"
    | "efficient_hours"
    | "personal_rules"
    | "values"
    | "protective_mode"
  > | null

  if (!row) {
    return {
      tone: null,
      length: null,
      formality: null,
      stressTriggers: null,
      rechargeActivities: null,
      efficientHours: null,
      personalRules: null,
      values: null,
      workingHabits: null,
      protectiveMode: false,
      hasProfile: false,
    }
  }

  const cs = (row.communication_style as TwinCommunicationStyle | null) ?? null
  const wh = (row.working_habits as TwinWorkingHabits | null) ?? null

  return {
    tone: cs?.tone ?? null,
    length: cs?.length ?? null,
    formality: cs?.formality ?? null,
    stressTriggers: row.stress_triggers ?? null,
    rechargeActivities: row.recharge_activities ?? null,
    efficientHours: row.efficient_hours ?? null,
    personalRules: row.personal_rules ?? null,
    values: row.values ?? null,
    workingHabits: wh,
    protectiveMode: row.protective_mode ?? false,
    hasProfile: true,
  }
}

/** Returns a lightweight snapshot suitable for `getSystemPrompt({ twin })`. */
export function toTwinSnapshot(full: FullTwinSnapshot): TwinSnapshot | null {
  if (!full.hasProfile) return null
  return {
    tone: full.tone,
    length: full.length,
    formality: full.formality,
    stressTriggers: full.stressTriggers,
    rechargeActivities: full.rechargeActivities,
    efficientHours: full.efficientHours,
    personalRules: full.personalRules,
    values: full.values ?? null,
  }
}
