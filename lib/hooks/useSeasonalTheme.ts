'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '@/lib/store/uiStore';

/* ------------------------------------------------------------------ */
/*  Seasonal theme hook — astronomical seasons (Northern Hemisphere)    */
/*  Sets data-season on <html> and syncs with uiStore                   */
/* ------------------------------------------------------------------ */

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

function getSeason(date: Date = new Date()): Season {
  const month = date.getMonth() + 1; // 1-indexed
  const day = date.getDate();

  // Spring: March 20 – June 20
  if ((month === 3 && day >= 20) || month === 4 || month === 5 || (month === 6 && day <= 20)) {
    return 'spring';
  }

  // Summer: June 21 – September 22
  if ((month === 6 && day >= 21) || month === 7 || month === 8 || (month === 9 && day <= 22)) {
    return 'summer';
  }

  // Autumn: September 23 – December 21
  if ((month === 9 && day >= 23) || month === 10 || month === 11 || (month === 12 && day <= 21)) {
    return 'autumn';
  }

  // Winter: December 22 – March 19
  return 'winter';
}

export function useSeasonalTheme(): Season {
  const setSeason = useUIStore((s) => s.setSeason);
  const [season, setLocalSeason] = useState<Season>(() => getSeason());

  useEffect(() => {
    const current = getSeason();
    setLocalSeason(current);
    setSeason(current);
    document.documentElement.setAttribute('data-season', current);
  }, [setSeason]);

  return season;
}
