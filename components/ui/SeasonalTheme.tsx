'use client';

import { useSeasonalTheme } from '@/lib/hooks/useSeasonalTheme';
import { useGoldenHour } from '@/lib/hooks/useGoldenHour';

/* ------------------------------------------------------------------ */
/*  SeasonalTheme — Invisible client component that applies            */
/*  seasonal data attributes and golden-hour mode to <html>            */
/*  Mount once in the root layout                                      */
/* ------------------------------------------------------------------ */

export default function SeasonalTheme() {
  useSeasonalTheme();
  useGoldenHour();

  return null;
}
