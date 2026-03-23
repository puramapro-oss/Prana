'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import modules from '@/data/modules';
import ModuleDetail from '@/components/modules/ModuleDetail';

/* ------------------------------------------------------------------ */
/*  Module detail page — /dashboard/modules/[id]                       */
/* ------------------------------------------------------------------ */

export default function ModuleDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const mod = modules.find((m) => m.id === id);

  if (!mod) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <span className="text-4xl mb-4">🔍</span>
        <h1 className="font-display text-2xl tracking-display text-text mb-2">
          Module non trouv&eacute;
        </h1>
        <p className="font-mono text-[11px] uppercase tracking-label text-muted">
          Ce module n&apos;existe pas ou a &eacute;t&eacute; d&eacute;plac&eacute;
        </p>
      </div>
    );
  }

  return <ModuleDetail module={mod} />;
}
