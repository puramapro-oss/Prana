'use client';

import React, { useMemo } from 'react';

/* ------------------------------------------------------------------ */
/*  QuickPractice — Time-aware practice recommendation card            */
/* ------------------------------------------------------------------ */

interface PracticeOption {
  emoji: string;
  name: string;
  duration: string;
  description: string;
}

type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'night';

const PRACTICES: Record<TimePeriod, PracticeOption[]> = {
  morning: [
    {
      emoji: '🧊',
      name: 'Respiration Wim Hof',
      duration: '15 min',
      description: 'Trois cycles de respirations puissantes suivis de rétentions pour éveiller le corps et renforcer le système immunitaire.',
    },
    {
      emoji: '🙏',
      name: 'Méditation I AM',
      duration: '20 min',
      description: 'Affirmations profondes et visualisation pour ancrer votre identité et programmer votre journée.',
    },
  ],
  afternoon: [
    {
      emoji: '💚',
      name: 'Cohérence Cardiaque',
      duration: '5 min',
      description: 'Respiration guidée 5-5 pour synchroniser le cœur et le cerveau, réduire le stress et optimiser la concentration.',
    },
    {
      emoji: '🏃',
      name: 'Mouvement Conscient',
      duration: '20 min',
      description: 'Séquence de mouvements fluides mêlant yoga, qi gong et mobilité articulaire.',
    },
  ],
  evening: [
    {
      emoji: '✨',
      name: 'SATS (Neville Goddard)',
      duration: '15 min',
      description: 'Visualisation en état hypnagogique pour imprimer vos intentions dans le subconscient.',
    },
    {
      emoji: '😴',
      name: 'Yoga Nidra',
      duration: '25 min',
      description: 'Sommeil yogique guidé pour une relaxation profonde et une récupération cellulaire optimale.',
    },
  ],
  night: [
    {
      emoji: '🌙',
      name: 'Méditation du Silence',
      duration: '10 min',
      description: 'Immersion dans le silence intérieur pour calmer le mental et préparer un sommeil réparateur.',
    },
  ],
};

function getTimePeriod(): TimePeriod {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 24) return 'evening';
  return 'night';
}

export default function QuickPractice() {
  const practice = useMemo<PracticeOption>(() => {
    const period = getTimePeriod();
    const options = PRACTICES[period];
    // Pick a consistent option based on the day of the month
    const dayIndex = new Date().getDate() % options.length;
    return options[dayIndex];
  }, []);

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-5">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-label text-dim">
        Pratique recommandée
      </p>

      <div className="mb-4 flex items-start gap-3">
        <span className="text-2xl" aria-hidden="true">
          {practice.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-medium text-text">
            {practice.name}
          </h3>
          <p className="mt-0.5 font-mono text-[11px] tracking-label text-muted">
            {practice.duration}
          </p>
        </div>
      </div>

      <p className="mb-5 text-sm leading-relaxed text-muted">
        {practice.description}
      </p>

      <button
        type="button"
        className="w-full rounded-full bg-jade px-6 py-3 font-mono text-[11px] uppercase tracking-label text-bg-primary transition-all hover:brightness-110"
      >
        Commencer
      </button>
    </div>
  );
}
