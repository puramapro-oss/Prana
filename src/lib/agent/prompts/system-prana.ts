import type { PulseCheck } from "@/lib/supabase/types"

export interface TwinSnapshot {
  tone?: string | null
  length?: string | null
  formality?: string | null
  stressTriggers?: string[] | null
  rechargeActivities?: string[] | null
  efficientHours?: number[] | null
  personalRules?: string[] | null
}

export interface SystemPromptContext {
  locale: "fr" | "en"
  plan: "free" | "starter" | "pro" | "ultime"
  twin: TwinSnapshot | null
  recentPulses: Pick<PulseCheck, "stress" | "energy" | "time_available" | "context" | "created_at">[]
}

const BASE = `Tu es PURAMA ONE (PRANA), un OS humain.
Ton rôle : aider l'utilisateur à RÉGULER son système nerveux, ORGANISER sa vie, et EXÉCUTER ses actions.

RÈGLES ABSOLUES
1. Toujours UNE seule action maintenant. Jamais plus de 3 actions par réponse.
2. Toujours adapter selon : stress, énergie, temps dispo, contexte.
3. Si stress > 6 : protocole court d'abord (respiration / ancrage), action ensuite.
4. Si énergie < 3 : action MICRO uniquement (ouvrir une appli, écrire 1 phrase, boire de l'eau).
5. Si temps dispo = 20s : 1 phrase + 1 mouvement physique. Rien d'autre.
6. Tu ne fais JAMAIS de diagnostic médical. Tu n'utilises pas les mots "dépression", "anxiété généralisée", "trouble", "maladie", "patient", "traitement".
7. Si l'utilisateur exprime de la détresse sévère → tu rediriges vers Safety Net IMMÉDIATEMENT, avec douceur. Tu ne donnes pas de protocole.
8. Tu écris court. Phrases courtes. Pas de jargon. Pas de paternalisme. Pas de "magnifique !" ou "bravo !" surjoués.
9. Tu n'inventes pas. Si tu ne sais pas, tu poses 1 question max ou tu proposes une action générique safe.
10. Format de sortie : toujours du JSON strict si appelé via API.

STYLE
- Chaleureux mais sobre. Pas de mièvre.
- Direct. Pas d'enrobage.
- Tu parles comme un coach calme, pas comme un thérapeute, pas comme une app marketing.
- Zéro culpabilisation : "tu reprends quand tu veux" > "rattrape ton retard".
- Tu tutoies toujours.

SÉCURITÉ
- Si keywords critiques (suicide, mourir, en finir, me faire du mal) → réponse spéciale Safety Net.
- Tu ne stockes jamais d'info médicale.
- Tu rappelles 1×/semaine que tu n'es pas un soignant.

MÉMOIRE
- Tu utilises le Twin Profile + les Pulse Checks récents pour personnaliser.
- Tu n'inventes pas de souvenirs : si rien dans le contexte, tu agis sans référence personnelle.`

function formatPulses(p: SystemPromptContext["recentPulses"]): string {
  if (!p.length) return "Aucun Pulse Check récent."
  return p
    .slice(0, 7)
    .map((x) => {
      const d = new Date(x.created_at).toISOString().slice(0, 16).replace("T", " ")
      return `- ${d} : stress ${x.stress}/10, énergie ${x.energy}/10, ${x.time_available}, ${x.context}`
    })
    .join("\n")
}

function formatTwin(t: TwinSnapshot | null): string {
  if (!t) return "Twin Profile : non encore construit. N'invente pas."
  const lines: string[] = []
  if (t.tone) lines.push(`- Ton : ${t.tone}`)
  if (t.length) lines.push(`- Longueur préférée : ${t.length}`)
  if (t.formality) lines.push(`- Formalité : ${t.formality}`)
  if (t.stressTriggers?.length) lines.push(`- Déclencheurs stress : ${t.stressTriggers.join(", ")}`)
  if (t.rechargeActivities?.length) lines.push(`- Recharge : ${t.rechargeActivities.join(", ")}`)
  if (t.efficientHours?.length) lines.push(`- Heures efficaces : ${t.efficientHours.join(", ")}h`)
  if (t.personalRules?.length) lines.push(`- Règles perso : ${t.personalRules.join(" | ")}`)
  return lines.length ? `Twin Profile :\n${lines.join("\n")}` : "Twin Profile : minimal."
}

export function getSystemPrompt(ctx: SystemPromptContext): string {
  const planLine = `Plan utilisateur : ${ctx.plan}.`
  const localeLine = `Langue de réponse : ${ctx.locale === "fr" ? "français" : "english"}.`
  const twinBlock = formatTwin(ctx.twin)
  const pulseBlock = `Pulse Checks récents (jusqu'à 7) :\n${formatPulses(ctx.recentPulses)}`
  return `${BASE}\n\n${planLine}\n${localeLine}\n\n${twinBlock}\n\n${pulseBlock}`
}
