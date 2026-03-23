'use client';

import React, { useEffect } from 'react';
import { useProgramStore } from '@/lib/store/programStore';
import OnboardingFlow from '@/components/programme/OnboardingFlow';
import GeneratingScreen from '@/components/programme/GeneratingScreen';
import ProgramBuilder from '@/components/programme/ProgramBuilder';
import type { Programme } from '@/lib/supabase/types';

/* ------------------------------------------------------------------ */
/*  Sample programme for demo purposes                                 */
/* ------------------------------------------------------------------ */

const SAMPLE_PROGRAMME: Programme = {
  id: 'demo-programme',
  user_id: 'demo-user',
  goal: '\u00e9quilibre',
  level: 'interm\u00e9diaire',
  challenges: ['stress', 'sommeil'],
  time_available: '30min',
  spiritual_practices: ['meditation', 'breathwork'],
  morning_practices: [
    { title: 'M\u00e9ditation I AM', duration: 15, description: 'Affirmations profondes et visualisation.' },
    { title: 'Respiration Wim Hof', duration: 10, description: 'Trois cycles de respirations puissantes.' },
    { title: 'Journaling', duration: 5, description: '\u00c9criture contemplative matinale.' },
  ],
  afternoon_practices: [
    { title: 'Coh\u00e9rence Cardiaque', duration: 5, description: 'Respiration 5-5 synchronis\u00e9e.' },
    { title: 'Marche Consciente', duration: 20, description: 'Marche en pleine pr\u00e9sence.' },
  ],
  evening_practices: [
    { title: 'SATS Neville Goddard', duration: 15, description: 'Visualisation en \u00e9tat hypnagogique.' },
    { title: 'Yoga Nidra', duration: 20, description: 'Sommeil yogique guid\u00e9.' },
  ],
  active_pillars: ['respiration', 'meditation', 'mouvement'],
  active_techniques: { 'wim-hof': true, 'coherence-cardiaque': true, 'yoga-nidra': true },
  ia_message: 'Programme \u00e9quilibr\u00e9 adapt\u00e9 \u00e0 vos besoins.',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

/* ------------------------------------------------------------------ */
/*  Programme page                                                     */
/* ------------------------------------------------------------------ */

export default function ProgrammePage() {
  const { programme, isGenerating, setProgramme, updatePractices, setProgramme: resetProgramme } =
    useProgramStore();

  // Set sample programme on mount if store is empty
  useEffect(() => {
    if (!programme) {
      setProgramme(SAMPLE_PROGRAMME);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Show generating screen
  if (isGenerating) {
    return <GeneratingScreen />;
  }

  // Show onboarding if no programme
  if (!programme) {
    return <OnboardingFlow />;
  }

  // Show programme builder
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl tracking-display text-text md:text-3xl">
          Mon Programme
        </h1>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-label text-muted">
          Personnalis&eacute; par l&apos;intelligence PRANA
        </p>
      </div>

      <ProgramBuilder
        programme={programme}
        onUpdatePractices={updatePractices}
        onRecreate={() => {
          resetProgramme(null);
        }}
      />
    </div>
  );
}
