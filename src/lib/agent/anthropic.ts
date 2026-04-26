import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const MODEL_DEFAULT = process.env.ANTHROPIC_MODEL_DEFAULT ?? "claude-sonnet-4-6"
const MODEL_FAST = process.env.ANTHROPIC_MODEL_FAST ?? "claude-haiku-4-5-20251001"
const MODEL_DEEP = process.env.ANTHROPIC_MODEL_DEEP ?? "claude-opus-4-7"

export type ClaudeTier = "default" | "fast" | "deep"

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
}

export async function askClaude(
  userMessage: string,
  options: AskClaudeOptions = {},
): Promise<string> {
  const { system, tier = "default", maxTokens = 2048, temperature = 0.7 } = options

  const response = await anthropic.messages.create({
    model: MODELS[tier],
    max_tokens: maxTokens,
    temperature,
    ...(system ? { system } : {}),
    messages: [{ role: "user", content: userMessage }],
  })

  const block = response.content[0]
  if (block?.type === "text") return block.text
  return ""
}

export async function askClaudeJSON<T>(
  userMessage: string,
  options: AskClaudeOptions = {},
): Promise<T> {
  const text = await askClaude(userMessage, {
    ...options,
    system: `${options.system ?? ""}\n\nRESPONDS WITH VALID JSON ONLY. NO MARKDOWN, NO PROSE, NO CODE FENCE.`.trim(),
  })

  const cleaned = text.replace(/^```json\s*|\s*```$/g, "").trim()
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
