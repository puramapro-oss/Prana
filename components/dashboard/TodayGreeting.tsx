'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useLunarPhase } from '@/lib/hooks/useLunarPhase';
import { getSeason, formatFrenchDate } from '@/lib/utils/dates';
import { fadeInUp } from '@/lib/utils/animations';
import type { Season } from '@/lib/utils/dates';

interface TodayGreetingProps {
  userName: string;
}

const SEASON_LABELS: Record<Season, { label: string; emoji: string }> = {
  spring: { label: 'Printemps', emoji: '🌸' },
  summer: { label: 'Été', emoji: '☀️' },
  autumn: { label: 'Automne', emoji: '🍂' },
  winter: { label: 'Hiver', emoji: '❄️' },
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Bonjour';
  if (hour >= 12 && hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

export default function TodayGreeting({ userName }: TodayGreetingProps) {
  const lunar = useLunarPhase();
  const now = new Date();
  const season = getSeason(now);
  const dateStr = formatFrenchDate(now);
  const { label: seasonLabel, emoji: seasonEmoji } = SEASON_LABELS[season];
  const greeting = getGreeting();

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="space-y-1"
    >
      <h1 className="font-display text-[28px] font-light tracking-wide text-text md:text-[36px]">
        {greeting}, {userName}
      </h1>
      <p className="font-mono text-[11px] uppercase tracking-label text-muted">
        {dateStr} &middot; Lune {lunar.emoji} &middot; Saison {seasonEmoji} {seasonLabel}
      </p>
    </motion.div>
  );
}
