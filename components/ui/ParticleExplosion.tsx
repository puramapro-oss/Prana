'use client';

import React, { useEffect, useMemo } from 'react';

/* ------------------------------------------------------------------ */
/*  ParticleExplosion — Burst of particles from a given point          */
/*  Uses CSS custom properties --tx and --ty for direction             */
/* ------------------------------------------------------------------ */

interface ParticleExplosionProps {
  /** Whether the explosion is currently active */
  active: boolean;
  /** X coordinate of the burst origin */
  x: number;
  /** Y coordinate of the burst origin */
  y: number;
  /** Called when the animation completes */
  onComplete: () => void;
}

const PARTICLE_COUNT = 12;
const DURATION = 800;

interface Particle {
  angle: number;
  distance: number;
  size: number;
  tx: number;
  ty: number;
}

function generateParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, () => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 40 + Math.random() * 40; // 40–80px
    const size = 4 + Math.random() * 2; // 4–6px
    return {
      angle,
      distance,
      size,
      tx: Math.cos(angle) * distance,
      ty: Math.sin(angle) * distance,
    };
  });
}

export default function ParticleExplosion({
  active,
  x,
  y,
  onComplete,
}: ParticleExplosionProps) {
  const particles = useMemo(() => (active ? generateParticles() : []), [active]);

  useEffect(() => {
    if (!active) return;

    const timer = setTimeout(onComplete, DURATION);
    return () => clearTimeout(timer);
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50"
      aria-hidden="true"
    >
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: x,
            top: y,
            width: p.size,
            height: p.size,
            backgroundColor: 'var(--jade)',
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            animation: `particleBurst ${DURATION}ms ease-out forwards`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
