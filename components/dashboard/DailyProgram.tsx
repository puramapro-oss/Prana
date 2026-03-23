'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ParticleExplosion from '@/components/ui/ParticleExplosion';

/* ------------------------------------------------------------------ */
/*  DailyProgram — Practice checklist card for a given time period     */
/* ------------------------------------------------------------------ */

export interface Practice {
  id: string;
  name: string;
  emoji: string;
  duration: string;
  completed: boolean;
}

interface DailyProgramProps {
  practices: Practice[];
  period: 'morning' | 'afternoon' | 'evening';
  onToggle: (id: string) => void;
}

const PERIOD_HEADERS: Record<DailyProgramProps['period'], string> = {
  morning: '🌅 Matin',
  afternoon: '☀️ Après-midi',
  evening: '🌙 Soir',
};

interface ExplosionState {
  active: boolean;
  x: number;
  y: number;
}

export default function DailyProgram({ practices, period, onToggle }: DailyProgramProps) {
  const [explosion, setExplosion] = useState<ExplosionState>({
    active: false,
    x: 0,
    y: 0,
  });

  const handleToggle = useCallback(
    (id: string, event: React.MouseEvent<HTMLButtonElement>) => {
      const practice = practices.find((p) => p.id === id);
      // Only trigger explosion when completing (not uncompleting)
      if (practice && !practice.completed) {
        const rect = event.currentTarget.getBoundingClientRect();
        setExplosion({
          active: true,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }
      onToggle(id);
    },
    [practices, onToggle],
  );

  const handleExplosionComplete = useCallback(() => {
    setExplosion((prev) => ({ ...prev, active: false }));
  }, []);

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-5">
      <h3 className="mb-4 font-mono text-[11px] uppercase tracking-label text-muted">
        {PERIOD_HEADERS[period]}
      </h3>

      <ul className="space-y-3">
        {practices.map((practice) => (
          <li key={practice.id} className="flex items-center gap-3">
            {/* Checkbox */}
            <button
              type="button"
              onClick={(e) => handleToggle(practice.id, e)}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                practice.completed
                  ? 'border-jade bg-jade/20 text-jade'
                  : 'border-border bg-transparent text-transparent hover:border-jade/50'
              }`}
              aria-label={`Marquer ${practice.name} comme ${practice.completed ? 'non terminé' : 'terminé'}`}
            >
              <AnimatePresence>
                {practice.completed && (
                  <motion.svg
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 6l3 3 5-5" />
                  </motion.svg>
                )}
              </AnimatePresence>
            </button>

            {/* Emoji */}
            <span className="text-base" aria-hidden="true">
              {practice.emoji}
            </span>

            {/* Name */}
            <span
              className={`flex-1 text-sm transition-all ${
                practice.completed
                  ? 'text-muted line-through decoration-jade/40'
                  : 'text-text'
              }`}
            >
              {practice.name}
            </span>

            {/* Duration */}
            <span className="font-mono text-[11px] tracking-label text-dim">
              {practice.duration}
            </span>
          </li>
        ))}
      </ul>

      <ParticleExplosion
        active={explosion.active}
        x={explosion.x}
        y={explosion.y}
        onComplete={handleExplosionComplete}
      />
    </div>
  );
}
