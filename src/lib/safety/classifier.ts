import { askClaudeJSON } from "@/lib/agent/anthropic"
import type { SafetySeverity } from "@/lib/supabase/types"

export interface SafetyResult {
  severity: SafetySeverity
  confidence: number
  action: "none" | "soft_check" | "show_sos" | "force_sos"
  detectedKeywords: string[]
}

const CRITICAL_KEYWORDS = [
  // FR
  "suicide", "me suicider", "en finir", "mourir", "me tuer", "me faire du mal",
  "personne ne tient à moi", "à quoi bon", "je veux mourir", "j'en peux plus",
  // EN
  "kill myself", "end it all", "want to die", "suicide", "self harm", "self-harm",
  "no point living", "no one cares",
]

const HIGH_KEYWORDS = [
  "désespoir", "désespérée", "désespéré", "vide", "sans espoir",
  "hopeless", "hopelessness", "no hope", "cant cope", "can't cope",
]

/**
 * Local fast pre-check based on keyword matching.
 * Returns immediately when critical keywords are detected (cheaper than API call).
 */
export function localSafetyPrecheck(text: string): SafetyResult | null {
  const lower = text.toLowerCase()
  const matchedCritical = CRITICAL_KEYWORDS.filter((k) => lower.includes(k))
  if (matchedCritical.length > 0) {
    return {
      severity: "critical",
      confidence: 0.95,
      action: "force_sos",
      detectedKeywords: matchedCritical,
    }
  }
  const matchedHigh = HIGH_KEYWORDS.filter((k) => lower.includes(k))
  if (matchedHigh.length > 0) {
    return {
      severity: "high",
      confidence: 0.7,
      action: "show_sos",
      detectedKeywords: matchedHigh,
    }
  }
  return null
}

const CLASSIFIER_PROMPT = `Tu es un classifier de détresse psychologique.
Tu reçois un texte d'un utilisateur. Tu produis UNIQUEMENT un JSON valide :
{
  "severity": "low" | "medium" | "high" | "critical",
  "confidence": 0..1,
  "action": "none" | "soft_check" | "show_sos" | "force_sos",
  "detectedKeywords": ["mot1", "mot2"]
}

Règles :
- "critical" si idéation suicidaire claire, automutilation, désespoir profond → action="force_sos".
- "high" si détresse intense, isolement, perte de sens → action="show_sos".
- "medium" si stress élevé, anxiété → action="soft_check".
- "low" si neutre ou positif → action="none".
- Pas de prose. Pas de markdown. JSON pur.`

/**
 * Full IA classification (haiku-4-5). Use AFTER localSafetyPrecheck returns null.
 * Background-safe : if Anthropic fails, returns "low / none" — fail-open for UX,
 * but the local precheck still catches critical keywords.
 */
export async function classifyForSafety(text: string): Promise<SafetyResult> {
  const local = localSafetyPrecheck(text)
  if (local) return local

  try {
    return await askClaudeJSON<SafetyResult>(text, {
      system: CLASSIFIER_PROMPT,
      tier: "fast",
      maxTokens: 256,
      temperature: 0,
    })
  } catch {
    return { severity: "low", confidence: 0.5, action: "none", detectedKeywords: [] }
  }
}
