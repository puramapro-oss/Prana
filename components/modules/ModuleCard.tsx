'use client';

import React from 'react';
import Link from 'next/link';
import Tag from '@/components/ui/Tag';
import type { Module } from '@/data/modules';

/* ------------------------------------------------------------------ */
/*  ModuleCard — Single module preview with hover glow                 */
/* ------------------------------------------------------------------ */

interface ModuleCardProps {
  module: Module;
}

const GLOW_COLORS: Record<string, string> = {
  jade: 'hover:border-jade/40 hover:shadow-[0_0_20px_rgba(111,207,138,0.12)]',
  gold: 'hover:border-gold/40 hover:shadow-[0_0_20px_rgba(201,168,76,0.12)]',
  violet: 'hover:border-violet/40 hover:shadow-[0_0_20px_rgba(160,128,216,0.12)]',
  sage: 'hover:border-sage/40 hover:shadow-[0_0_20px_rgba(78,205,196,0.12)]',
  rose: 'hover:border-rose/40 hover:shadow-[0_0_20px_rgba(232,120,120,0.12)]',
  amber: 'hover:border-amber/40 hover:shadow-[0_0_20px_rgba(224,144,80,0.12)]',
};

export default function ModuleCard({ module }: ModuleCardProps) {
  const glow = GLOW_COLORS[module.tagColor] ?? GLOW_COLORS.jade;

  return (
    <Link href={`/dashboard/modules/${module.id}`}>
      <div
        className={`rounded-xl border border-border bg-bg-surface p-5 transition-all duration-300 hover:-translate-y-1 ${glow}`}
      >
        {/* Icon */}
        <span className="text-[28px] leading-none" role="img" aria-hidden="true">
          {module.emoji}
        </span>

        {/* Tag */}
        <div className="mt-3">
          <Tag label={module.tag} color={module.tagColor} />
        </div>

        {/* Name */}
        <h3 className="mt-3 text-[15px] font-medium text-text">
          {module.name}
        </h3>

        {/* Description */}
        <p className="mt-1 text-[12px] leading-relaxed text-muted">
          {module.description}
        </p>
      </div>
    </Link>
  );
}
