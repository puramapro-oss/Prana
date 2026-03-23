'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import LivingOrb from '@/components/ui/LivingOrb';
import GlowBackground from '@/components/ui/GlowBackground';

const INTRO_TEXT = 'Respire. Tu es arrivé.';
const LETTER_DELAY = 80; // ms per letter
const INTRO_DURATION = 3000; // total intro ms

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
};

export default function HeroSection() {
  const [introVisible, setIntroVisible] = useState(true);
  const [revealedCount, setRevealedCount] = useState(0);

  /* Letter-by-letter reveal */
  useEffect(() => {
    if (!introVisible) return;
    if (revealedCount >= INTRO_TEXT.length) return;

    const timer = setTimeout(() => {
      setRevealedCount((c) => c + 1);
    }, LETTER_DELAY);

    return () => clearTimeout(timer);
  }, [revealedCount, introVisible]);

  /* Auto-dismiss intro after INTRO_DURATION - 500ms fade */
  useEffect(() => {
    const timer = setTimeout(() => {
      setIntroVisible(false);
    }, INTRO_DURATION - 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <GlowBackground />

      {/* ── Hypnotic Intro ── */}
      <AnimatePresence>
        {introVisible && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black"
          >
            {/* Orb fade-in */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            >
              <LivingOrb size={100} />
            </motion.div>

            {/* Letter-by-letter text */}
            <p
              className="mt-8 font-display text-[28px] tracking-wide"
              style={{ color: 'var(--jade)' }}
              aria-label={INTRO_TEXT}
            >
              {INTRO_TEXT.split('').map((char, i) => (
                <span
                  key={i}
                  className="inline-block transition-opacity duration-300"
                  style={{ opacity: i < revealedCount ? 1 : 0 }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Full Hero ── */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate={introVisible ? 'hidden' : 'visible'}
        className="relative z-10 flex flex-col items-center px-6 py-24 text-center"
      >
        {/* Orb */}
        <motion.div variants={fadeUp}>
          <LivingOrb size={160} />
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={fadeUp}
          className="mt-10 font-display font-light tracking-display text-jade-light"
          style={{ fontSize: 'clamp(68px, 10vw, 120px)' }}
        >
          PRANA
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          className="mt-3 font-mono text-[11px] uppercase tracking-label text-muted"
        >
          OS DE SANT&Eacute; HOLISTIQUE
        </motion.p>

        {/* Description */}
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-8 max-w-lg font-display text-[18px] leading-[1.85] text-muted"
        >
          Un &eacute;cosyst&egrave;me complet qui unit respiration, m&eacute;ditation, nutrition,
          mouvement et sommeil en un seul parcours personnalis&eacute; par l&rsquo;intelligence
          artificielle.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={fadeUp}
          className="mt-10 flex flex-col gap-4 sm:flex-row"
        >
          <Link
            href="/signup?plan=bloom"
            className="rounded-full bg-jade px-8 py-3.5 font-mono text-[11px] uppercase tracking-label text-bg-primary transition-all hover:brightness-110"
          >
            Cr&eacute;er mon programme IA
          </Link>
          <Link
            href="#modules"
            className="rounded-full border border-jade/40 px-8 py-3.5 font-mono text-[11px] uppercase tracking-label text-jade transition-all hover:border-jade hover:bg-jade/5"
          >
            Les 17 modules &rarr;
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.p
          variants={fadeUp}
          className="mt-14 font-mono text-[11px] tracking-wide text-dim"
        >
          17 modules &middot; 50+ techniques &middot; &infin; personnalisation
        </motion.p>
      </motion.div>
    </section>
  );
}
