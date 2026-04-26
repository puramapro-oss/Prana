import type { Plan } from "@/lib/supabase/types"

export type ProtocolStepType = "breath" | "ground" | "stretch" | "visualize" | "rest" | "say"

export interface ProtocolBreathStep {
  type: "breath"
  label: string
  inhale: number
  hold?: number
  exhale: number
  /** Optional second hold (after exhale, e.g. box breathing). */
  hold_after?: number
  repeats: number
}

export interface ProtocolTimedStep {
  type: Exclude<ProtocolStepType, "breath">
  label: string
  duration_seconds: number
}

export type ProtocolStep = ProtocolBreathStep | ProtocolTimedStep

export type ProtocolCategory =
  | "stress"
  | "anxiety"
  | "sleep"
  | "focus"
  | "anger"
  | "panic"
  | "fatigue"
  | "energy"

export interface ProtocolDefinition {
  slug: string
  name_fr: string
  name_en: string
  duration_seconds: number
  category: ProtocolCategory
  steps: ProtocolStep[]
  base_plan: Plan
  /** Short FR description displayed on the regulation list. */
  description_fr: string
  /** Mood emoji or single letter for the card hero. */
  hero: string
}

export const PROTOCOLS: ProtocolDefinition[] = [
  {
    slug: "stop-stress",
    name_fr: "Stop stress",
    name_en: "Stop stress",
    duration_seconds: 90,
    category: "stress",
    base_plan: "free",
    description_fr: "Respiration 4-7-8 + ancrage 5 sens. Le système nerveux redescend.",
    hero: "🌊",
    steps: [
      {
        type: "breath",
        label: "Respiration 4-7-8",
        inhale: 4,
        hold: 7,
        exhale: 8,
        repeats: 4,
      },
      {
        type: "ground",
        label: "Nomme 3 choses que tu vois autour de toi",
        duration_seconds: 12,
      },
    ],
  },
  {
    slug: "physiological-sigh",
    name_fr: "Soupir physiologique",
    name_en: "Physiological sigh",
    duration_seconds: 30,
    category: "stress",
    base_plan: "free",
    description_fr: "Deux inspirations enchaînées + une longue expiration. Effet immédiat.",
    hero: "💨",
    steps: [
      {
        type: "say",
        label: "Inspire fort par le nez. Puis re-inspire un peu plus. Expire longuement par la bouche.",
        duration_seconds: 6,
      },
      {
        type: "breath",
        label: "Soupir physiologique × 5",
        inhale: 3,
        exhale: 5,
        repeats: 5,
      },
    ],
  },
  {
    slug: "panic-relief",
    name_fr: "Apaiser la panique",
    name_en: "Panic relief",
    duration_seconds: 180,
    category: "panic",
    base_plan: "free",
    description_fr: "Cohérence cardiaque 5-5 douce. Le rythme cardiaque se cale.",
    hero: "🫁",
    steps: [
      {
        type: "say",
        label: "Pose une main sur ton ventre. Tu n'es pas en danger.",
        duration_seconds: 6,
      },
      {
        type: "breath",
        label: "Cohérence 5-5",
        inhale: 5,
        exhale: 5,
        repeats: 16,
      },
    ],
  },
  {
    slug: "grounding-5-senses",
    name_fr: "Ancrage 5-4-3-2-1",
    name_en: "5-senses grounding",
    duration_seconds: 90,
    category: "anxiety",
    base_plan: "free",
    description_fr: "5 vues, 4 sons, 3 contacts, 2 odeurs, 1 goût. Tu reviens dans le présent.",
    hero: "🌱",
    steps: [
      { type: "ground", label: "5 choses que tu vois", duration_seconds: 18 },
      { type: "ground", label: "4 sons que tu entends", duration_seconds: 18 },
      { type: "ground", label: "3 textures que tu touches", duration_seconds: 18 },
      { type: "ground", label: "2 odeurs", duration_seconds: 18 },
      { type: "ground", label: "1 goût dans ta bouche", duration_seconds: 18 },
    ],
  },
  {
    slug: "box-breathing",
    name_fr: "Respiration carrée",
    name_en: "Box breathing",
    duration_seconds: 120,
    category: "focus",
    base_plan: "free",
    description_fr: "4-4-4-4. La respiration des navy seals avant l'action.",
    hero: "⬜",
    steps: [
      {
        type: "breath",
        label: "Carré 4-4-4-4",
        inhale: 4,
        hold: 4,
        exhale: 4,
        hold_after: 4,
        repeats: 8,
      },
    ],
  },
  {
    slug: "anger-cool",
    name_fr: "Refroidir la colère",
    name_en: "Cool the anger",
    duration_seconds: 60,
    category: "anger",
    base_plan: "free",
    description_fr: "5 soupirs physiologiques + relâchement de la mâchoire.",
    hero: "🧊",
    steps: [
      {
        type: "say",
        label: "Desserre la mâchoire. Laisse tomber les épaules.",
        duration_seconds: 5,
      },
      {
        type: "breath",
        label: "Soupirs physiologiques × 5",
        inhale: 3,
        exhale: 6,
        repeats: 5,
      },
      { type: "rest", label: "Reste là. Sans rien décider.", duration_seconds: 10 },
    ],
  },
  {
    slug: "morning-energize",
    name_fr: "Énergie du matin",
    name_en: "Morning energize",
    duration_seconds: 90,
    category: "energy",
    base_plan: "starter",
    description_fr: "Respiration énergisante + étirement vertical. On démarre.",
    hero: "🌅",
    steps: [
      {
        type: "stretch",
        label: "Étire les bras vers le ciel. Sens la colonne s'allonger.",
        duration_seconds: 15,
      },
      {
        type: "breath",
        label: "Respiration énergisante (inspire 2, expire 1)",
        inhale: 2,
        exhale: 1,
        repeats: 20,
      },
      {
        type: "say",
        label: "Une intention pour la journée. En une phrase.",
        duration_seconds: 12,
      },
    ],
  },
  {
    slug: "sleep-express",
    name_fr: "Sommeil express",
    name_en: "Sleep express",
    duration_seconds: 180,
    category: "sleep",
    base_plan: "starter",
    description_fr: "4-7-8 long + visualisation. Le corps s'enfonce dans le matelas.",
    hero: "🌙",
    steps: [
      {
        type: "breath",
        label: "Respiration 4-7-8",
        inhale: 4,
        hold: 7,
        exhale: 8,
        repeats: 7,
      },
      {
        type: "visualize",
        label: "Sens ton corps qui s'enfonce dans le matelas, du sommet du crâne aux pieds.",
        duration_seconds: 25,
      },
    ],
  },
  {
    slug: "coherent-5-5",
    name_fr: "Cohérence 5-5",
    name_en: "Coherent 5-5",
    duration_seconds: 300,
    category: "focus",
    base_plan: "starter",
    description_fr: "5 minutes pour aligner cœur, respiration, attention.",
    hero: "🎯",
    steps: [
      {
        type: "breath",
        label: "Cohérence cardiaque 5-5",
        inhale: 5,
        exhale: 5,
        repeats: 30,
      },
    ],
  },
  {
    slug: "body-scan-90s",
    name_fr: "Scan corporel 90s",
    name_en: "90s body scan",
    duration_seconds: 90,
    category: "fatigue",
    base_plan: "starter",
    description_fr: "Du sommet du crâne aux pieds. On note, sans changer.",
    hero: "🧘",
    steps: [
      { type: "ground", label: "Sommet du crâne · front · mâchoire", duration_seconds: 15 },
      { type: "ground", label: "Cou · épaules · bras · mains", duration_seconds: 18 },
      { type: "ground", label: "Poitrine · ventre · dos", duration_seconds: 18 },
      { type: "ground", label: "Bassin · cuisses · genoux", duration_seconds: 18 },
      { type: "ground", label: "Mollets · chevilles · pieds", duration_seconds: 21 },
    ],
  },
  {
    slug: "let-go",
    name_fr: "Lâcher prise",
    name_en: "Let go",
    duration_seconds: 90,
    category: "stress",
    base_plan: "free",
    description_fr: "Une chose que tu portes trop. Tu la déposes en respirant.",
    hero: "🪶",
    steps: [
      {
        type: "say",
        label: "Pense à UNE chose que tu portes trop en ce moment.",
        duration_seconds: 8,
      },
      {
        type: "breath",
        label: "Respiration de relâchement (4 / 7)",
        inhale: 4,
        exhale: 7,
        repeats: 6,
      },
      {
        type: "visualize",
        label: "À chaque expire, imagine que cette charge sort par les pieds.",
        duration_seconds: 16,
      },
    ],
  },
  {
    slug: "wim-hof-light",
    name_fr: "Souffle énergisant",
    name_en: "Energizing breath",
    duration_seconds: 180,
    category: "energy",
    base_plan: "pro",
    description_fr: "Inspirations rapides puis apnée douce. Vigilance après le café.",
    hero: "⚡",
    steps: [
      {
        type: "say",
        label: "Assieds-toi. Pas debout, pas en voiture, pas dans l'eau. Important.",
        duration_seconds: 6,
      },
      {
        type: "breath",
        label: "30 inspirations amples sans pause",
        inhale: 1,
        exhale: 1,
        repeats: 30,
      },
      {
        type: "rest",
        label: "Apnée douce après l'expiration. Le temps qui te paraît juste.",
        duration_seconds: 30,
      },
      {
        type: "breath",
        label: "Inspiration profonde + apnée 15s",
        inhale: 5,
        hold: 15,
        exhale: 5,
        repeats: 1,
      },
      {
        type: "rest",
        label: "Reviens à ton souffle naturel.",
        duration_seconds: 30,
      },
    ],
  },
]

export function findProtocol(slug: string): ProtocolDefinition | null {
  return PROTOCOLS.find((p) => p.slug === slug) ?? null
}

export const PROTOCOL_CATEGORIES: { value: ProtocolCategory | "all"; label: string }[] = [
  { value: "all", label: "Tout" },
  { value: "stress", label: "Stress" },
  { value: "anxiety", label: "Anxiété" },
  { value: "panic", label: "Panique" },
  { value: "sleep", label: "Sommeil" },
  { value: "focus", label: "Focus" },
  { value: "anger", label: "Colère" },
  { value: "energy", label: "Énergie" },
  { value: "fatigue", label: "Fatigue" },
]
