'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LivingOrb from '@/components/ui/LivingOrb';
import { useProgramStore } from '@/lib/store/programStore';

/* ------------------------------------------------------------------ */
/*  GeneratingScreen — Animated loading while programme is generated   */
/* ------------------------------------------------------------------ */

const ANALYSES = [
  'Analyse de votre profil énergétique...',
  'Intégration des pratiques ancestrales...',
  'Calibration du programme quantique...',
  'Harmonisation des piliers de santé...',
  'Finalisation de votre parcours unique...',
];

const DELAY_MS = 1500;

export default function GeneratingScreen() {
  const { setGenerating } = useProgramStore();
  const [visibleCount, setVisibleCount] = useState(0);
  const [dots, setDots] = useState('');

  /* animated dots cycling */
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  /* reveal analyses one by one */
  useEffect(() => {
    if (visibleCount >= ANALYSES.length) return;
    const timer = setTimeout(() => {
      setVisibleCount((c) => c + 1);
    }, DELAY_MS);
    return () => clearTimeout(timer);
  }, [visibleCount]);

  /* after all lines are shown, transition out */
  useEffect(() => {
    if (visibleCount < ANALYSES.length) return;
    const timer = setTimeout(() => {
      setGenerating(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [visibleCount, setGenerating]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg-primary">
      {/* Large pulsing orb */}
      <div className="mb-10">
        <LivingOrb size={120} color="violet" breathDuration={3000} />
      </div>

      {/* Title with animated dots */}
      <h2 className="font-display text-xl tracking-display text-text mb-8">
        Génération en cours{dots}
      </h2>

      {/* Analysis lines */}
      <div className="flex flex-col items-center gap-3 min-h-[180px]">
        <AnimatePresence>
          {ANALYSES.slice(0, visibleCount).map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`font-mono text-xs tracking-label ${
                i === visibleCount - 1 ? 'text-jade' : 'text-muted'
              }`}
            >
              {line}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
