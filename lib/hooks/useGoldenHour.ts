'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUIStore } from '@/lib/store/uiStore';

/* ------------------------------------------------------------------ */
/*  Golden hour hook — detects local time >= 20:00                      */
/*  Sets data-golden-hour on <html> and syncs with uiStore              */
/*  Checks every minute                                                 */
/* ------------------------------------------------------------------ */

interface GoldenHourState {
  isGoldenHour: boolean;
  message: string;
}

const GOLDEN_HOUR_MESSAGE = 'Le soir est là. Temps de ralentir.';
const CHECK_INTERVAL = 60_000; // 1 minute

export function useGoldenHour(): GoldenHourState {
  const setGoldenHour = useUIStore((s) => s.setGoldenHour);

  const check = useCallback((): boolean => {
    return new Date().getHours() >= 20;
  }, []);

  const [state, setState] = useState<GoldenHourState>(() => {
    const active = check();
    return {
      isGoldenHour: active,
      message: active ? GOLDEN_HOUR_MESSAGE : '',
    };
  });

  useEffect(() => {
    function update() {
      const active = check();
      setState({
        isGoldenHour: active,
        message: active ? GOLDEN_HOUR_MESSAGE : '',
      });
      setGoldenHour(active);

      if (active) {
        document.documentElement.setAttribute('data-golden-hour', 'true');
      } else {
        document.documentElement.removeAttribute('data-golden-hour');
      }
    }

    // Run immediately
    update();

    const id = setInterval(update, CHECK_INTERVAL);
    return () => clearInterval(id);
  }, [check, setGoldenHour]);

  return state;
}
