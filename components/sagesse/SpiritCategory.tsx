'use client';

import React from 'react';
import TechniqueAccordion from './TechniqueAccordion';
import type { Technique } from '@/data/techniques';

/* ------------------------------------------------------------------ */
/*  SpiritCategory — Category section with technique accordions        */
/* ------------------------------------------------------------------ */

interface SpiritCategoryProps {
  title: string;
  icon: string;
  techniques: Technique[];
  color: 'jade' | 'gold' | 'violet' | 'sage' | 'rose' | 'amber';
}

const BG_COLORS: Record<string, string> = {
  jade: 'bg-jade/5',
  gold: 'bg-gold/5',
  violet: 'bg-violet/5',
  sage: 'bg-sage/5',
  rose: 'bg-rose/5',
  amber: 'bg-amber/5',
};

const TEXT_COLORS: Record<string, string> = {
  jade: 'text-jade',
  gold: 'text-gold',
  violet: 'text-violet',
  sage: 'text-sage',
  rose: 'text-rose',
  amber: 'text-amber',
};

export default function SpiritCategory({
  title,
  icon,
  techniques,
  color,
}: SpiritCategoryProps) {
  const bg = BG_COLORS[color] ?? BG_COLORS.jade;
  const textColor = TEXT_COLORS[color] ?? TEXT_COLORS.jade;

  return (
    <section className={`rounded-2xl ${bg} p-5 md:p-6`}>
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <span className="text-2xl" role="img" aria-hidden="true">
          {icon}
        </span>
        <h2 className="font-display text-lg tracking-display text-text">
          {title}
        </h2>
        <span
          className={`rounded-full bg-bg-surface px-2.5 py-0.5 font-mono text-[10px] tracking-label ${textColor}`}
        >
          {techniques.length}
        </span>
      </div>

      {/* Technique accordions grid */}
      <div className="grid grid-cols-1 gap-3">
        {techniques.map((technique) => (
          <TechniqueAccordion key={technique.id} technique={technique} />
        ))}
      </div>
    </section>
  );
}
