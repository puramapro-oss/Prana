'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  PRANA Scan — 6-step diagnostic wizard                              */
/* ------------------------------------------------------------------ */

interface QuestionnaireAnswers {
  [key: string]: string;
}

const STEPS = [
  { emoji: '📸', label: 'Analyse Visage' },
  { emoji: '🎙️', label: 'Analyse Vocale' },
  { emoji: '💅', label: 'Analyse Ongles' },
  { emoji: '❓', label: 'Questionnaire' },
  { emoji: '😴', label: 'Analyse Nuit' },
  { emoji: '🔮', label: 'Résultat' },
] as const;

const QUESTIONS = [
  { id: 'energy', question: 'Comment décririez-vous votre niveau d\u2019énergie au réveil\u00a0?' },
  { id: 'digestion', question: 'Comment se passe votre digestion en général\u00a0?' },
  { id: 'sleep', question: 'Quelle est la qualité de votre sommeil\u00a0?' },
  { id: 'stress', question: 'Quel est votre niveau de stress quotidien\u00a0?' },
  { id: 'focus', question: 'Comment évaluez-vous votre capacité de concentration\u00a0?' },
] as const;

const ANSWER_OPTIONS = ['Excellent', 'Bon', 'Moyen', 'Faible'] as const;

const SAMPLE_RESULTS = {
  dosha: 'Vata-Pitta',
  mtcType: 'Bois / Feu',
  stressLevel: 'Modéré',
  archetype: 'Le Guérisseur',
  recommendations: [
    'Privilégier les pratiques d\u2019ancrage le matin',
    'Intégrer la cohérence cardiaque 3 fois par jour',
    'Adopter une routine de sommeil régulière',
    'Réduire les stimulants après 14h',
  ],
};

/* ------------------------------------------------------------------ */
/*  Placeholder step component                                         */
/* ------------------------------------------------------------------ */

function PlaceholderStep({ emoji, title }: { emoji: string; title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-6xl mb-6">{emoji}</span>
      <h3 className="font-display text-xl tracking-display text-text mb-3">
        {title}
      </h3>
      <div className="rounded-full bg-jade-dim px-4 py-2">
        <span className="font-mono text-[11px] uppercase tracking-label text-jade">
          Bientôt disponible
        </span>
      </div>
      <p className="mt-4 max-w-sm text-sm text-muted leading-relaxed">
        Cette fonctionnalité sera disponible dans une prochaine mise à jour.
        Passez à l&apos;étape suivante pour continuer.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Questionnaire step                                                 */
/* ------------------------------------------------------------------ */

function QuestionnaireStep({
  answers,
  onAnswer,
}: {
  answers: QuestionnaireAnswers;
  onAnswer: (id: string, value: string) => void;
}) {
  return (
    <div className="space-y-6 py-4">
      {QUESTIONS.map((q) => (
        <div key={q.id} className="space-y-2">
          <p className="text-sm font-medium text-text">{q.question}</p>
          <div className="flex flex-wrap gap-2">
            {ANSWER_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onAnswer(q.id, option)}
                className={`rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-label transition-all ${
                  answers[q.id] === option
                    ? 'bg-jade text-bg-primary'
                    : 'border border-border text-muted hover:border-jade hover:text-jade'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Result step                                                        */
/* ------------------------------------------------------------------ */

function ResultStep() {
  return (
    <div className="space-y-6 py-4">
      {/* Profile cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Dosha', value: SAMPLE_RESULTS.dosha, emoji: '🌿' },
          { label: 'Type MTC', value: SAMPLE_RESULTS.mtcType, emoji: '⚖️' },
          { label: 'Stress', value: SAMPLE_RESULTS.stressLevel, emoji: '🧠' },
          { label: 'Archétype', value: SAMPLE_RESULTS.archetype, emoji: '✨' },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-border bg-bg-surface p-4 text-center"
          >
            <span className="text-2xl">{item.emoji}</span>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-label text-muted">
              {item.label}
            </p>
            <p className="mt-1 font-display text-base text-text">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="rounded-xl border border-border bg-bg-surface p-5">
        <h3 className="font-mono text-[11px] uppercase tracking-label text-muted mb-4">
          Recommandations
        </h3>
        <ul className="space-y-3">
          {SAMPLE_RESULTS.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-text">
              <span className="mt-0.5 text-jade shrink-0">&#10003;</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ScanPage                                                           */
/* ------------------------------------------------------------------ */

export default function ScanPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({});

  const handleAnswer = useCallback((id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }, []);

  const canGoNext = currentStep < STEPS.length - 1;
  const canGoBack = currentStep > 0;

  const goNext = useCallback(() => {
    if (canGoNext) setCurrentStep((s) => s + 1);
  }, [canGoNext]);

  const goBack = useCallback(() => {
    if (canGoBack) setCurrentStep((s) => s - 1);
  }, [canGoBack]);

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  /* Render content for the current step */
  function renderStep() {
    switch (currentStep) {
      case 0:
        return <PlaceholderStep emoji="📸" title="Analyse du Visage" />;
      case 1:
        return <PlaceholderStep emoji="🎙️" title="Analyse Vocale" />;
      case 2:
        return <PlaceholderStep emoji="💅" title="Analyse des Ongles" />;
      case 3:
        return (
          <QuestionnaireStep answers={answers} onAnswer={handleAnswer} />
        );
      case 4:
        return <PlaceholderStep emoji="😴" title="Configuration Analyse Nuit" />;
      case 5:
        return <ResultStep />;
      default:
        return null;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl tracking-display text-text md:text-4xl">
          PRANA Scan
        </h1>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-label text-muted">
          Diagnostic holistique personnalisé
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-label text-muted">
            Étape {currentStep + 1} / {STEPS.length}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-label text-muted">
            {STEPS[currentStep].emoji} {STEPS[currentStep].label}
          </span>
        </div>
        <div className="h-1 w-full rounded-full bg-dim/20">
          <motion.div
            className="h-full rounded-full bg-jade"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((step, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrentStep(i)}
            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm transition-all ${
              i === currentStep
                ? 'bg-jade text-bg-primary scale-110'
                : i < currentStep
                  ? 'bg-jade/20 text-jade'
                  : 'bg-bg-surface text-muted border border-border'
            }`}
            aria-label={step.label}
          >
            {step.emoji}
          </button>
        ))}
      </div>

      {/* Step content card */}
      <div className="rounded-xl border border-border bg-bg-surface p-5 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={goBack}
          disabled={!canGoBack}
          className="rounded-full border border-border px-6 py-2.5 font-mono text-[11px] uppercase tracking-label text-muted transition-colors hover:border-jade hover:text-jade disabled:opacity-30 disabled:hover:border-border disabled:hover:text-muted"
        >
          &larr; Précédent
        </button>

        {canGoNext ? (
          <button
            type="button"
            onClick={goNext}
            className="rounded-full bg-jade px-6 py-2.5 font-mono text-[11px] uppercase tracking-label text-bg-primary transition-opacity hover:opacity-90"
          >
            Suivant &rarr;
          </button>
        ) : (
          <button
            type="button"
            className="rounded-full bg-jade px-6 py-2.5 font-mono text-[11px] uppercase tracking-label text-bg-primary transition-opacity hover:opacity-90"
          >
            Terminer
          </button>
        )}
      </div>
    </div>
  );
}
