'use client';

import React, { useState, useCallback } from 'react';
import type { Programme, PracticeBlock } from '@/lib/supabase/types';
import PillarCard from './PillarCard';
import type { Pillar } from './PillarCard';

/* ------------------------------------------------------------------ */
/*  ProgramBuilder — Full programme view with time columns & pillars   */
/* ------------------------------------------------------------------ */

interface ProgramBuilderProps {
  programme: Programme;
  onUpdatePractices?: (
    period: 'morning_practices' | 'afternoon_practices' | 'evening_practices',
    practices: PracticeBlock[],
  ) => void;
  onRecreate?: () => void;
}

/* ---- column config ---- */
const COLUMNS = [
  { key: 'morning_practices' as const, label: 'Matin', emoji: '🌅' },
  { key: 'afternoon_practices' as const, label: 'Après-midi', emoji: '☀️' },
  { key: 'evening_practices' as const, label: 'Soir', emoji: '🌙' },
];

/* ---- default pillars ---- */
const DEFAULT_PILLARS: Pillar[] = [
  { name: 'Respiration', icon: '🌬️', color: 'jade', description: 'Pranayama & cohérence cardiaque', techniques: [] },
  { name: 'Méditation', icon: '🧘', color: 'violet', description: 'Pleine conscience & visualisation', techniques: [] },
  { name: 'Mouvement', icon: '🏃', color: 'rose', description: 'Yoga, mobilité & exercices', techniques: [] },
  { name: 'Nutrition', icon: '🥗', color: 'gold', description: 'Alimentation consciente', techniques: [] },
  { name: 'Sommeil', icon: '🌙', color: 'sage', description: 'Routines de repos', techniques: [] },
  { name: 'Énergie', icon: '⚡', color: 'amber', description: 'Vitalité & récupération', techniques: [] },
];

/* ---- inline editable text ---- */
function EditableText({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => {
    setEditing(false);
    if (draft.trim() && draft !== value) onChange(draft.trim());
    else setDraft(value);
  };

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && commit()}
        className="w-full bg-transparent text-sm text-text outline-none border-b border-jade py-0.5"
      />
    );
  }

  return (
    <span
      onClick={() => setEditing(true)}
      className="cursor-pointer text-sm text-text hover:text-jade transition-colors"
    >
      {value}
    </span>
  );
}

export default function ProgramBuilder({
  programme,
  onUpdatePractices,
  onRecreate,
}: ProgramBuilderProps) {
  /* ---- practice editing ---- */
  const updatePracticeTitle = useCallback(
    (
      period: 'morning_practices' | 'afternoon_practices' | 'evening_practices',
      index: number,
      newTitle: string,
    ) => {
      const practices = [...(programme[period] ?? [])];
      practices[index] = { ...practices[index], title: newTitle };
      onUpdatePractices?.(period, practices);
    },
    [programme, onUpdatePractices],
  );

  const deletePractice = useCallback(
    (
      period: 'morning_practices' | 'afternoon_practices' | 'evening_practices',
      index: number,
    ) => {
      const practices = (programme[period] ?? []).filter((_, i) => i !== index);
      onUpdatePractices?.(period, practices);
    },
    [programme, onUpdatePractices],
  );

  const addPractice = useCallback(
    (
      period: 'morning_practices' | 'afternoon_practices' | 'evening_practices',
    ) => {
      const practices = [
        ...(programme[period] ?? []),
        { title: 'Nouvelle pratique', duration: 5, description: '' },
      ];
      onUpdatePractices?.(period, practices);
    },
    [programme, onUpdatePractices],
  );

  return (
    <div className="space-y-8">
      {/* ---- Time columns ---- */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {COLUMNS.map(({ key, label, emoji }) => {
          const practices = programme[key] ?? [];
          return (
            <div
              key={key}
              className="rounded-xl border border-border bg-bg-surface p-4"
            >
              {/* Column header */}
              <div className="mb-4 flex items-center gap-2">
                <span className="text-lg" role="img" aria-hidden="true">
                  {emoji}
                </span>
                <h3 className="font-display text-lg tracking-display text-text">
                  {label}
                </h3>
              </div>

              {/* Practices list */}
              <div className="space-y-2">
                {practices.map((practice, i) => (
                  <div
                    key={i}
                    className="group flex items-center justify-between gap-2 rounded-lg bg-bg-primary px-3 py-2"
                  >
                    <EditableText
                      value={practice.title}
                      onChange={(v) => updatePracticeTitle(key, i, v)}
                    />
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-muted tracking-label">
                        {practice.duration} min
                      </span>
                      <button
                        onClick={() => deletePractice(key, i)}
                        className="text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-rose text-xs"
                        aria-label="Supprimer"
                      >
                        &#10005;
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add practice */}
              <button
                onClick={() => addPractice(key)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2 text-[11px] font-mono uppercase tracking-label text-muted transition-colors hover:border-jade hover:text-jade"
              >
                + Ajouter
              </button>
            </div>
          );
        })}
      </div>

      {/* ---- Pillar cards ---- */}
      <div>
        <h3 className="font-display text-lg tracking-display text-text mb-4">
          Piliers de santé
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {DEFAULT_PILLARS.map((pillar) => (
            <PillarCard key={pillar.name} pillar={pillar} />
          ))}
        </div>
      </div>

      {/* ---- Recreate button ---- */}
      <div className="flex justify-center pt-4 pb-8">
        <button
          onClick={onRecreate}
          className="rounded-full border border-border px-8 py-3 font-mono text-xs uppercase tracking-label text-muted transition-colors hover:border-jade hover:text-jade"
        >
          Recréer un programme
        </button>
      </div>
    </div>
  );
}
