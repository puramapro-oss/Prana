'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  PricingSection — Three-tier pricing cards with BLOOM highlighted    */
/* ------------------------------------------------------------------ */

interface PricingTier {
  name: string;
  slug: string;
  price: number;
  popular: boolean;
  features: string[];
}

const TIERS: PricingTier[] = [
  {
    name: 'SEED',
    slug: 'seed',
    price: 7,
    popular: false,
    features: [
      '3 modules',
      '10 techniques',
      'PRANA Coach (50 msg/mois)',
    ],
  },
  {
    name: 'BLOOM',
    slug: 'bloom',
    price: 17,
    popular: true,
    features: [
      '17 modules',
      '50+ techniques',
      'PRANA Coach illimit\u00e9',
      'PRANA Scan',
      'Programme IA',
    ],
  },
  {
    name: 'ASCEND',
    slug: 'ascend',
    price: 34,
    popular: false,
    features: [
      'Tout BLOOM +',
      'Coaching 1:1',
      'Acc\u00e8s communaut\u00e9 VIP',
      'Contenus exclusifs',
    ],
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

export default function PricingSection() {
  return (
    <section className="px-6 py-28">
      <div className="mx-auto max-w-5xl">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center font-display text-3xl text-text sm:text-4xl"
        >
          Choisissez votre parcours
        </motion.h2>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 items-center gap-6 md:grid-cols-3"
        >
          {TIERS.map((tier) => (
            <motion.div
              key={tier.slug}
              variants={cardVariants}
              className={`relative rounded-xl border p-6 transition-all duration-300 ${
                tier.popular
                  ? 'scale-[1.02] border-gold/40 bg-bg-surface shadow-[0_0_30px_rgba(201,168,76,0.08)]'
                  : 'border-border bg-bg-surface'
              }`}
            >
              {/* Popular badge */}
              {tier.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-4 py-1 font-mono text-[10px] uppercase tracking-label text-bg-primary">
                  Plus populaire
                </span>
              )}

              {/* Tier name */}
              <h3
                className={`font-mono text-[12px] uppercase tracking-label ${
                  tier.popular ? 'text-gold' : 'text-muted'
                }`}
              >
                {tier.name}
              </h3>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-[48px] font-light text-text">
                  {tier.price}
                </span>
                <span className="font-mono text-[12px] text-muted">
                  &euro;/mois
                </span>
              </div>

              {/* Divider */}
              <div
                className={`my-6 h-px ${
                  tier.popular ? 'bg-gold/20' : 'bg-border'
                }`}
              />

              {/* Features */}
              <ul className="space-y-3">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-[13px] leading-relaxed text-muted"
                  >
                    <span
                      className={`mt-0.5 text-[10px] ${
                        tier.popular ? 'text-gold' : 'text-jade'
                      }`}
                    >
                      &#10022;
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={`/signup?plan=${tier.slug}`}
                className={`mt-8 block w-full rounded-full py-3 text-center font-mono text-[11px] uppercase tracking-label transition-all ${
                  tier.popular
                    ? 'bg-gold text-bg-primary hover:brightness-110'
                    : 'border border-jade/40 text-jade hover:border-jade hover:bg-jade/5'
                }`}
              >
                Commencer
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
