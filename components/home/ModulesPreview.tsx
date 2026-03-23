'use client';

import React from 'react';
import { motion } from 'framer-motion';
import modules from '@/data/modules';
import Tag from '@/components/ui/Tag';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

export default function ModulesPreview() {
  return (
    <section id="modules" className="px-6 py-28">
      <div className="mx-auto max-w-6xl">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center font-display text-3xl text-text sm:text-4xl"
        >
          17 Modules de Transformation
        </motion.h2>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {modules.map((mod) => (
            <motion.div
              key={mod.id}
              variants={cardVariants}
              className="group rounded-lg border border-border bg-bg-surface p-4 transition-all duration-300 hover:-translate-y-1 hover:border-jade/30 hover:shadow-[0_0_20px_rgba(111,207,138,0.06)]"
            >
              {/* Emoji */}
              <span className="text-[28px]" role="img" aria-hidden="true">
                {mod.emoji}
              </span>

              {/* Tag */}
              <div className="mt-2">
                <Tag label={mod.tag} color={mod.tagColor} />
              </div>

              {/* Name */}
              <h3 className="mt-2.5 text-[15px] font-medium text-text">
                {mod.name}
              </h3>

              {/* Description */}
              <p className="mt-1 text-[12px] leading-[1.7] text-muted">
                {mod.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
