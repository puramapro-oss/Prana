import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import type { Plan } from '@/lib/supabase/types';

interface CheckoutRequestBody {
  plan: Exclude<Plan, 'free'>;
  userId: string;
}

const PRICE_MAP: Record<Exclude<Plan, 'free'>, string | undefined> = {
  seed: process.env.STRIPE_PRICE_SEED,
  bloom: process.env.STRIPE_PRICE_BLOOM,
  ascend: process.env.STRIPE_PRICE_ASCEND,
};

export async function POST(request: NextRequest) {
  try {
    const { plan, userId } = (await request.json()) as CheckoutRequestBody;

    const priceId = PRICE_MAP[plan];
    if (!priceId) {
      return NextResponse.json(
        { error: `Invalid plan or missing price configuration: ${plan}` },
        { status: 400 },
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL;
    if (!appUrl) {
      throw new Error('APP_URL is not configured');
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?welcome=true`,
      cancel_url: appUrl,
      client_reference_id: userId,
      metadata: {
        plan,
        userId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[API] /stripe/checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    );
  }
}
