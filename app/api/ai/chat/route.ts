import { NextRequest, NextResponse } from 'next/server';
import { createAnthropicClient } from '@/lib/claude/client';
import { toReadableStream } from '@/lib/claude/streaming';
import { COACH_SYSTEM } from '@/lib/claude/prompts';
import type { Message } from '@/lib/supabase/types';

interface ChatRequestBody {
  message: string;
  conversationHistory: Message[];
  userContext?: {
    dosha?: string | null;
    mtc_type?: string | null;
    spiritual_archetype?: string | null;
    plan?: string | null;
    current_programme?: string | null;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, userContext } =
      (await request.json()) as ChatRequestBody;

    const anthropic = createAnthropicClient();

    // Build the system prompt, enriched with user context when available
    let systemPrompt = COACH_SYSTEM;
    if (userContext) {
      const contextLines = [
        '',
        "Contexte de l'utilisateur :",
        userContext.dosha ? `- Dosha : ${userContext.dosha}` : null,
        userContext.mtc_type ? `- Type MTC : ${userContext.mtc_type}` : null,
        userContext.spiritual_archetype
          ? `- Archétype spirituel : ${userContext.spiritual_archetype}`
          : null,
        userContext.plan ? `- Plan : ${userContext.plan}` : null,
      ]
        .filter(Boolean)
        .join('\n');
      systemPrompt += contextLines;
    }

    // Build messages array from conversation history + new message
    const messages = [
      ...conversationHistory.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user' as const, content: message },
    ];

    const stream = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048,
      system: systemPrompt,
      messages,
      stream: true,
    });

    return new Response(toReadableStream(stream), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[API] /ai/chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 },
    );
  }
}
