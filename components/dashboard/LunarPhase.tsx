'use client';

import React from 'react';
import { useLunarPhase } from '@/lib/hooks/useLunarPhase';

/* ------------------------------------------------------------------ */
/*  LunarPhase — Compact lunar phase display card                      */
/* ------------------------------------------------------------------ */

export default function LunarPhase() {
  const { emoji, name, advice } = useLunarPhase();

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-5">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-label text-dim">
        Phase lunaire
      </p>

      <div className="flex items-start gap-4">
        {/* Moon emoji */}
        <span
          className="shrink-0 leading-none"
          style={{ fontSize: 40 }}
          role="img"
          aria-label={name}
        >
          {emoji}
        </span>

        {/* Phase info */}
        <div className="min-w-0 flex-1">
          <h3 className="font-mono text-sm font-medium text-text">
            {name}
          </h3>
          <p className="mt-1.5 font-display text-[14px] leading-[1.7] text-muted">
            {advice}
          </p>
        </div>
      </div>
    </div>
  );
}
