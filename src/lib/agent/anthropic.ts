import 'server-only';
import { smarana } from '@purama/smarana';
import Anthropic from "@anthropic-ai/sdk"

// Loi 1 SMARANA-BRIEF.md : "Aucune app n'appelle l'API directement. Tout passe par smarana.ask()."
// PRANA ne détient plus de client Anthropic — mémoire cross-écosystème + cache + usage
// centralisés dans @purama/smarana (packages/smarana).

// Mapping tier : "default" → "main", "deep" → "pro", "fast" → "fast"
export type ClaudeTier = "default" | "fast" | "deep"
type SmaranaTier = 'fast' | 'main' | 'pro'

const TIER_MAP: Record<ClaudeTier, SmaranaTier> = {
  default: 'main',
  fast: 'fast',
  deep: 'pro',
}

// Client Anthropic UNIQUEMENT pour streamClaude (streaming hors périmètre smarana)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const MODEL_DEFAULT = process.env.ANTHROPIC_MODEL_DEFAULT ?? "claude-sonnet-4-6"
const MODEL_FAST = process.env.ANTHROPIC_MODEL_FAST ?? "claude-haiku-4-5-20251001"
const MODEL_DEEP = process.env.ANTHROPIC_MODEL_DEEP ?? "claude-opus-4-7"

const MODELS: Record<ClaudeTier, string> = {
  default: MODEL_DEFAULT,
  fast: MODEL_FAST,
  deep: MODEL_DEEP,
}

export interface AskClaudeOptions {
  system?: string
  tier?: ClaudeTier
  maxTokens?: number
  temperature?: number
  userId?: string
}

export async function askClaude(
  userMessage: string,
  options: AskClaudeOptions = {},
): Promise<string> {
  const { system, tier = "default", maxTokens = 2048, userId } = options
  // temperature ignoré (non supporté par smarana.ask)

  const result = await smarana.ask({
    appSlug: 'prana',
    userId,
    system: system ?? '',
    message: userMessage,
    tier: TIER_MAP[tier],
    maxTokens,
  });

  return result.text;
}

export async function askClaudeJSON<T>(
  userMessage: string,
  options: AskClaudeOptions = {},
): Promise<T> {
  const { system, tier = "default", maxTokens = 2048, userId } = options

  const systemPrompt = `${system ?? ""}\n\nRESPONDS WITH VALID JSON ONLY. NO MARKDOWN, NO PROSE, NO CODE FENCE.`.trim()

  const result = await smarana.ask({
    appSlug: 'prana',
    userId,
    system: systemPrompt,
    message: userMessage,
    tier: TIER_MAP[tier],
    maxTokens,
  });

  const cleaned = result.text.replace(/^```json\s*|\s*```$/g, "").trim()
  return JSON.parse(cleaned) as T
}

export async function* streamClaude(
  userMessage: string,
  options: AskClaudeOptions = {},
): AsyncGenerator<string, void, unknown> {
  const { system, tier = "default", maxTokens = 2048, temperature = 0.7 } = options

  const stream = anthropic.messages.stream({
    model: MODELS[tier],
    max_tokens: maxTokens,
    temperature,
    ...(system ? { system } : {}),
    messages: [{ role: "user", content: userMessage }],
  })

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text
    }
  }
}

export { anthropic, MODELS }
