'use client';

import React from 'react';
import { motion } from 'framer-motion';
import modules from '@/data/modules';
import ModuleCard from './ModuleCard';

/* ------------------------------------------------------------------ */
/*  ModuleGrid — Responsive grid of module cards with stagger anim    */
/* ------------------------------------------------------------------ */

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export default function ModuleGrid() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {modules.map((mod) => (
        <motion.div key={mod.id} variants={item}>
          <ModuleCard module={mod} />
        </motion.div>
      ))}
    </motion.div>
  );
}
