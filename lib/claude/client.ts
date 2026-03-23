import Anthropic from '@anthropic-ai/sdk';

/**
 * Creates a new Anthropic client instance.
 * A fresh client is returned each call to avoid shared state across requests.
 */
export function createAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not defined');
  }

  return new Anthropic({ apiKey });
}
