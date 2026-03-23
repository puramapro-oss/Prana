'use client';

import React from 'react';
import { motion } from 'framer-motion';

const REPLACED_APPS = [
  { name: 'Calm', price: '59€/an' },
  { name: 'MyFitnessPal', price: '79€' },
  { name: 'Noom', price: '199€' },
  { name: 'Sleep Cycle', price: '39€' },
  { name: 'Headspace', price: '69€' },
  { name: 'Flo', price: '49€' },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

export default function ValueSection() {
  return (
    <section className="relative overflow-hidden px-6 py-28">
      {/* Subtle gradient background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(111,207,138,0.02) 50%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-3xl text-center">
        {/* Title */}
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="font-display text-2xl leading-relaxed text-jade sm:text-3xl"
        >
          490&euro;/an en apps s&eacute;par&eacute;es &rarr; 17&euro;/mois tout inclus
        </motion.h2>

        {/* App badges */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-3"
        >
          {REPLACED_APPS.map((app) => (
            <motion.span
              key={app.name}
              variants={badgeVariants}
              className="inline-flex items-center gap-2 rounded-full bg-bg-surface px-4 py-2 font-mono text-[12px] text-muted line-through decoration-dim"
            >
              {app.name}{' '}
              <span className="text-dim">{app.price}</span>
            </motion.span>
          ))}
        </motion.div>

        {/* Economy callout */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="mt-10 font-mono text-[13px] tracking-wide text-gold"
        >
          &Eacute;conomie totale&nbsp;: 490&euro;/an
        </motion.p>
      </div>
    </section>
  );
}
