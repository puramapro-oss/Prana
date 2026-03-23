'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TechniqueRow from './TechniqueRow';

/* ------------------------------------------------------------------ */
/*  PillarCard — Expandable pillar with techniques list                */
/* ------------------------------------------------------------------ */

export interface PillarTechnique {
  name: string;
  enabled: boolean;
  duration: string;
}

export interface Pillar {
  name: string;
  icon: string;
  color: 'jade' | 'gold' | 'violet' | 'sage' | 'rose' | 'amber';
  description: string;
  techniques: PillarTechnique[];
}

interface PillarCardProps {
  pillar: Pillar;
  onToggleTechnique?: (index: number) => void;
  onAddTechnique?: () => void;
}

const BORDER_COLORS: Record<string, string> = {
  jade: 'border-l-jade',
  gold: 'border-l-gold',
  violet: 'border-l-violet',
  sage: 'border-l-sage',
  rose: 'border-l-rose',
  amber: 'border-l-amber',
};

export default function PillarCard({
  pillar,
  onToggleTechnique,
  onAddTechnique,
}: PillarCardProps) {
  const [expanded, setExpanded] = useState(false);
  const borderColor = BORDER_COLORS[pillar.color] ?? BORDER_COLORS.jade;

  return (
    <div
      className={`rounded-xl border border-border border-l-4 ${borderColor} bg-bg-surface overflow-hidden`}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-bg-surface-hover"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl" role="img" aria-hidden="true">
            {pillar.icon}
          </span>
          <div>
            <h3 className="text-sm font-medium text-text">{pillar.name}</h3>
            <p className="text-[11px] text-muted mt-0.5">{pillar.description}</p>
          </div>
        </div>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-muted text-sm shrink-0"
        >
          &#9662;
        </motion.span>
      </button>

      {/* Expandable body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-4 pb-4 pt-2">
              {/* Technique rows */}
              {pillar.techniques.map((tech, i) => (
                <TechniqueRow
                  key={i}
                  technique={tech}
                  onToggle={() => onToggleTechnique?.(i)}
                />
              ))}

              {/* Add technique button */}
              <button
                onClick={onAddTechnique}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2 text-[11px] font-mono uppercase tracking-label text-muted transition-colors hover:border-jade hover:text-jade"
              >
                + Ajouter technique
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
