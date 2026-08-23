/**
 * PRANA — Advanced regulation protocols (Starter & Pro plans)
 * Extracted from protocols.ts to keep files under 300 lines.
 */

import type { ProtocolDefinition } from "./protocols"

export const ADVANCED_PROTOCOLS: ProtocolDefinition[] = [
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
