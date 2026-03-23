'use client';

import React from 'react';

/* ------------------------------------------------------------------ */
/*  VitalityScore — Circular progress gauge with animated SVG stroke   */
/*  Cormorant Garamond score, DM Mono label, color-coded by range      */
/* ------------------------------------------------------------------ */

interface VitalityScoreProps {
  /** Score value from 0 to 100 */
  score: number;
  /** Diameter of the SVG circle in pixels */
  size?: number;
}

/** Returns the theme color name based on the score range */
function getColor(score: number): { css: string; className: string } {
  if (score >= 70) return { css: 'var(--jade)', className: 'text-jade' };
  if (score >= 40) return { css: 'var(--amber)', className: 'text-amber' };
  return { css: 'var(--rose)', className: 'text-rose' };
}

export default function VitalityScore({ score, size = 120 }: VitalityScoreProps) {
  const clampedScore = Math.min(100, Math.max(0, score));
  const { css: strokeColor, className: textColorClass } = getColor(clampedScore);

  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div
      className="relative inline-flex flex-col items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* SVG ring */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--faint)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: 'stroke-dashoffset 0.8s ease-in-out, stroke 0.4s ease',
          }}
        />
      </svg>

      {/* Score number */}
      <span
        className={`font-display leading-none ${textColorClass}`}
        style={{
          fontSize: size * 0.43,
          transition: 'color 0.4s ease',
        }}
        aria-label={`Vitality score: ${clampedScore}`}
      >
        {clampedScore}
      </span>

      {/* Label */}
      <span
        className="font-mono uppercase tracking-label"
        style={{
          fontSize: 10,
          color: 'var(--muted)',
          marginTop: 2,
        }}
      >
        VITALIT{'\u00C9'}
      </span>
    </div>
  );
}
