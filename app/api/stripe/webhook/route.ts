import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/client';
import { createServerClient } from '@/lib/supabase/server';
import type { Plan } from '@/lib/supabase/types';

/**
 * Maps a Stripe Price ID back to the corresponding PRANA plan name.
 */
function planFromPriceId(priceId: string): Plan {
  const map: Record<string, Plan> = {
    [process.env.STRIPE_PRICE_SEED!]: 'seed',
    [process.env.STRIPE_PRICE_BLOOM!]: 'bloom',
    [process.env.STRIPE_PRICE_ASCEND!]: 'ascend',
  };
  return map[priceId] ?? 'free';
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[Webhook] STRIPE_WEBHOOK_SECRET is not defined');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createServerClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const plan = (session.metadata?.plan as Plan) ?? 'seed';

        if (userId) {
          const { error } = await supabase
            .from('profiles')
            .update({
              plan,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
            })
            .eq('id', userId);

          if (error) {
            console.error('[Webhook] Failed to update profile after checkout:', error);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { error } = await supabase
          .from('profiles')
          .update({
            plan: 'free' as Plan,
            stripe_subscription_id: null,
          })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('[Webhook] Failed to downgrade profile:', error);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0]?.price?.id;

        if (priceId) {
          const plan = planFromPriceId(priceId);

          const { error } = await supabase
            .from('profiles')
            .update({ plan })
            .eq('stripe_customer_id', customerId);

          if (error) {
            console.error('[Webhook] Failed to update subscription plan:', error);
          }
        }
        break;
      }

      default:
        // Unhandled event type -- acknowledge receipt
        break;
    }
  } catch (error) {
    console.error('[Webhook] Error processing event:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
