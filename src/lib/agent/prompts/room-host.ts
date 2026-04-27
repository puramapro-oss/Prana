/**
 * Room Host IA prompt.
 *
 * Each member of a room receives ONE personalized AI host message per day,
 * in the morning (or whenever cron room-tick runs). The message :
 *  - opens with a calm greeting (no "Bonjour ☀️" cliché — adapt to twin tone)
 *  - presents today's action from the daily_action_template
 *  - calls out 1 line of "why" anchored in the twin's known triggers
 *  - keeps it under 4 short lines. Body only — no markdown, no emoji vomit.
 */

import type { TwinSnapshot } from "@/lib/agent/prompts/system-prana"
import type { RoomDayAction } from "@/lib/supabase/types"

export const ROOM_HOST_SYSTEM = `Tu es l'host d'une room PURAMA ONE. Tu accompagnes UN membre, pas un groupe.

RÔLE
- Tu poses 1 message par jour à ce membre. Court. Doux. Concret.
- Tu adaptes le ton + la longueur au Twin Profile fourni (s'il existe).
- Tu n'imposes rien. Tu rappelles l'action du jour avec présence.

RÈGLES
1. 4 lignes maximum. Phrases courtes. Pas de markdown, pas de listes à puces.
2. Tu utilises le prénom uniquement si fourni explicitement. Sinon tu tutoies.
3. JAMAIS de "bonjour ☀️" ou "namaste". Pas de cliché bien-être.
4. Tu mentionnes l'action concrète et la "raison du jour" en 1 ligne.
5. Si le Twin Profile a un trigger pertinent → tu l'intègres en filigrane (jamais en surplomb).
6. Tu ne demandes pas comment ça va. Tu invites à l'action.
7. Tu sors un objet JSON strict : { "body": string }
8. Pas d'emoji sauf 1 maximum si le Twin tone est "playful" ou "warm".

CONTEXTE FOURNI
- Profil de la room (nom, jour actuel sur durée totale, action du jour)
- Twin Profile du membre (peut être null)
- Plan utilisateur (free / starter / pro / ultime)
`

export interface RoomHostInput {
  /** Room name (FR) */
  roomName: string
  /** Today's action template entry */
  todayAction: RoomDayAction
  /** Total duration in days */
  durationDays: number
  /** Member's first name if known */
  displayName: string | null
  /** Member's twin (may be null) */
  twin: TwinSnapshot | null
}

export interface RoomHostOutput {
  body: string
}

export function buildRoomHostUserMessage(input: RoomHostInput): string {
  const lines = [
    `Room : ${input.roomName}.`,
    `Jour ${input.todayAction.day} / ${input.durationDays}.`,
    `Action du jour : "${input.todayAction.title}". ${input.todayAction.action}`,
    `Pourquoi : ${input.todayAction.why}`,
    `Énergie demandée : ${input.todayAction.energy}.`,
  ]
  if (input.displayName) lines.push(`Prénom du membre : ${input.displayName}.`)
  if (input.twin) {
    if (input.twin.tone) lines.push(`Ton préféré : ${input.twin.tone}.`)
    if (input.twin.length) lines.push(`Longueur préférée : ${input.twin.length}.`)
    if (input.twin.stressTriggers?.length) {
      lines.push(`Déclencheurs stress connus : ${input.twin.stressTriggers.join(", ")}.`)
    }
    if (input.twin.values?.length) {
      lines.push(`Valeurs : ${input.twin.values.join(", ")}.`)
    }
  } else {
    lines.push("Pas de Twin Profile : reste neutre, chaleureux.")
  }
  lines.push("\nProduis un seul JSON { body: string } adapté.")
  return lines.join("\n")
}

/**
 * Deterministic fallback when AI fails or Twin is unavailable.
 * Never blocks the cron loop.
 */
export function ROOM_HOST_FALLBACK(input: RoomHostInput): RoomHostOutput {
  const dayLabel = `Jour ${input.todayAction.day}/${input.durationDays}`
  const body = `${dayLabel} — ${input.todayAction.title}. ${input.todayAction.action} ${input.todayAction.why}`
  return { body: body.slice(0, 600) }
}
