'use client';

import React from 'react';
import { useBreathing } from '@/lib/hooks/useBreathing';

/* ------------------------------------------------------------------ */
/*  BreathingGuide — Subtle pulsing circle for cardiac coherence       */
/*  Fixed bottom-right, syncs with the useBreathing hook               */
/* ------------------------------------------------------------------ */

function getScale(phase: string, progress: number): number {
  switch (phase) {
    case 'inhale':
      return 1 + progress * 0.4; // 1 → 1.4
    case 'hold':
      return 1.4;
    case 'exhale':
      return 1.4 - progress * 0.4; // 1.4 → 1
    default:
      return 1;
  }
}

export default function BreathingGuide() {
  const { phase, progress } = useBreathing();
  const scale = getScale(phase, progress);

  return (
    <div
      className="fixed bottom-6 right-6 z-50 group"
      role="status"
      aria-label="Breathing guide"
    >
      {/* Tooltip */}
      <div
        className="absolute bottom-10 right-0 whitespace-nowrap rounded-lg px-3 py-1.5 font-mono text-[10px] uppercase tracking-label opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none"
        style={{
          background: 'var(--bg-surface)',
          color: 'var(--jade)',
          border: '1px solid var(--border)',
        }}
      >
        Respire avec moi &bull; Coh&eacute;rence cardiaque
      </div>

      {/* Pulsing circle */}
      <div
        className="rounded-full cursor-default"
        style={{
          width: 32,
          height: 32,
          backgroundColor: 'var(--jade)',
          opacity: 0.6,
          transform: `scale(${scale})`,
          transition: 'transform 150ms ease-out',
          boxShadow: `0 0 ${12 * scale}px rgba(111, 207, 138, ${0.2 * scale})`,
        }}
      />
    </div>
  );
}
