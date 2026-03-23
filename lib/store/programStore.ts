import { create } from 'zustand';
import type { Programme, PracticeBlock } from '@/lib/supabase/types';

/* ------------------------------------------------------------------ */
/*  Programme / onboarding state                                       */
/* ------------------------------------------------------------------ */

interface OnboardingAnswers {
  [step: number]: unknown;
}

interface ProgramState {
  programme: Programme | null;
  isGenerating: boolean;
  onboardingStep: number;
  onboardingAnswers: OnboardingAnswers;

  setProgramme: (programme: Programme | null) => void;
  setOnboardingStep: (step: number) => void;
  setOnboardingAnswer: (step: number, answer: unknown) => void;
  setGenerating: (generating: boolean) => void;
  toggleTechnique: (key: string) => void;
  updatePractices: (
    period: 'morning_practices' | 'afternoon_practices' | 'evening_practices',
    practices: PracticeBlock[],
  ) => void;
}

export const useProgramStore = create<ProgramState>((set) => ({
  programme: null,
  isGenerating: false,
  onboardingStep: 0,
  onboardingAnswers: {},

  setProgramme: (programme) => set({ programme }),

  setOnboardingStep: (step) =>
    set({ onboardingStep: Math.min(Math.max(step, 0), 5) }),

  setOnboardingAnswer: (step, answer) =>
    set((state) => ({
      onboardingAnswers: { ...state.onboardingAnswers, [step]: answer },
    })),

  setGenerating: (generating) => set({ isGenerating: generating }),

  toggleTechnique: (key) =>
    set((state) => {
      if (!state.programme) return state;
      const current = state.programme.active_techniques as Record<string, boolean>;
      return {
        programme: {
          ...state.programme,
          active_techniques: { ...current, [key]: !current[key] },
        },
      };
    }),

  updatePractices: (period, practices) =>
    set((state) => {
      if (!state.programme) return state;
      return {
        programme: { ...state.programme, [period]: practices },
      };
    }),
}));
