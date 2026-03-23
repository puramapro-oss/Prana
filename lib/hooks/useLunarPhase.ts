'use client';

import { useState, useEffect } from 'react';

/* ------------------------------------------------------------------ */
/*  Lunar phase hook — pure calculation, no external API                */
/*  Synodic month ≈ 29.53 days from known new moon (Jan 6 2000)        */
/* ------------------------------------------------------------------ */

interface LunarPhaseState {
  /** French name of the phase */
  phase: string;
  /** Moon emoji for the phase */
  emoji: string;
  /** Alias — same as phase */
  name: string;
  /** Health-related advice in French */
  advice: string;
}

const SYNODIC_MONTH = 29.53058867; // days
const KNOWN_NEW_MOON = new Date(2000, 0, 6, 18, 14, 0).getTime(); // Jan 6 2000 18:14 UTC

interface PhaseInfo {
  name: string;
  emoji: string;
  advice: string;
}

const PHASES: PhaseInfo[] = [
  {
    name: 'Nouvelle Lune',
    emoji: '🌑',
    advice: 'Moment idéal pour se reposer et fixer de nouvelles intentions de santé.',
  },
  {
    name: 'Premier Croissant',
    emoji: '🌒',
    advice: 'L\'énergie monte doucement. Commencez de nouvelles habitudes alimentaires.',
  },
  {
    name: 'Premier Quartier',
    emoji: '🌓',
    advice: 'Bon moment pour intensifier l\'activité physique et les exercices.',
  },
  {
    name: 'Gibbeuse Croissante',
    emoji: '🌔',
    advice: 'Continuez vos efforts. Le corps assimile bien les nutriments.',
  },
  {
    name: 'Pleine Lune',
    emoji: '🌕',
    advice: 'Hydratez-vous bien. Le sommeil peut être perturbé, favorisez la relaxation.',
  },
  {
    name: 'Gibbeuse Décroissante',
    emoji: '🌖',
    advice: 'Phase de détoxification naturelle. Privilégiez les aliments légers.',
  },
  {
    name: 'Dernier Quartier',
    emoji: '🌗',
    advice: 'Temps de lâcher prise. Étirements et méditation recommandés.',
  },
  {
    name: 'Dernier Croissant',
    emoji: '🌘',
    advice: 'Préparez le renouveau. Repos et introspection favorisent la guérison.',
  },
];

function getLunarPhase(date: Date = new Date()): LunarPhaseState {
  const diffMs = date.getTime() - KNOWN_NEW_MOON;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const cyclePosition = ((diffDays % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;

  // Divide the synodic month into 8 equal phases
  const phaseIndex = Math.floor((cyclePosition / SYNODIC_MONTH) * 8) % 8;
  const info = PHASES[phaseIndex];

  return {
    phase: info.name,
    emoji: info.emoji,
    name: info.name,
    advice: info.advice,
  };
}

export function useLunarPhase(): LunarPhaseState {
  const [state, setState] = useState<LunarPhaseState>(() => getLunarPhase());

  useEffect(() => {
    // Recalculate once on mount (handles SSR → client mismatch)
    setState(getLunarPhase());
  }, []);

  return state;
}
