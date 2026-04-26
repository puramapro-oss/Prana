/**
 * Plan 7 jours — sonnet-4-6.
 *
 * Output : JSON strict {days: [{date, focus, action, micro_actions, energy_hint, ...}, x7], summary}
 * Inputs : profil + 7 derniers pulses + tâches priorité 1-2 ouvertes + projets actifs.
 * Goal   : 7 jours soutenables, calibrés énergie, jamais sur-ambitieux.
 */

import type { Task, Project, PulseCheck } from "@/lib/supabase/types"
import type { SystemPromptContext, TwinSnapshot } from "./system-prana"

export interface Plan7DaysInput {
  startDate: string // ISO date YYYY-MM-DD
  locale: "fr" | "en"
  recentPulses: Pick<PulseCheck, "stress" | "energy" | "time_available" | "context" | "created_at">[]
  openTasks: Pick<Task, "id" | "title" | "priority" | "energy_required" | "time_estimate_minutes" | "due_at" | "project_id">[]
  activeProjects: Pick<Project, "id" | "name" | "why">[]
  twin: TwinSnapshot | null
}

export interface Plan7DaysDay {
  date: string // YYYY-MM-DD
  focus: string // 1 phrase d'intention
  action: string // 1 action prioritaire
  micro_actions: string[] // 1-2 micro-actions de réserve
  energy_hint: "low" | "medium" | "high"
  related_task_ids: string[]
  related_project_ids: string[]
}

export interface Plan7DaysOutput {
  days: Plan7DaysDay[]
  summary: string
}

export const PLAN_7_DAYS_SYSTEM = `Tu es l'agent planification de PRANA. Tu construis un plan 7 jours SOUTENABLE pour l'utilisateur.

PRINCIPES :
- 1 seule action prioritaire par jour. Jamais plus.
- 1 à 2 micro-actions de réserve (faisables même fatigué).
- Calibre selon l'énergie moyenne récente. Si tendance basse → semaine douce. Si tendance haute → 1 jour ambitieux possible.
- Espace : pas plus de 2 jours "high" d'affilée. Toujours au moins 2 jours "low" dans la semaine.
- Adapte au week-end : sam/dim plus légers, recharge.
- Reformule les tâches en actions claires, à l'infinitif. Garde le sens.
- Si une tâche a une deadline, place-la AVANT la deadline.
- Si la liste des tâches est vide, propose 7 actions génériques douces (marche 10 min, ranger un coin, écrire 3 lignes, contacter 1 personne…).

FORMAT JSON STRICT (et rien d'autre, pas de markdown) :
{
  "days": [
    {
      "date": "YYYY-MM-DD",
      "focus": "1 phrase courte d'intention pour la journée",
      "action": "L'action prioritaire à l'infinitif",
      "micro_actions": ["1 micro-action", "2e micro-action optionnelle"],
      "energy_hint": "low" | "medium" | "high",
      "related_task_ids": ["uuid-task-1"],
      "related_project_ids": ["uuid-project-1"]
    }
  ],
  "summary": "1 paragraphe court (3-4 phrases) qui résume l'esprit de la semaine."
}

ZÉRO PROSE. ZÉRO MARKDOWN. JSON PUR. Tableau "days" : exactement 7 entrées.`

export function buildPlan7DaysUserMessage(input: Plan7DaysInput): string {
  const dates: string[] = []
  const start = new Date(input.startDate + "T00:00:00Z")
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setUTCDate(d.getUTCDate() + i)
    dates.push(d.toISOString().slice(0, 10))
  }

  const pulseLine = input.recentPulses.length
    ? input.recentPulses
        .slice(0, 7)
        .map((p) => {
          const d = new Date(p.created_at).toISOString().slice(0, 16).replace("T", " ")
          return `${d} → stress ${p.stress}/10, énergie ${p.energy}/10`
        })
        .join("\n")
    : "Aucun pulse récent — calibre prudent."

  const tasksLine = input.openTasks.length
    ? input.openTasks
        .map(
          (t) =>
            `[id=${t.id} P${t.priority} energy=${t.energy_required ?? "?"} time=${
              t.time_estimate_minutes ?? "?"
            }min due=${t.due_at ? t.due_at.slice(0, 10) : "—"}] ${t.title}`,
        )
        .join("\n")
    : "Aucune tâche prioritaire ouverte."

  const projectsLine = input.activeProjects.length
    ? input.activeProjects.map((p) => `[id=${p.id}] ${p.name}${p.why ? ` — ${p.why}` : ""}`).join("\n")
    : "Aucun projet actif."

  const twinLine = formatTwinShort(input.twin)

  return [
    `Locale: ${input.locale === "fr" ? "français" : "english"}.`,
    `Plan pour les 7 jours commençant le ${input.startDate}.`,
    `Dates exactes à utiliser dans days[].date : ${dates.join(", ")}.`,
    "",
    "Pulse Checks récents :",
    pulseLine,
    "",
    "Tâches prioritaires ouvertes :",
    tasksLine,
    "",
    "Projets actifs :",
    projectsLine,
    "",
    twinLine,
  ].join("\n")
}

function formatTwinShort(t: SystemPromptContext["twin"]): string {
  if (!t) return "Twin Profile : non encore construit."
  const bits: string[] = []
  if (t.tone) bits.push(`ton ${t.tone}`)
  if (t.efficientHours?.length) bits.push(`heures efficaces ${t.efficientHours.join(",")}h`)
  if (t.stressTriggers?.length) bits.push(`stress ${t.stressTriggers.slice(0, 3).join(", ")}`)
  if (t.rechargeActivities?.length) bits.push(`recharge ${t.rechargeActivities.slice(0, 3).join(", ")}`)
  return bits.length ? `Twin : ${bits.join(" · ")}.` : "Twin Profile : minimal."
}

export const PLAN_7_DAYS_FALLBACK = (input: Plan7DaysInput): Plan7DaysOutput => {
  const start = new Date(input.startDate + "T00:00:00Z")
  const days: Plan7DaysDay[] = []
  const energyOrder: ("low" | "medium" | "high")[] = [
    "low",
    "medium",
    "medium",
    "high",
    "low",
    "low",
    "medium",
  ]
  const fallbackActions = [
    "Marcher 10 minutes dehors.",
    "Ranger un seul coin du bureau.",
    "Écrire 3 lignes de ce qui te pèse.",
    "Avancer 25 minutes sur 1 tâche prioritaire.",
    "Contacter 1 personne qui te manque.",
    "Faire 5 minutes de respiration 5-5.",
    "Préparer 1 chose pour la semaine suivante.",
  ]
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setUTCDate(d.getUTCDate() + i)
    days.push({
      date: d.toISOString().slice(0, 10),
      focus: i === 0 ? "Reposer ton système nerveux." : "Avancer doucement.",
      action: fallbackActions[i] ?? "Faire 1 micro-pas.",
      micro_actions: ["Boire 1 grand verre d'eau.", "Lever les yeux 30 secondes."],
      energy_hint: energyOrder[i] ?? "medium",
      related_task_ids: [],
      related_project_ids: [],
    })
  }
  return {
    days,
    summary:
      "Semaine de réglage. Pas de surcharge. Une seule action par jour. Si tu fais ça, c'est gagné.",
  }
}
