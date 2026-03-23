import { NextRequest, NextResponse } from 'next/server';
import { createAnthropicClient } from '@/lib/claude/client';
import { toReadableStream } from '@/lib/claude/streaming';
import { PROGRAMME_SYSTEM } from '@/lib/claude/prompts';

interface ProgrammeRequestBody {
  answers: {
    goal: string;
    level: string;
    challenges: string[];
    time: string;
    practices: string[];
  };
  userProfile: {
    dosha?: string | null;
    mtc_type?: string | null;
    spiritual_archetype?: string | null;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { answers, userProfile } = (await request.json()) as ProgrammeRequestBody;

    const anthropic = createAnthropicClient();

    const userMessage = [
      `Objectif principal : ${answers.goal}`,
      `Niveau d'expérience : ${answers.level}`,
      `Défis actuels : ${answers.challenges.join(', ')}`,
      `Temps disponible par jour : ${answers.time}`,
      `Pratiques spirituelles préférées : ${answers.practices.join(', ')}`,
      '',
      'Profil utilisateur :',
      `- Dosha : ${userProfile.dosha ?? 'Non déterminé'}`,
      `- Type MTC : ${userProfile.mtc_type ?? 'Non déterminé'}`,
      `- Archétype spirituel : ${userProfile.spiritual_archetype ?? 'Non déterminé'}`,
    ].join('\n');

    const stream = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      system: PROGRAMME_SYSTEM,
      messages: [{ role: 'user', content: userMessage }],
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
    console.error('[API] /ai/programme error:', error);
    return NextResponse.json(
      { error: 'Failed to generate programme' },
      { status: 500 },
    );
  }
}
