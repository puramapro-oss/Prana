import type { LucideIcon } from "lucide-react"
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
} from "lucide-react"
import type { Plan } from "@/lib/supabase/types"

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

export interface MagicButtonConfig {
  slug: MagicButtonSlug
  name: string
  description: string
  durationLabel: string
  /** Minimum plan required. */
  plan: Plan
  icon: LucideIcon
  /** Tailwind gradient classes for the card accent. */
  accent: string
  /** When true, included in the free daily quota of 3. */
  isFree: boolean
}

export const MAGIC_BUTTONS: MagicButtonConfig[] = [
  {
    slug: "save-day",
    name: "Sauve ma journée",
    description: "Reset express : un seul ancrage, une seule action, on repart.",
    durationLabel: "30 sec",
    plan: "free",
    icon: Sunrise,
    accent: "from-amber-400/30 via-orange-400/20 to-rose-400/10",
    isFree: true,
  },
  {
    slug: "stop-stress",
    name: "Stop stress",
    description: "Respiration 4-7-8 + ancrage 5 sens. Le système nerveux redescend.",
    durationLabel: "90 sec",
    plan: "free",
    icon: HeartPulse,
    accent: "from-teal-400/30 via-emerald-400/20 to-sky-400/10",
    isFree: true,
  },
  {
    slug: "anti-chaos",
    name: "Anti-chaos",
    description: "Décharge la tête en 3 sphères. Tu vois clair en 60 secondes.",
    durationLabel: "60 sec",
    plan: "free",
    icon: Workflow,
    accent: "from-sky-400/30 via-blue-400/20 to-indigo-400/10",
    isFree: true,
  },
  {
    slug: "exhausted",
    name: "Mode épuisé",
    description: "Tu n'as plus rien. On garde une seule action minuscule.",
    durationLabel: "20 sec",
    plan: "free",
    icon: BatteryLow,
    accent: "from-slate-400/30 via-zinc-400/20 to-stone-400/10",
    isFree: true,
  },
  {
    slug: "focus-tunnel",
    name: "Focus tunnel",
    description: "25 minutes ciblées. Distractions verrouillées. Tu sors clair·e.",
    durationLabel: "25 min",
    plan: "starter",
    icon: Focus,
    accent: "from-indigo-400/30 via-violet-400/20 to-fuchsia-400/10",
    isFree: false,
  },
  {
    slug: "sleep-express",
    name: "Sommeil express",
    description: "Trois minutes pour ralentir le cœur et préparer la nuit.",
    durationLabel: "3 min",
    plan: "starter",
    icon: MoonStar,
    accent: "from-indigo-500/25 via-blue-500/15 to-sky-400/10",
    isFree: false,
  },
  {
    slug: "confidence",
    name: "Confiance instant",
    description: "Posture, respiration, ancrage : 60 secondes pour entrer en scène.",
    durationLabel: "60 sec",
    plan: "starter",
    icon: ShieldCheck,
    accent: "from-amber-400/30 via-yellow-400/20 to-orange-400/10",
    isFree: false,
  },
  {
    slug: "procrastination",
    name: "Anti-procrastination",
    description: "Réduit la tâche jusqu'au geste impossible à refuser.",
    durationLabel: "30 sec",
    plan: "starter",
    icon: ZapOff,
    accent: "from-rose-400/30 via-pink-400/20 to-fuchsia-400/10",
    isFree: false,
  },
  {
    slug: "inbox-clean",
    name: "Inbox clean",
    description: "Trie ta boîte sans la lire. Décide, archive, libère.",
    durationLabel: "2 min",
    plan: "pro",
    icon: Inbox,
    accent: "from-cyan-400/30 via-teal-400/20 to-emerald-400/10",
    isFree: false,
  },
  {
    slug: "plan-7-days",
    name: "Plan 7 jours",
    description: "Une semaine claire, 1 priorité par jour, ton Twin choisit.",
    durationLabel: "5 min",
    plan: "pro",
    icon: CalendarRange,
    accent: "from-violet-500/25 via-purple-500/15 to-indigo-500/10",
    isFree: false,
  },
  {
    slug: "mind-dump",
    name: "Décharge mentale",
    description: "Tout sortir. L'IA classe en background. Tu respires.",
    durationLabel: "4 min",
    plan: "pro",
    icon: Brain,
    accent: "from-fuchsia-400/30 via-pink-400/20 to-purple-400/10",
    isFree: false,
  },
  {
    slug: "room-of-day",
    name: "Room du jour",
    description: "Ton groupe t'attend. Action collective d'aujourd'hui en 1 clic.",
    durationLabel: "Variable",
    plan: "pro",
    icon: Users,
    accent: "from-emerald-400/30 via-teal-400/20 to-cyan-400/10",
    isFree: false,
  },
]

export function findMagicButton(slug: string): MagicButtonConfig | null {
  return MAGIC_BUTTONS.find((b) => b.slug === slug) ?? null
}

const PLAN_TIER: Record<Plan, number> = { free: 0, starter: 1, pro: 2, ultime: 3 }

export function isMagicButtonAccessible(button: MagicButtonConfig, userPlan: Plan): boolean {
  return PLAN_TIER[userPlan] >= PLAN_TIER[button.plan]
}
