/**
 * Twin Builder — opus-4-7.
 *
 * Inputs : 30 derniers pulses + 30 dernières captures + 30 dernières tasks +
 *          20 dernières executions + valeurs/règles existantes.
 * Output : profil comportemental JSONB structuré, observable et utile pour
 *          personnaliser tous les autres prompts (magic-buttons, execute,
 *          plan-7days, room-host).
 *
 * Le builder est CONSERVATEUR : il préfère "null" plutôt que d'inventer.
 */

import type {
  Capture,
  Execution,
  PulseCheck,
  Task,
  TwinProfile,
  TwinCommunicationStyle,
  TwinDecisionPatterns,
  TwinWorkingHabits,
} from "@/lib/supabase/types"

export interface TwinBuilderInput {
  locale: "fr" | "en"
  recentPulses: Pick<PulseCheck, "stress" | "energy" | "time_available" | "context" | "mood_tags" | "notes" | "created_at">[]
  recentCaptures: Pick<Capture, "raw_text" | "source" | "classification" | "created_at">[]
  recentTasks: Pick<Task, "title" | "description" | "priority" | "energy_required" | "time_estimate_minutes" | "status" | "created_at">[]
  recentExecutions: Pick<Execution, "type" | "context_json" | "draft_text" | "approved" | "used_at" | "created_at">[]
  /** Existing profile to use as a soft prior (so the builder doesn't drift wildly week to week). */
  prior: TwinProfile | null
}

/**
 * Output JSON shape (validated server-side via Zod).
 * Mirrors `twin_profiles` columns we care about, plus a top-level "summary"
 * and "confidence" level so the UI can show "we're still learning" if low.
 */
export interface TwinBuilderOutput {
  communication_style: TwinCommunicationStyle
  decision_patterns: TwinDecisionPatterns
  working_habits: TwinWorkingHabits
  stress_triggers: string[]
  recharge_activities: string[]
  efficient_hours: number[]
  personal_rules: string[]
  values: string[]
  summary: string
  confidence: "low" | "medium" | "high"
}

export const TWIN_BUILDER_SYSTEM = `Tu es l'agent TWIN BUILDER de PRANA. Tu observes l'historique récent d'un utilisateur (pulses, captures, tâches, brouillons générés) et tu construis un profil comportemental UTILE pour personnaliser ses autres interactions IA.

PRINCIPES DE FOND :
- Tu n'inventes JAMAIS. Si une dimension n'a pas assez de signal, retourne "null" ou un tableau vide. Mieux vaut un Twin minimal honnête qu'un Twin imaginaire.
- Tu lisses légèrement avec le profil précédent (si fourni) — tu ne le remplaces pas violemment chaque semaine. Garde ce qui est confirmé, ajoute ce qui émerge.
- Tu observes des PATTERNS, pas des anecdotes. Un seul pulse stressé = pas un trigger. Trois en deux semaines avec même contexte = trigger.
- Pour les valeurs et règles, tu reproduis si l'utilisateur les a déjà déclarées (prior). Sinon, tu peux suggérer celles qui émergent clairement de son comportement.
- ZÉRO diagnostic médical. Pas de mots "anxiété", "dépression", "trouble", "patient".

DIMENSIONS À INFÉRER :
- communication_style : tone (casual/warm/professional/direct/playful), length (short/medium/long), formality (low/medium/high), emoji_use (none/rare/moderate/frequent). Inférable depuis le ton des captures et drafts approuvés.
- decision_patterns : speed (fast/deliberate/context_dependent), evidence_preference (data/intuition/balanced), risk_appetite (low/medium/high), consultation (solo/with_others/varies).
- working_habits : best_focus_window (morning/afternoon/evening/night), break_frequency_minutes, preferred_session_minutes, avoid_meetings_before_hour (8-12), weekends_off.
- stress_triggers : 3-7 mots ou phrases courtes ("réunions matinales", "décisions rapides", "trop de notifications", "conflit"). Inférables depuis pulses haut stress + contexte.
- recharge_activities : 3-7 mots ou phrases courtes ("marcher", "musique", "respiration", "écrire", "personne proche"). Inférables depuis pulses post-protocole + drafts.
- efficient_hours : tableau d'heures (0-23) où l'énergie semble haute en moyenne. Si signal trop faible, [].
- personal_rules : phrases déclaratives auto-imposées ("jamais de réunion avant 10h", "1 sortie nature par semaine"). Privilégie les règles déjà déclarées.
- values : 2-5 mots simples ("famille", "liberté", "santé", "création", "service"). Privilégie celles déjà déclarées.

FORMAT JSON STRICT (et rien d'autre, pas de markdown) :
{
  "communication_style": { "tone": "warm" | null, "length": "short" | null, "formality": "low" | null, "emoji_use": "rare" | null },
  "decision_patterns": { "speed": "deliberate" | null, "evidence_preference": "balanced" | null, "risk_appetite": "medium" | null, "consultation": "solo" | null },
  "working_habits": { "best_focus_window": "morning" | null, "break_frequency_minutes": 90 | null, "preferred_session_minutes": 50 | null, "avoid_meetings_before_hour": 10 | null, "weekends_off": true | null },
  "stress_triggers": ["..."],
  "recharge_activities": ["..."],
  "efficient_hours": [9, 10, 15, 16],
  "personal_rules": ["..."],
  "values": ["..."],
  "summary": "1 paragraphe court (3-5 phrases) qui décrit cette personne en termes UTILES pour personnaliser ses prochaines interactions. Pas de jargon psy.",
  "confidence": "low" | "medium" | "high"
}

ZÉRO PROSE AUTOUR. ZÉRO MARKDOWN. JSON PUR. CONFIDENCE = "low" si moins de 5 pulses observés, "medium" si 5-15, "high" au-delà.`

