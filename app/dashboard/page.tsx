'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import TodayGreeting from '@/components/dashboard/TodayGreeting';
import PranaMessage from '@/components/dashboard/PranaMessage';
import VitalityScore from '@/components/ui/VitalityScore';
import QuickPractice from '@/components/dashboard/QuickPractice';
import DailyProgram from '@/components/dashboard/DailyProgram';
import LunarPhase from '@/components/dashboard/LunarPhase';
import { staggerContainer, fadeInUp } from '@/lib/utils/animations';
import type { Practice } from '@/components/dashboard/DailyProgram';

/* ------------------------------------------------------------------ */
/*  Sample practices data                                              */
/* ------------------------------------------------------------------ */

const INITIAL_MORNING: Practice[] = [
  { id: '1', name: 'M\u00e9ditation I AM', emoji: '\u{1F64F}', duration: '15 min', completed: false },
  { id: '2', name: 'Respiration Wim Hof', emoji: '\u{1F9CA}', duration: '10 min', completed: false },
  { id: '3', name: 'Journaling', emoji: '\u{1F4DD}', duration: '5 min', completed: false },
];

const INITIAL_AFTERNOON: Practice[] = [
  { id: '4', name: 'Coh\u00e9rence Cardiaque', emoji: '\u{1F49A}', duration: '5 min', completed: false },
  { id: '5', name: 'Marche Consciente', emoji: '\u{1F6B6}', duration: '20 min', completed: false },
];

const INITIAL_EVENING: Practice[] = [
  { id: '6', name: 'SATS Neville Goddard', emoji: '\u{2728}', duration: '15 min', completed: false },
  { id: '7', name: 'Yoga Nidra', emoji: '\u{1F634}', duration: '20 min', completed: false },
];

/* ------------------------------------------------------------------ */
/*  Dashboard "Aujourd'hui" page                                       */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const [morningPractices, setMorningPractices] = useState<Practice[]>(INITIAL_MORNING);
  const [afternoonPractices, setAfternoonPractices] = useState<Practice[]>(INITIAL_AFTERNOON);
  const [eveningPractices, setEveningPractices] = useState<Practice[]>(INITIAL_EVENING);

  const togglePractice = useCallback(
    (id: string) => {
      const toggle = (list: Practice[]) =>
        list.map((p) => (p.id === id ? { ...p, completed: !p.completed } : p));

      setMorningPractices((prev) => toggle(prev));
      setAfternoonPractices((prev) => toggle(prev));
      setEveningPractices((prev) => toggle(prev));
    },
    [],
  );

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Greeting */}
      <motion.div variants={fadeInUp}>
        <TodayGreeting userName="Voyageur" />
      </motion.div>

      {/* Prana consciousness message */}
      <motion.div variants={fadeInUp}>
        <PranaMessage
          message="Aujourd'hui est un jour de renouveau. Laisse ton souffle te guider vers ta plus haute version. Chaque pratique est une graine plant\u00e9e dans le jardin de ton \u00eatre."
          isLoading={false}
        />
      </motion.div>

      {/* Vitality Score — centered */}
      <motion.div variants={fadeInUp} className="flex justify-center py-4">
        <VitalityScore score={72} size={140} />
      </motion.div>

      {/* Quick Practice recommendation */}
      <motion.div variants={fadeInUp}>
        <QuickPractice />
      </motion.div>

      {/* Daily Program — 3 time periods */}
      <motion.div
        variants={fadeInUp}
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
      >
        <DailyProgram
          practices={morningPractices}
          period="morning"
          onToggle={togglePractice}
        />
        <DailyProgram
          practices={afternoonPractices}
          period="afternoon"
          onToggle={togglePractice}
        />
        <DailyProgram
          practices={eveningPractices}
          period="evening"
          onToggle={togglePractice}
        />
      </motion.div>

      {/* Lunar Phase */}
      <motion.div variants={fadeInUp}>
        <LunarPhase />
      </motion.div>
    </motion.div>
  );
}
