/**
 * PRANA — Social autopilot content generator.
 * Picks a theme from a curated list, asks haiku-4-5 for a tight bilingual post,
 * pairs it with a Pollinations image. Deterministic per call.
 */

import { askClaudeJSON } from "@/lib/agent/anthropic"
import { pollinationsImageUrl } from "./zernio"

export const SOCIAL_THEMES = [
  "regulation_nervous_system",
  "voice_capture_lifeos",
  "one_action_today",
  "morning_pulse_check",
  "calm_before_focus",
  "boundaries_with_ai",
  "rooms_collective_micro_actions",
  "twin_personalization",
  "stress_first_aid_60s",
  "life_os_one_input",
] as const

export type SocialTheme = (typeof SOCIAL_THEMES)[number]

export interface GeneratedPost {
  theme: SocialTheme
  captionFr: string
  captionEn: string
  hashtags: string[]
  imagePrompt: string
  imageUrl: string
}

const SYSTEM_PROMPT = `You write short social posts for PURAMA ONE — a calm, honest, anti-bullshit wellness/productivity OS.

Hard rules:
- French and English versions, both punchy, max 220 chars each.
- No emojis except optional one at start.
- No "#1", "trick", "hack", "guaranteed", "AI revolution".
- No medical claims. No dietary claims.
- Never reference brand competitors.
- Always end FR with link "prana.purama.dev" if it fits naturally; same EN.
- Keep voice intimate, second person, present tense.
- Hashtags: 3-5 max, relevant FR+EN mixed (e.g. #PuramaOne #regulation #wellness).
- Image prompt: photographic, calm, soft natural light, no text, no logos, abstract over literal.

Respond with ONLY a JSON object: {"caption_fr","caption_en","hashtags":[...],"image_prompt"}.`

export async function generatePost(theme: SocialTheme): Promise<GeneratedPost> {
  const userMessage = `Theme: ${theme}\n\nWrite the post.`
  const json = await askClaudeJSON<{
    caption_fr: string
    caption_en: string
    hashtags: string[]
    image_prompt: string
  }>(userMessage, {
    system: SYSTEM_PROMPT,
    tier: "fast",
    maxTokens: 600,
    temperature: 0.85,
  })

  const captionFr = String(json.caption_fr ?? "").slice(0, 280).trim()
  const captionEn = String(json.caption_en ?? "").slice(0, 280).trim()
  const hashtags = Array.isArray(json.hashtags)
    ? json.hashtags.map((h) => String(h).replace(/^#+/, "")).filter(Boolean).slice(0, 5)
    : []
  const imagePrompt = String(json.image_prompt ?? "calm soft natural light minimal aesthetic").slice(0, 200)

  return {
    theme,
    captionFr,
    captionEn,
    hashtags,
    imagePrompt,
    imageUrl: pollinationsImageUrl(imagePrompt),
  }
}

/** Pick a theme deterministically from current ISO week so posts rotate across the year. */
export function pickThemeForToday(date = new Date()): SocialTheme {
  // ISO week-of-year × day-of-week as index
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const dayNum = (target.getUTCDay() + 6) % 7
  target.setUTCDate(target.getUTCDate() - dayNum + 3)
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4))
  const week = 1 + Math.round(((target.getTime() - firstThursday.getTime()) / 86_400_000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7)
  const idx = (week * 3 + date.getUTCDay()) % SOCIAL_THEMES.length
  return SOCIAL_THEMES[idx]
}
