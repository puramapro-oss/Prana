'use client';

import React from 'react';

/* ------------------------------------------------------------------ */
/*  Tag — Small label with color-coded background                      */
/*  DM Mono, 10px, uppercase, letter-spacing 0.14em                    */
/* ------------------------------------------------------------------ */

interface TagProps {
  /** Text displayed inside the tag */
  label: string;
  /** Theme color name */
  color?: 'jade' | 'gold' | 'violet' | 'sage' | 'rose' | 'amber';
  /** Additional CSS classes */
  className?: string;
}

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  jade: { bg: 'bg-jade-dim', text: 'text-jade' },
  gold: { bg: 'bg-gold-dim', text: 'text-gold' },
  violet: { bg: 'bg-violet-dim', text: 'text-violet' },
  sage: { bg: 'bg-sage-dim', text: 'text-sage' },
  rose: { bg: 'bg-rose-dim', text: 'text-rose' },
  amber: { bg: 'bg-amber-dim', text: 'text-amber' },
};

export default function Tag({ label, color = 'jade', className = '' }: TagProps) {
  const { bg, text } = TAG_COLORS[color] ?? TAG_COLORS.jade;

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-label ${bg} ${text} ${className}`}
    >
      {label}
    </span>
  );
}
