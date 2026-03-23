'use client';

import React from 'react';

/* ------------------------------------------------------------------ */
/*  LevelBadge — Level indicator with left border accent               */
/* ------------------------------------------------------------------ */

type Level = 'Secret' | 'Ultime' | 'Ancestral' | 'Sacré';

interface LevelBadgeProps {
  level: Level;
}

const LEVEL_COLORS: Record<Level, { bg: string; text: string; border: string }> = {
  Secret: { bg: 'bg-violet-dim', text: 'text-violet', border: 'border-l-violet' },
  Ultime: { bg: 'bg-gold-dim', text: 'text-gold', border: 'border-l-gold' },
  Ancestral: { bg: 'bg-amber-dim', text: 'text-amber', border: 'border-l-amber' },
  Sacré: { bg: 'bg-rose-dim', text: 'text-rose', border: 'border-l-rose' },
};

export default function LevelBadge({ level }: LevelBadgeProps) {
  const { bg, text, border } = LEVEL_COLORS[level];

  return (
    <span
      className={`inline-block rounded-full border-l-2 ${border} ${bg} ${text} px-3 py-1 font-mono text-[10px] uppercase tracking-label`}
    >
      {level}
    </span>
  );
}
