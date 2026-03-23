'use client';

import React from 'react';
import { motion } from 'framer-motion';
import ModuleGrid from '@/components/modules/ModuleGrid';
import { fadeInUp } from '@/lib/utils/animations';

/* ------------------------------------------------------------------ */
/*  Modules page — "Les 17 Modules"                                    */
/* ------------------------------------------------------------------ */

export default function ModulesPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <h1 className="font-display text-3xl tracking-display text-text md:text-4xl">
          Les 17 Modules
        </h1>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-label text-muted">
          Explorez chaque dimension de votre sant&eacute; holistique
        </p>
      </motion.div>

      {/* Module grid */}
      <ModuleGrid />
    </div>
  );
}
