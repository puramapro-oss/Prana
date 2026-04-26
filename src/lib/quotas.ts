import { createAdminClient } from "@/lib/supabase/admin"
import { DAILY_QUOTAS } from "@/lib/constants"
import type { Plan } from "@/lib/supabase/types"

/**
 * Plan-based daily quota check.
 * Counts rows created since 00:00 UTC of the user's day for the given action.
 * Uses the admin client because some quotas are read across tables.
 */

export type QuotaAction = "magicButtons" | "protocols" | "captures" | "executions"

const TABLE_BY_ACTION: Record<QuotaAction, string> = {
  magicButtons: "magic_button_usages",
  protocols: "regulation_sessions",
  captures: "captures",
  executions: "executions",
}

export interface QuotaCheck {
  allowed: boolean
  used: number
  limit: number
  unlimited: boolean
}

export async function checkDailyQuota(
  userId: string,
  plan: Plan,
  action: QuotaAction,
): Promise<QuotaCheck> {
  const limit = DAILY_QUOTAS[plan][action]
  if (limit === Infinity) {
    return { allowed: true, used: 0, limit: -1, unlimited: true }
  }
  const startOfDay = new Date()
  startOfDay.setUTCHours(0, 0, 0, 0)

  const supabase = createAdminClient()
  const table = TABLE_BY_ACTION[action]
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfDay.toISOString())

  if (error) {
    // Fail-open with a single use so the user never gets locked by an infra hiccup,
    // but logs upstream so we can investigate.
    console.error("[quotas]", action, error)
    return { allowed: true, used: 0, limit, unlimited: false }
  }

  const used = count ?? 0
  return { allowed: used < limit, used, limit, unlimited: false }
}
