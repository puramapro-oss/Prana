/* ------------------------------------------------------------------ */
/*  Reusable Framer Motion animation variants for the PRANA app        */
/* ------------------------------------------------------------------ */

import type { Variants } from 'framer-motion';

/**
 * Fade in from below with a slight upward slide.
 * Usage: <motion.div variants={fadeInUp} initial="hidden" animate="visible">
 */
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const,
    },
  },
};

/**
 * Container variant that staggers its children.
 * Usage: <motion.div variants={staggerContainer} initial="hidden" animate="visible">
 *          <motion.div variants={fadeInUp} />
 *          <motion.div variants={fadeInUp} />
 *        </motion.div>
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

/**
 * Scale in from a slightly smaller size.
 * Great for cards, modals, and interactive elements.
 */
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut' as const,
    },
  },
};

/**
 * Slide in from the left edge.
 */
export const slideInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -40,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const,
    },
  },
};

/**
 * Slide in from the right edge.
 */
export const slideInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 40,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const,
    },
  },
};
