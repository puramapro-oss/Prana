'use client';

import React from 'react';

/* ------------------------------------------------------------------ */
/*  TechniqueRow — Compact row with name, duration & toggle switch     */
/* ------------------------------------------------------------------ */

interface TechniqueRowProps {
  technique: {
    name: string;
    enabled: boolean;
    duration: string;
  };
  onToggle: () => void;
}

export default function TechniqueRow({ technique, onToggle }: TechniqueRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 px-1">
      {/* Name */}
      <span className="text-[13px] text-text flex-1 truncate">
        {technique.name}
      </span>

      {/* Duration */}
      <span className="text-[11px] font-mono text-muted tracking-label shrink-0">
        {technique.duration}
      </span>

      {/* Toggle switch */}
      <button
        type="button"
        role="switch"
        aria-checked={technique.enabled}
        onClick={onToggle}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${
          technique.enabled ? 'bg-jade' : 'bg-dim'
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
            technique.enabled ? 'translate-x-[18px]' : 'translate-x-[3px]'
          }`}
        />
      </button>
    </div>
  );
}
