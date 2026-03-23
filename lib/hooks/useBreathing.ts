'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/* ------------------------------------------------------------------ */
/*  Cardiac coherence breathing hook (5.5 breaths/min)                  */
/*  Cycle: 4s inhale → 1s hold → 5.5s exhale = 10.5s total             */
/* ------------------------------------------------------------------ */

export type BreathingPhase = 'inhale' | 'hold' | 'exhale';

interface BreathingState {
  /** Current phase of the breathing cycle */
  phase: BreathingPhase;
  /** Progress within the current phase, from 0 to 1 */
  progress: number;
  /** Total cycle duration in milliseconds */
  cycleDuration: number;
}

const INHALE_DURATION = 4000; // 4 s
const HOLD_DURATION = 1000; // 1 s
const EXHALE_DURATION = 5500; // 5.5 s
const CYCLE_DURATION = INHALE_DURATION + HOLD_DURATION + EXHALE_DURATION; // 10 500 ms

function getPhaseFromElapsed(elapsed: number): { phase: BreathingPhase; progress: number } {
  const t = elapsed % CYCLE_DURATION;

  if (t < INHALE_DURATION) {
    return { phase: 'inhale', progress: t / INHALE_DURATION };
  }

  if (t < INHALE_DURATION + HOLD_DURATION) {
    return { phase: 'hold', progress: (t - INHALE_DURATION) / HOLD_DURATION };
  }

  return {
    phase: 'exhale',
    progress: (t - INHALE_DURATION - HOLD_DURATION) / EXHALE_DURATION,
  };
}

export function useBreathing(): BreathingState {
  const [state, setState] = useState<BreathingState>({
    phase: 'inhale',
    progress: 0,
    cycleDuration: CYCLE_DURATION,
  });

  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  const tick = useCallback((timestamp: number) => {
    if (startRef.current === 0) {
      startRef.current = timestamp;
    }

    const elapsed = timestamp - startRef.current;
    const { phase, progress } = getPhaseFromElapsed(elapsed);

    setState({ phase, progress, cycleDuration: CYCLE_DURATION });

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [tick]);

  return state;
}
