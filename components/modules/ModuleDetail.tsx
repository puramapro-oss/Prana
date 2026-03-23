'use client';

import React from 'react';
import Tag from '@/components/ui/Tag';
import type { Module } from '@/data/modules';

/* ------------------------------------------------------------------ */
/*  ModuleDetail — Full module detail page layout                      */
/* ------------------------------------------------------------------ */

interface ModuleDetailProps {
  module: Module & {
    longDescription?: string;
    learnings?: string[];
    techniques?: { id: string; name: string; duration: string }[];
  };
}

const GRADIENT_COLORS: Record<string, string> = {
  jade: 'from-jade/20 to-transparent',
  gold: 'from-gold/20 to-transparent',
  violet: 'from-violet/20 to-transparent',
  sage: 'from-sage/20 to-transparent',
  rose: 'from-rose/20 to-transparent',
  amber: 'from-amber/20 to-transparent',
};

export default function ModuleDetail({ module }: ModuleDetailProps) {
  const gradient = GRADIENT_COLORS[module.tagColor] ?? GRADIENT_COLORS.jade;

  return (
    <div className="space-y-8">
      {/* ---- Header with gradient ---- */}
      <div
        className={`rounded-2xl bg-gradient-to-b ${gradient} p-8 md:p-12`}
      >
        <span className="text-5xl" role="img" aria-hidden="true">
          {module.emoji}
        </span>
        <h1 className="mt-4 font-display text-3xl tracking-display text-text">
          {module.name}
        </h1>
        <div className="mt-3">
          <Tag label={module.tag} color={module.tagColor} />
        </div>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
          {module.longDescription ?? module.description}
        </p>
      </div>

      {/* ---- Ce que tu vas apprendre ---- */}
      {module.learnings && module.learnings.length > 0 && (
        <section>
          <h2 className="font-display text-lg tracking-display text-text mb-4">
            Ce que tu vas apprendre
          </h2>
          <ul className="space-y-2">
            {module.learnings.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted">
                <span className="mt-0.5 text-jade">&#10003;</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---- Techniques incluses ---- */}
      {module.techniques && module.techniques.length > 0 && (
        <section>
          <h2 className="font-display text-lg tracking-display text-text mb-4">
            Techniques incluses
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {module.techniques.map((tech) => (
              <div
                key={tech.id}
                className="flex items-center justify-between rounded-xl border border-border bg-bg-surface p-4"
              >
                <span className="text-sm text-text">{tech.name}</span>
                <span className="font-mono text-[10px] text-muted tracking-label">
                  {tech.duration}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---- Action buttons ---- */}
      <div className="flex flex-col items-center gap-3 pt-4 pb-8 sm:flex-row sm:justify-center">
        <button className="rounded-full border border-border px-8 py-3 font-mono text-xs uppercase tracking-label text-muted transition-colors hover:border-jade hover:text-jade">
          Ajouter à mon programme
        </button>
        <button className="rounded-full bg-jade px-8 py-3 font-mono text-xs uppercase tracking-label text-bg-primary transition-opacity hover:opacity-90">
          Commencer maintenant
        </button>
      </div>
    </div>
  );
}
