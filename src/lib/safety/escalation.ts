import { createAdminClient } from "@/lib/supabase/admin"
import type { SafetyResult } from "./classifier"

/**
 * Persists a safety event to the DB.
 * Always uses admin client because the user might be anonymous or the request
 * might happen from a context where the user session is not available.
 */
export async function logSafetyEvent(params: {
  userId: string | null
  trigger: "sos_button" | "classifier_flag" | "keyword_match"
  result: SafetyResult
  contextText?: string
  proReferred?: boolean
}): Promise<void> {
  const supabase = createAdminClient()
  await supabase.from("safety_events").insert({
    user_id: params.userId,
    trigger: params.trigger,
    severity: params.result.severity,
    context_text: params.contextText ?? null,
    hotlines_shown: params.result.detectedKeywords ?? [],
    pro_referred: params.proReferred ?? false,
  })
}

/**
 * Decide what UI escalation to apply based on classifier result.
 * Returns a UI hint that API routes can include in their response payload.
 */
export function escalationHint(result: SafetyResult) {
  switch (result.action) {
    case "force_sos":
      return {
        modal: "blocking" as const,
        redirect: "/sos",
        message:
          "Je m'inquiète pour toi. Avant tout, parle à quelqu'un maintenant.",
      }
    case "show_sos":
      return {
        modal: "soft" as const,
        message:
          "Si c'est très dur en ce moment, tu peux parler à quelqu'un. Tu n'es pas seul·e.",
      }
    case "soft_check":
      return {
        modal: "none" as const,
        message: "Pose-toi 90 secondes. Respire avec moi.",
      }
    default:
      return null
  }
}
