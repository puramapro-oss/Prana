'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LevelBadge from '@/components/ui/LevelBadge';
import type { Technique } from '@/data/techniques';

/* ------------------------------------------------------------------ */
/*  TechniqueAccordion — Expandable technique card for Sagesse         */
/* ------------------------------------------------------------------ */

interface TechniqueAccordionProps {
  technique: Technique;
}

export default function TechniqueAccordion({
  technique,
}: TechniqueAccordionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-bg-surface overflow-hidden">
      {/* ---- Header ---- */}
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-bg-surface-hover"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-sm font-medium text-text truncate">
            {technique.name}
          </span>
          <LevelBadge level={technique.level} />
          <span className="hidden font-mono text-[10px] text-muted tracking-label sm:inline">
            {technique.origin}
          </span>
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-muted text-sm shrink-0"
        >
          &#9662;
        </motion.span>
      </button>

      {/* ---- Expandable body ---- */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-4 pb-4 pt-3 space-y-4">
              {/* Description */}
              <p className="text-[13px] leading-relaxed text-muted">
                {technique.description}
              </p>

              {/* Origin (mobile) */}
              <p className="font-mono text-[10px] text-muted tracking-label sm:hidden">
                {technique.origin}
              </p>

              {/* Duration */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-label text-jade">
                  Durée
                </span>
                <span className="text-[12px] text-text">{technique.duration}</span>
              </div>

              {/* Steps */}
              <div>
                <h4 className="text-[11px] font-mono uppercase tracking-label text-jade mb-2">
                  Étapes
                </h4>
                <ol className="space-y-1.5 list-decimal list-inside">
                  {technique.steps.map((step, i) => (
                    <li key={i} className="text-[12px] leading-relaxed text-muted">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Benefits */}
              <div>
                <h4 className="text-[11px] font-mono uppercase tracking-label text-jade mb-2">
                  Bénéfices
                </h4>
                <div className="flex flex-wrap gap-2">
                  {technique.benefits.map((benefit, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-jade-dim px-3 py-1 text-[10px] font-mono uppercase tracking-label text-jade"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
