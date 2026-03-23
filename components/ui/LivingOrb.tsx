'use client';

import React from 'react';

/* ------------------------------------------------------------------ */
/*  LivingOrb — Central breathing orb with orbital rings               */
/*  Pure CSS animations for performance                                */
/* ------------------------------------------------------------------ */

interface LivingOrbProps {
  /** Orb diameter in pixels */
  size?: number;
  /** Optional emoji displayed in the center */
  emoji?: string;
  /** Theme color name */
  color?: 'jade' | 'gold' | 'violet' | 'sage' | 'rose' | 'amber';
  /** Duration of one full breath cycle in ms */
  breathDuration?: number;
}

const COLOR_MAP: Record<string, { main: string; glow: string }> = {
  jade: { main: 'var(--jade)', glow: 'rgba(111, 207, 138, 0.35)' },
  gold: { main: 'var(--gold)', glow: 'rgba(201, 168, 76, 0.35)' },
  violet: { main: 'var(--violet)', glow: 'rgba(160, 128, 216, 0.35)' },
  sage: { main: 'var(--sage)', glow: 'rgba(78, 205, 196, 0.35)' },
  rose: { main: 'var(--rose)', glow: 'rgba(232, 120, 120, 0.35)' },
  amber: { main: 'var(--amber)', glow: 'rgba(224, 144, 80, 0.35)' },
};

export default function LivingOrb({
  size = 160,
  emoji,
  color = 'jade',
  breathDuration = 5500,
}: LivingOrbProps) {
  const { main, glow } = COLOR_MAP[color] ?? COLOR_MAP.jade;
  const ringSize = size * 1.6;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: ringSize, height: ringSize }}
    >
      {/* Orbital rings */}
      {[
        { duration: 25, offset: 0 },
        { duration: 33, offset: 0.3 },
        { duration: 41, offset: 0.6 },
      ].map(({ duration, offset }, i) => {
        const scale = 1 - i * 0.12;
        const ringSizePx = ringSize * scale;
        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: ringSizePx,
              height: ringSizePx,
              border: `1px solid ${main}`,
              opacity: 0.15 + i * 0.05,
              animation: `${i === 2 ? 'livingOrbRotateR' : 'livingOrbRotate'} ${duration}s linear infinite`,
              animationDelay: `${offset}s`,
            }}
          />
        );
      })}

      {/* Breathing orb */}
      <div
        className="relative z-10 flex items-center justify-center rounded-full"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at 40% 35%, ${main}, transparent 70%)`,
          animation: `livingOrbBreathe ${breathDuration}ms ease-in-out infinite`,
          boxShadow: `0 0 ${size * 0.4}px ${size * 0.1}px ${glow}`,
        }}
      >
        {emoji && (
          <span
            className="select-none"
            style={{ fontSize: size * 0.35 }}
            role="img"
            aria-hidden="true"
          >
            {emoji}
          </span>
        )}
      </div>

      {/* Inline keyframes scoped to this component */}
      <style jsx>{`
        @keyframes livingOrbBreathe {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 ${size * 0.25}px ${size * 0.06}px ${glow};
          }
          50% {
            transform: scale(1.08);
            box-shadow: 0 0 ${size * 0.5}px ${size * 0.15}px ${glow};
          }
        }
        @keyframes livingOrbRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes livingOrbRotateR {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
      `}</style>
    </div>
  );
}
