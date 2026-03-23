'use client';

import React, { useState, useEffect, useMemo } from 'react';
import LivingOrb from '@/components/ui/LivingOrb';

/* ------------------------------------------------------------------ */
/*  PranaMessage — AI consciousness message card with streaming text   */
/* ------------------------------------------------------------------ */

interface PranaMessageProps {
  message: string;
  isLoading: boolean;
}

export default function PranaMessage({ message, isLoading }: PranaMessageProps) {
  const words = useMemo(() => message.split(' '), [message]);
  const [visibleCount, setVisibleCount] = useState<number>(isLoading ? 0 : words.length);

  // Streaming word-by-word effect when loading
  useEffect(() => {
    if (!isLoading) {
      setVisibleCount(words.length);
      return;
    }

    setVisibleCount(0);
    if (words.length === 0) return;

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setVisibleCount(current);
      if (current >= words.length) {
        clearInterval(interval);
      }
    }, 60);

    return () => clearInterval(interval);
  }, [isLoading, words]);

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-border p-5"
      style={{
        background:
          'linear-gradient(135deg, rgba(111,207,138,0.06) 0%, rgba(160,128,216,0.06) 100%)',
      }}
    >
      <div className="flex gap-4">
        {/* Orb */}
        <div className="shrink-0">
          <LivingOrb size={44} color="jade" />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-label text-dim">
            Prana Consciousness
          </p>
          <p className="font-display text-[16px] leading-[1.75] text-text">
            {words.map((word, i) => (
              <span
                key={i}
                className="inline transition-opacity duration-200"
                style={{ opacity: i < visibleCount ? 1 : 0 }}
              >
                {word}
                {i < words.length - 1 ? ' ' : ''}
              </span>
            ))}
          </p>
        </div>
      </div>
    </div>
  );
}
