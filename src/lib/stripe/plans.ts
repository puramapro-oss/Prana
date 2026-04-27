import type { Plan } from "@/lib/supabase/types"

export interface PlanDef {
  id: Plan
  name: string
  tagline: string
  /** Monthly price in € */
  priceMonthly: number
  /** Yearly price in € — already discounted -20% */
  priceYearly: number
  features: string[]
  highlighted?: boolean
  ctaLabel: string
  /** Stripe price IDs — populated by `scripts/create-stripe-webhook.ts` */
  stripePriceMonthlyId?: string
  stripePriceYearlyId?: string
}

export const PLANS: PlanDef[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Commence à respirer.",
    priceMonthly: 0,
    priceYearly: 0,
    ctaLabel: "Commencer gratuitement",
    features: [
      "3 boutons magiques par jour",
      "1 protocole stress par jour",
      "1 capture LifeOS",
      "1 room officielle",
      "Bouton SOS toujours accessible",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    tagline: "Pour celles et ceux qui veulent du calme.",
    priceMonthly: 29.99,
    priceYearly: 287.9, // 29.99 × 12 × 0.80
    ctaLabel: "Démarrer 7 jours Pro offerts",
    stripePriceMonthlyId: process.env.STRIPE_PRICE_STARTER_MONTHLY,
    stripePriceYearlyId: process.env.STRIPE_PRICE_STARTER_YEARLY,
    features: [
      "Tout illimité côté régulation",
      "5 exécutions IA par jour",
      "1 room premium",
      "Twin basique",
      "Audio des protocoles courts",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "L'OS humain complet.",
    priceMonthly: 69,
    priceYearly: 662.4, // 69 × 12 × 0.80
    highlighted: true,
    ctaLabel: "Passer Pro",
    stripePriceMonthlyId: process.env.STRIPE_PRICE_PRO_MONTHLY,
    stripePriceYearlyId: process.env.STRIPE_PRICE_PRO_YEARLY,
    features: [
      "Tout illimité",
      "Twin complet (rebuild hebdo)",
      "Rooms premium illimitées",
      "Plan 7 jours regénérable",
      "Audio ElevenLabs sur tous les protocoles",
      "Cash redistribution Phase 2",
    ],
  },
  {
    id: "ultime",
    name: "Ultime",
    tagline: "Accès anticipé. Support prioritaire.",
    priceMonthly: 99.99,
    priceYearly: 959.9, // 99.99 × 12 × 0.80
    ctaLabel: "Passer Ultime",
    stripePriceMonthlyId: process.env.STRIPE_PRICE_ULTIME_MONTHLY,
    stripePriceYearlyId: process.env.STRIPE_PRICE_ULTIME_YEARLY,
    features: [
      "Tout Pro",
      "Accès anticipé aux nouvelles features",
      "Support prioritaire 24h",
      "Sessions live IA mensuelles",
      "Création de rooms publiques",
      "Multiplicateur Cash Phase 2",
    ],
  },
]

export const TRIAL_DAYS = 7

export function getPlan(id: Plan): PlanDef {
  const plan = PLANS.find((p) => p.id === id)
  if (!plan) throw new Error(`Unknown plan: ${id}`)
  return plan
}

export function isPaidPlan(plan: Plan): boolean {
  return plan !== "free"
}

export function planLevel(plan: Plan): number {
  return PLANS.findIndex((p) => p.id === plan)
}

export function hasAccess(userPlan: Plan, requiredPlan: Plan): boolean {
  return planLevel(userPlan) >= planLevel(requiredPlan)
}
