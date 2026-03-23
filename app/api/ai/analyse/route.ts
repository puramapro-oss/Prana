import { NextRequest, NextResponse } from 'next/server';
import { createAnthropicClient } from '@/lib/claude/client';
import { SCAN_SYSTEM } from '@/lib/claude/prompts';

interface AnalyseRequestBody {
  scanData: Record<string, unknown>;
  userProfile?: {
    full_name?: string | null;
    email?: string | null;
  };
}

interface AnalysisResult {
  dosha: string;
  dosha_detail: string;
  mtc_type: string;
  mtc_detail: string;
  spiritual_archetype: string;
  archetype_detail: string;
  microbiome_profile: string;
  nutritional_gaps: string[];
  nutritional_detail: string;
  stress_level: string;
  stress_detail: string;
  recommendations: string[];
  summary: string;
}

export async function POST(request: NextRequest) {
  try {
    const { scanData, userProfile } = (await request.json()) as AnalyseRequestBody;

    const anthropic = createAnthropicClient();

    const userMessage = [
      "Voici les réponses du questionnaire de santé de l'utilisateur :",
      '',
      JSON.stringify(scanData, null, 2),
      '',
      userProfile?.full_name
        ? `Nom de l'utilisateur : ${userProfile.full_name}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      system: SCAN_SYSTEM,
      messages: [{ role: 'user', content: userMessage }],
    });

    // Extract text content from the response
    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text content in Claude response');
    }

    // Parse the JSON response from Claude
    const analysis: AnalysisResult = JSON.parse(textBlock.text);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('[API] /ai/analyse error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Failed to parse analysis response' },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to perform analysis' },
      { status: 500 },
    );
  }
}
