import type { Plan } from "@/lib/supabase/types"
import { ADVANCED_PROTOCOLS } from "./protocols-advanced"

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

const FREE_PROTOCOLS: ProtocolDefinition[] = [
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
]

export const PROTOCOLS: ProtocolDefinition[] = [...FREE_PROTOCOLS, ...ADVANCED_PROTOCOLS]

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
