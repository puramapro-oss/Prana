'use client';

import React from 'react';

/* ------------------------------------------------------------------ */
/*  GlowBackground — Ambient blurred circles that slowly drift         */
/* ------------------------------------------------------------------ */

const BLOBS = [
  {
    color: 'var(--jade)',
    size: '45vw',
    top: '10%',
    left: '-10%',
    delay: '0s',
  },
  {
    color: 'var(--violet)',
    size: '40vw',
    top: '50%',
    right: '-8%',
    delay: '1.5s',
  },
  {
    color: 'var(--gold)',
    size: '35vw',
    bottom: '-5%',
    left: '30%',
    delay: '3s',
  },
];

export default function GlowBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {BLOBS.map((blob, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: blob.size,
            height: blob.size,
            ...('top' in blob ? { top: blob.top } : {}),
            ...('bottom' in blob ? { bottom: blob.bottom } : {}),
            ...('left' in blob ? { left: blob.left } : {}),
            ...('right' in blob ? { right: blob.right } : {}),
            background: blob.color,
            filter: 'blur(120px)',
            opacity: 0.08,
            animation: 'glowPulse 4s ease-in-out infinite',
            animationDelay: blob.delay,
          }}
        />
      ))}
    </div>
  );
}
