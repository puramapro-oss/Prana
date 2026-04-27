/**
 * Mobile mirror of web's magic-buttons-config.ts.
 *
 * Same 12 buttons, lucide-react-native icons (vs lucide-react web), no className gradients
 * (NativeWind doesn't support arbitrary gradient strings) — instead we use a `colors` tuple
 * passed to expo-linear-gradient at render time.
 */

import {
  Sunrise,
  HeartPulse,
  Workflow,
  Focus,
  MoonStar,
  ShieldCheck,
  ZapOff,
  Inbox,
  CalendarRange,
  Brain,
  Users,
  BatteryLow,
} from "lucide-react-native"
import type { ComponentType } from "react"

export type MagicButtonSlug =
  | "save-day"
  | "stop-stress"
  | "anti-chaos"
  | "focus-tunnel"
  | "sleep-express"
  | "confidence"
  | "procrastination"
  | "inbox-clean"
  | "plan-7-days"
  | "mind-dump"
  | "room-of-day"
  | "exhausted"

export type Plan = "free" | "starter" | "pro" | "ultime"

export interface MagicButtonConfig {
  slug: MagicButtonSlug
  name: string
  description: string
  durationLabel: string
  plan: Plan
  Icon: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>
  /** Two-stop gradient for the card background. */
  gradient: [string, string]
  isFree: boolean
}

export const MAGIC_BUTTONS: MagicButtonConfig[] = [
  {
    slug: "save-day",
    name: "Sauve ma journée",
    description: "Reset express : un ancrage, une action, on repart.",
    durationLabel: "30 sec",
    plan: "free",
    Icon: Sunrise,
    gradient: ["rgba(251,191,36,0.30)", "rgba(244,114,182,0.10)"],
    isFree: true,
  },
  {
    slug: "stop-stress",
    name: "Stop stress",
    description: "4-7-8 + ancrage 5 sens. Système nerveux qui redescend.",
    durationLabel: "90 sec",
    plan: "free",
    Icon: HeartPulse,
    gradient: ["rgba(45,212,191,0.30)", "rgba(56,189,248,0.10)"],
    isFree: true,
  },
  {
    slug: "anti-chaos",
    name: "Anti-chaos",
    description: "Décharge en 3 sphères. Vue claire en 60 secondes.",
    durationLabel: "60 sec",
    plan: "free",
    Icon: Workflow,
    gradient: ["rgba(56,189,248,0.30)", "rgba(99,102,241,0.10)"],
    isFree: true,
  },
  {
    slug: "exhausted",
    name: "Mode épuisé",
    description: "Tu n'as plus rien. Une action minuscule. C'est tout.",
    durationLabel: "20 sec",
    plan: "free",
    Icon: BatteryLow,
    gradient: ["rgba(148,163,184,0.30)", "rgba(168,162,158,0.10)"],
    isFree: true,
  },
  {
    slug: "focus-tunnel",
    name: "Focus tunnel",
    description: "25 minutes ciblées. Distractions verrouillées.",
    durationLabel: "25 min",
    plan: "starter",
    Icon: Focus,
    gradient: ["rgba(129,140,248,0.30)", "rgba(217,70,239,0.10)"],
    isFree: false,
  },
  {
    slug: "sleep-express",
    name: "Sommeil express",
    description: "Ralentir le cœur, préparer la nuit.",
    durationLabel: "3 min",
    plan: "starter",
    Icon: MoonStar,
    gradient: ["rgba(99,102,241,0.30)", "rgba(56,189,248,0.10)"],
    isFree: false,
  },
  {
    slug: "confidence",
    name: "Confiance instant",
    description: "Posture, respiration, ancrage. Entrer en scène.",
    durationLabel: "60 sec",
    plan: "starter",
    Icon: ShieldCheck,
    gradient: ["rgba(251,191,36,0.30)", "rgba(249,115,22,0.10)"],
    isFree: false,
  },
  {
    slug: "procrastination",
    name: "Anti-procrastination",
    description: "Réduire la tâche au geste impossible à refuser.",
    durationLabel: "30 sec",
    plan: "starter",
    Icon: ZapOff,
    gradient: ["rgba(244,114,182,0.30)", "rgba(192,132,252,0.10)"],
    isFree: false,
  },
  {
    slug: "inbox-clean",
    name: "Inbox clean",
    description: "Trie sans lire. Décide, archive, libère.",
    durationLabel: "2 min",
    plan: "pro",
    Icon: Inbox,
    gradient: ["rgba(34,211,238,0.30)", "rgba(16,185,129,0.10)"],
    isFree: false,
  },
  {
    slug: "plan-7-days",
    name: "Plan 7 jours",
    description: "Une semaine claire, 1 priorité par jour. Ton Twin choisit.",
    durationLabel: "5 min",
    plan: "pro",
    Icon: CalendarRange,
    gradient: ["rgba(139,92,246,0.30)", "rgba(99,102,241,0.10)"],
    isFree: false,
  },
  {
    slug: "mind-dump",
    name: "Décharge mentale",
    description: "Tout sortir. L'IA classe en background. Tu respires.",
    durationLabel: "4 min",
    plan: "pro",
    Icon: Brain,
    gradient: ["rgba(217,70,239,0.30)", "rgba(168,85,247,0.10)"],
    isFree: false,
  },
  {
    slug: "room-of-day",
    name: "Room du jour",
    description: "Ton groupe t'attend. Action collective en 1 clic.",
    durationLabel: "—",
    plan: "pro",
    Icon: Users,
    gradient: ["rgba(52,211,153,0.30)", "rgba(34,211,238,0.10)"],
    isFree: false,
  },
]

const PLAN_TIER: Record<Plan, number> = { free: 0, starter: 1, pro: 2, ultime: 3 }

export function isAccessible(button: MagicButtonConfig, plan: Plan): boolean {
  return PLAN_TIER[plan] >= PLAN_TIER[button.plan]
}

export function findMagicButton(slug: string): MagicButtonConfig | null {
  return MAGIC_BUTTONS.find((b) => b.slug === slug) ?? null
}
