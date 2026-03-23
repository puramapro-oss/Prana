'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import questions from '@/data/onboarding';
import { useProgramStore } from '@/lib/store/programStore';
import GeneratingScreen from './GeneratingScreen';

/* ------------------------------------------------------------------ */
/*  OnboardingFlow — Full-screen 5-step onboarding questionnaire       */
/* ------------------------------------------------------------------ */

export default function OnboardingFlow() {
  const { onboardingStep, setOnboardingStep, setOnboardingAnswer } =
    useProgramStore();

  const [selections, setSelections] = useState<Record<number, string[]>>({});
  const [direction, setDirection] = useState<1 | -1>(1);
  const [showGenerating, setShowGenerating] = useState(false);

  const current = questions[onboardingStep];

  /* ---- selection handlers ---- */
  const handleSelect = useCallback(
    (optionId: string) => {
      if (!current) return;

      if (current.type === 'single') {
        setSelections((prev) => ({ ...prev, [onboardingStep]: [optionId] }));
      } else {
        setSelections((prev) => {
          const existing = prev[onboardingStep] ?? [];
          const next = existing.includes(optionId)
            ? existing.filter((id) => id !== optionId)
            : [...existing, optionId];
          return { ...prev, [onboardingStep]: next };
        });
      }
    },
    [current, onboardingStep],
  );

  const isSelected = (optionId: string) =>
    (selections[onboardingStep] ?? []).includes(optionId);

  const hasSelection = (selections[onboardingStep] ?? []).length > 0;

  /* ---- navigation ---- */
  const handleNext = useCallback(() => {
    setOnboardingAnswer(
      onboardingStep,
      current?.type === 'single'
        ? selections[onboardingStep]?.[0]
        : selections[onboardingStep],
    );

    if (onboardingStep >= 4) {
      setShowGenerating(true);
      return;
    }

    setDirection(1);
    setOnboardingStep(onboardingStep + 1);
  }, [
    onboardingStep,
    selections,
    current,
    setOnboardingAnswer,
    setOnboardingStep,
  ]);

  const handleBack = useCallback(() => {
    if (onboardingStep <= 0) return;
    setDirection(-1);
    setOnboardingStep(onboardingStep - 1);
  }, [onboardingStep, setOnboardingStep]);

  /* ---- generating screen ---- */
  if (showGenerating) return <GeneratingScreen />;

  /* ---- framer-motion variants ---- */
  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  const progress = ((onboardingStep + 1) / questions.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg-primary">
      {/* ---- progress bar ---- */}
      <div className="h-1 w-full bg-dim/20">
        <motion.div
          className="h-full bg-jade"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
      </div>

      {/* ---- back button ---- */}
      {onboardingStep > 0 && (
        <button
          onClick={handleBack}
          className="absolute left-4 top-6 text-muted hover:text-text transition-colors text-sm"
        >
          &larr; Retour
        </button>
      )}

      {/* ---- step content ---- */}
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={onboardingStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="w-full max-w-xl"
          >
            {/* title & subtitle */}
            <div className="mb-8 text-center">
              <h2 className="font-display text-2xl tracking-display text-text mb-2">
                {current?.title}
              </h2>
              <p className="text-sm text-muted">{current?.subtitle}</p>
            </div>

            {/* option cards grid */}
            <div className="grid grid-cols-2 gap-3">
              {current?.options.map((option) => {
                const selected = isSelected(option.id);
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelect(option.id)}
                    className={`flex items-center gap-3 rounded-xl bg-bg-surface p-4 text-left transition-all duration-200 hover:bg-bg-surface-hover ${
                      selected
                        ? 'border-2 border-jade bg-jade-dim'
                        : 'border border-border'
                    }`}
                  >
                    <span className="text-2xl" role="img" aria-hidden="true">
                      {option.emoji}
                    </span>
                    <span className="text-sm text-text">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ---- bottom action ---- */}
      <div className="flex justify-center pb-10">
        <button
          disabled={!hasSelection}
          onClick={handleNext}
          className="rounded-full bg-jade px-10 py-3 font-mono text-xs uppercase tracking-label text-bg-primary transition-opacity disabled:opacity-30"
        >
          Suivant
        </button>
      </div>

      {/* ---- step indicator ---- */}
      <div className="absolute bottom-3 left-0 right-0 text-center">
        <span className="font-mono text-[10px] text-muted tracking-label">
          {onboardingStep + 1} / {questions.length}
        </span>
      </div>
    </div>
  );
}
