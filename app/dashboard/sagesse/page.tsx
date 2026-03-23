'use client';

import React from 'react';
import { motion } from 'framer-motion';
import categories from '@/data/techniques';
import SpiritCategory from '@/components/sagesse/SpiritCategory';
import { staggerContainer, fadeInUp } from '@/lib/utils/animations';
import type { Technique } from '@/data/techniques';

/* ------------------------------------------------------------------ */
/*  Sagesse page — "Techniques Sacrees"                                */
/* ------------------------------------------------------------------ */

/** Map data categories into the 3 spirit groups */
function groupTechniques(allCategories: typeof categories) {
  const allTechniques: Technique[] = allCategories.flatMap((c) => c.techniques);

  return {
    iAm: allTechniques.filter(
      (t) =>
        t.id === 'coherence-cardiaque' ||
        t.id === 'vipassana' ||
        t.id === 'mantra-om',
    ),
    tibetan: allTechniques.filter(
      (t) =>
        t.id === 'kapalabhati' ||
        t.id === 'trataka' ||
        t.id === 'bols-tibetains',
    ),
    universal: allTechniques.filter(
      (t) =>
        t.id === 'nadi-shodhana' ||
        t.id === 'yoga-nidra' ||
        t.id === 'chakra-dhyana' ||
        t.id === 'wim-hof' ||
        t.id === 'surya-namaskar' ||
        t.id === 'qi-gong-5',
    ),
  };
}

export default function SagessePage() {
  const groups = groupTechniques(categories);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={fadeInUp}>
        <h1 className="font-display text-3xl tracking-display text-text md:text-4xl">
          Techniques Sacr&eacute;es
        </h1>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-label text-muted">
          Sagesse ancestrale pour l&apos;&eacute;veil de la conscience
        </p>
      </motion.div>

      {/* Spirit categories */}
      <motion.div variants={fadeInUp}>
        <SpiritCategory
          title="I AM & Saint-Germain"
          icon="🕊️"
          techniques={groups.iAm}
          color="violet"
        />
      </motion.div>

      <motion.div variants={fadeInUp}>
        <SpiritCategory
          title="Moines Tib&eacute;tains"
          icon="🏔️"
          techniques={groups.tibetan}
          color="amber"
        />
      </motion.div>

      <motion.div variants={fadeInUp}>
        <SpiritCategory
          title="Traditions Secr&egrave;tes Universelles"
          icon="🌟"
          techniques={groups.universal}
          color="jade"
        />
      </motion.div>
    </motion.div>
  );
}
