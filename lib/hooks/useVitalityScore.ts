'use client';

import { useState, useEffect, useCallback } from 'react';

/* ------------------------------------------------------------------ */
/*  Vitality score hook                                                 */
/*  Weighted average of 4 sub-scores → overall score, color & label     */
/*  Weights: sleep 30%, energy 25%, nutrition 25%, practice 20%         */
/* ------------------------------------------------------------------ */

export interface VitalityInput {
  /** Sleep quality score (0–100) */
  sleep: number;
  /** Energy level score (0–100) */
  energy: number;
  /** Nutrition score (0–100) */
  nutrition: number;
  /** Practice / exercise score (0–100) */
  practice: number;
}

export interface VitalityResult {
  /** Weighted overall score (0–100) */
  overall: number;
  /** Semantic color: jade (>70), amber (40–70), rose (<40) */
  color: string;
  /** French label for the score range */
  label: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function computeVitality(input: VitalityInput): VitalityResult {
  const sleep = clamp(input.sleep, 0, 100);
  const energy = clamp(input.energy, 0, 100);
  const nutrition = clamp(input.nutrition, 0, 100);
  const practice = clamp(input.practice, 0, 100);

  const overall = Math.round(
    sleep * 0.3 + energy * 0.25 + nutrition * 0.25 + practice * 0.2,
  );

  let color: string;
  let label: string;

  if (overall > 70) {
    color = 'jade';
    label = 'Vitalité excellente';
  } else if (overall >= 40) {
    color = 'amber';
    label = 'Vitalité modérée';
  } else {
    color = 'rose';
    label = 'Vitalité faible';
  }

  return { overall, color, label };
}

const DEFAULT_INPUT: VitalityInput = { sleep: 0, energy: 0, nutrition: 0, practice: 0 };

export function useVitalityScore(input: VitalityInput = DEFAULT_INPUT): VitalityResult {
  const calculate = useCallback(() => computeVitality(input), [input]);

  const [result, setResult] = useState<VitalityResult>(() => calculate());

  useEffect(() => {
    setResult(calculate());
  }, [calculate]);

  return result;
}
