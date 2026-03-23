import Stripe from 'stripe';
import { loadStripe, type Stripe as StripeJs } from '@stripe/stripe-js';

/**
 * Server-side Stripe client (use in API routes / server actions only).
 * Lazily initialized to avoid errors during build when env vars are absent.
 */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      typescript: true,
    });
  }
  return _stripe;
}

// Keep backward-compatible named export (lazy getter)
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

/* ------------------------------------------------------------------ */
/*  Client-side (browser) Stripe.js                                   */
/* ------------------------------------------------------------------ */

let stripeJsPromise: Promise<StripeJs | null> | null = null;

export function getStripeJs(): Promise<StripeJs | null> {
  if (!stripeJsPromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined');
    }
    stripeJsPromise = loadStripe(key);
  }
  return stripeJsPromise;
}