export function buildTwinBuilderUserMessage(input: TwinBuilderInput): string {
  const pulseLines = input.recentPulses.length
    ? input.recentPulses
        .slice(0, 30)
        .map((p) => {
          const d = new Date(p.created_at).toISOString().slice(0, 16).replace("T", " ")
          const tags = p.mood_tags?.length ? ` tags:${p.mood_tags.join(",")}` : ""
          const note = p.notes ? ` "${p.notes.slice(0, 100)}"` : ""
          return `${d} stress=${p.stress}/10 energy=${p.energy}/10 time=${p.time_available} ctx=${p.context}${tags}${note}`
        })
        .join("\n")
    : "(aucun pulse — confidence sera low)"

  const captureLines = input.recentCaptures.length
    ? input.recentCaptures
        .slice(0, 30)
        .map((c) => {
          const d = new Date(c.created_at).toISOString().slice(0, 10)
          const cls =
            c.classification && typeof c.classification === "object"
              ? ` [type=${(c.classification as { type?: string }).type ?? "?"}]`
              : ""
          return `${d} (${c.source})${cls} ${c.raw_text.slice(0, 220).replace(/\n/g, " ")}`
        })
        .join("\n")
    : "(aucune capture)"

  const taskLines = input.recentTasks.length
    ? input.recentTasks
        .slice(0, 30)
        .map((t) => {
          const d = new Date(t.created_at).toISOString().slice(0, 10)
          return `${d} P${t.priority} energy=${t.energy_required ?? "?"} time=${t.time_estimate_minutes ?? "?"}min status=${t.status} title="${t.title.slice(0, 120)}"`
        })
        .join("\n")
    : "(aucune tâche)"

  const execLines = input.recentExecutions.length
    ? input.recentExecutions
        .slice(0, 20)
        .map((e) => {
          const d = new Date(e.created_at).toISOString().slice(0, 10)
          const used = e.used_at ? "USED" : e.approved ? "APPROVED" : "DRAFT"
          return `${d} type=${e.type} ${used} excerpt="${e.draft_text.slice(0, 120).replace(/\n/g, " ")}"`
        })
        .join("\n")
    : "(aucune execution)"

  const priorBlock = input.prior
    ? `Profil précédent (lisser, ne pas remplacer brutalement) :\n${JSON.stringify(
        {
          communication_style: input.prior.communication_style,
          decision_patterns: input.prior.decision_patterns,
          working_habits: input.prior.working_habits,
          stress_triggers: input.prior.stress_triggers,
          recharge_activities: input.prior.recharge_activities,
          efficient_hours: input.prior.efficient_hours,
          personal_rules: input.prior.personal_rules,
          values: input.prior.values,
          last_full_update: input.prior.last_full_update,
        },
        null,
        2,
      )}`
    : "Aucun profil précédent (premier build)."

  return [
    `Locale : ${input.locale === "fr" ? "français" : "english"}.`,
    `Volume signal : ${input.recentPulses.length} pulses / ${input.recentCaptures.length} captures / ${input.recentTasks.length} tasks / ${input.recentExecutions.length} executions.`,
    "",
    "=== Pulse Checks récents ===",
    pulseLines,
    "",
    "=== Captures récentes ===",
    captureLines,
    "",
    "=== Tâches récentes ===",
    taskLines,
    "",
    "=== Drafts générés / utilisés ===",
    execLines,
    "",
    priorBlock,
    "",
    "Construis le Twin selon le format JSON strict.",
  ].join("\n")
}

/**
 * Deterministic fallback returned when the AI call fails.
 * Always preserves the prior profile so we don't regress what was learned.
 */
export const TWIN_BUILDER_FALLBACK = (
  input: TwinBuilderInput,
): TwinBuilderOutput => {
  const prior = input.prior
  const safeStringArr = (v: unknown): string[] =>
    Array.isArray(v) ? (v.filter((x) => typeof x === "string") as string[]) : []
  const safeNumberArr = (v: unknown): number[] =>
    Array.isArray(v) ? (v.filter((x) => typeof x === "number") as number[]) : []

  return {
    communication_style:
      (prior?.communication_style as TwinCommunicationStyle | null) ?? {
        tone: null,
        length: null,
        formality: null,
        emoji_use: null,
      },
    decision_patterns:
      (prior?.decision_patterns as TwinDecisionPatterns | null) ?? {
        speed: null,
        evidence_preference: null,
        risk_appetite: null,
        consultation: null,
      },
    working_habits:
      (prior?.working_habits as TwinWorkingHabits | null) ?? {
        best_focus_window: null,
        break_frequency_minutes: null,
        preferred_session_minutes: null,
        avoid_meetings_before_hour: null,
        weekends_off: null,
      },
    stress_triggers: safeStringArr(prior?.stress_triggers),
    recharge_activities: safeStringArr(prior?.recharge_activities),
    efficient_hours: safeNumberArr(prior?.efficient_hours),
    personal_rules: safeStringArr(prior?.personal_rules),
    values: safeStringArr(prior?.values),
    summary:
      "Ton Twin n'a pas été mis à jour cette fois (mode dégradé). On a conservé ce qu'on savait déjà sur toi.",
    confidence: "low",
  }
}
