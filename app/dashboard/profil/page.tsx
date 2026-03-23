'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/utils/animations';

/* ------------------------------------------------------------------ */
/*  Profil page — User profile, stats, and settings                    */
/* ------------------------------------------------------------------ */

interface ToggleSwitchProps {
  label: string;
  enabled: boolean;
  onToggle: () => void;
}

function ToggleSwitch({ label, enabled, onToggle }: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-text">{label}</span>
      <button
        type="button"
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-jade' : 'bg-dim/30'
        }`}
        role="switch"
        aria-checked={enabled}
        aria-label={label}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sample data                                                        */
/* ------------------------------------------------------------------ */

const PROFILE_DATA = {
  name: 'Voyageur',
  plan: 'Gratuit' as const,
  dosha: 'Vata-Pitta',
  mtcType: 'Bois / Feu',
  archetype: 'Le Guérisseur',
};

const STATS = {
  practiceDays: 12,
  streak: 5,
  averageScore: 72,
};

/* ------------------------------------------------------------------ */
/*  ProfilPage                                                         */
/* ------------------------------------------------------------------ */

export default function ProfilPage() {
  const [notifications, setNotifications] = useState(true);
  const [nightMode, setNightMode] = useState(false);
  const [ambientSounds, setAmbientSounds] = useState(true);

  const toggleNotifications = useCallback(() => setNotifications((v) => !v), []);
  const toggleNightMode = useCallback(() => setNightMode((v) => !v), []);
  const toggleAmbientSounds = useCallback(() => setAmbientSounds((v) => !v), []);

  const initials = PROFILE_DATA.name.charAt(0).toUpperCase();

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* ---- Avatar & Name ---- */}
      <motion.div variants={fadeInUp} className="flex items-center gap-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-jade-dim text-jade font-display text-2xl">
          {initials}
        </div>
        <div>
          <h1 className="font-display text-2xl tracking-display text-text md:text-3xl">
            {PROFILE_DATA.name}
          </h1>
          <span className="mt-1 inline-block rounded-full bg-jade-dim px-3 py-0.5 font-mono text-[10px] uppercase tracking-label text-jade">
            {PROFILE_DATA.plan}
          </span>
        </div>
      </motion.div>

      {/* ---- Profil PRANA ---- */}
      <motion.div variants={fadeInUp}>
        <div className="rounded-xl border border-border bg-bg-surface p-5">
          <h2 className="font-mono text-[11px] uppercase tracking-label text-muted mb-4">
            Profil PRANA
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { label: 'Dosha', value: PROFILE_DATA.dosha, emoji: '🌿' },
              { label: 'Type MTC', value: PROFILE_DATA.mtcType, emoji: '⚖️' },
              { label: 'Archétype', value: PROFILE_DATA.archetype, emoji: '✨' },
            ].map((item) => (
              <div key={item.label} className="text-center sm:text-left">
                <div className="flex items-center justify-center gap-2 sm:justify-start">
                  <span className="text-lg">{item.emoji}</span>
                  <span className="font-mono text-[10px] uppercase tracking-label text-muted">
                    {item.label}
                  </span>
                </div>
                <p className="mt-1 font-display text-base text-text">
                  {item.value || 'Non déterminé'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ---- Statistiques ---- */}
      <motion.div variants={fadeInUp}>
        <div className="rounded-xl border border-border bg-bg-surface p-5">
          <h2 className="font-mono text-[11px] uppercase tracking-label text-muted mb-4">
            Statistiques
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="font-display text-3xl text-jade">{STATS.practiceDays}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-label text-muted">
                Jours de pratique
              </p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl text-jade">{STATS.streak}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-label text-muted">
                Streak
              </p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl text-jade">{STATS.averageScore}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-label text-muted">
                Score moyen
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ---- Paramètres ---- */}
      <motion.div variants={fadeInUp}>
        <div className="rounded-xl border border-border bg-bg-surface p-5">
          <h2 className="font-mono text-[11px] uppercase tracking-label text-muted mb-4">
            Paramètres
          </h2>
          <div className="divide-y divide-border">
            <ToggleSwitch
              label="Notifications"
              enabled={notifications}
              onToggle={toggleNotifications}
            />
            <ToggleSwitch
              label="Mode nuit"
              enabled={nightMode}
              onToggle={toggleNightMode}
            />
            <ToggleSwitch
              label="Sons ambiants"
              enabled={ambientSounds}
              onToggle={toggleAmbientSounds}
            />
          </div>
        </div>
      </motion.div>

      {/* ---- Abonnement ---- */}
      <motion.div variants={fadeInUp}>
        <div className="rounded-xl border border-border bg-bg-surface p-5">
          <h2 className="font-mono text-[11px] uppercase tracking-label text-muted mb-4">
            Abonnement
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text">Plan actuel</p>
              <p className="mt-1 font-display text-lg text-jade">{PROFILE_DATA.plan}</p>
            </div>
            <button
              type="button"
              className="rounded-full border border-border px-6 py-2 font-mono text-[11px] uppercase tracking-label text-muted transition-colors hover:border-jade hover:text-jade"
            >
              Gérer
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
