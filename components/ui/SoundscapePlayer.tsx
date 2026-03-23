'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useUIStore } from '@/lib/store/uiStore';

/* ------------------------------------------------------------------ */
/*  SoundscapePlayer — Ambient sound picker with volume control        */
/*  Uses Howler.js for audio playback (loaded dynamically)             */
/* ------------------------------------------------------------------ */

interface SoundOption {
  id: string;
  emoji: string;
  label: string;
  src: string;
}

const SOUNDS: SoundOption[] = [
  { id: 'forest', emoji: '\u{1F332}', label: 'For\u00eat pluviale', src: '/sounds/forest-rain.mp3' },
  { id: 'bowls', emoji: '\u{1F3B5}', label: 'Bols tib\u00e9tains', src: '/sounds/bowl-tibetan.mp3' },
  { id: '432hz', emoji: '\u{303D}\uFE0F', label: '432Hz', src: '/sounds/432hz.mp3' },
  { id: 'river', emoji: '\u{1F4A7}', label: 'Rivi\u00e8re', src: '/sounds/river.mp3' },
];

export default function SoundscapePlayer() {
  const {
    soundEnabled,
    currentSound,
    volume,
    toggleSound,
    setCurrentSound,
    setVolume,
  } = useUIStore();

  const [open, setOpen] = useState(false);
  const howlRef = useRef<import('howler').Howl | null>(null);
  const HowlClass = useRef<typeof import('howler').Howl | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Dynamically import Howler
  useEffect(() => {
    import('howler').then((mod) => {
      HowlClass.current = mod.Howl;
    });
  }, []);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Update volume on existing howl
  useEffect(() => {
    if (howlRef.current) {
      howlRef.current.volume(volume);
    }
  }, [volume]);

  // Stop sound when disabled
  useEffect(() => {
    if (!soundEnabled && howlRef.current) {
      howlRef.current.stop();
      howlRef.current.unload();
      howlRef.current = null;
    }
  }, [soundEnabled]);

  const playSound = useCallback(
    (sound: SoundOption) => {
      if (!HowlClass.current) return;

      // Stop existing
      if (howlRef.current) {
        howlRef.current.stop();
        howlRef.current.unload();
        howlRef.current = null;
      }

      // If clicking same sound, stop it
      if (currentSound === sound.id) {
        setCurrentSound(null);
        return;
      }

      const howl = new HowlClass.current({
        src: [sound.src],
        loop: true,
        volume,
      });

      howl.play();
      howlRef.current = howl;
      setCurrentSound(sound.id);
    },
    [currentSound, volume, setCurrentSound],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (howlRef.current) {
        howlRef.current.stop();
        howlRef.current.unload();
      }
    };
  }, []);

  return (
    <div className="fixed top-6 right-6 z-50" ref={menuRef}>
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => {
          if (!soundEnabled) {
            toggleSound();
          }
          setOpen((prev) => !prev);
        }}
        className="flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
        }}
        aria-label={soundEnabled ? 'Sound on' : 'Sound off'}
      >
        <span className="text-lg" role="img" aria-hidden="true">
          {soundEnabled && currentSound ? '\u{1F50A}' : '\u{1F507}'}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-12 w-56 rounded-xl p-3 space-y-1"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* Sound options */}
          {SOUNDS.map((sound) => (
            <button
              key={sound.id}
              type="button"
              onClick={() => playSound(sound)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors duration-150"
              style={{
                background:
                  currentSound === sound.id
                    ? 'var(--bg-surface-hover)'
                    : 'transparent',
                color:
                  currentSound === sound.id
                    ? 'var(--jade)'
                    : 'var(--text)',
              }}
            >
              <span role="img" aria-hidden="true">
                {sound.emoji}
              </span>
              <span>{sound.label}</span>
            </button>
          ))}

          {/* Volume slider */}
          <div className="mt-2 px-3 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
            <label
              className="mb-1 block font-mono text-[10px] uppercase tracking-label"
              style={{ color: 'var(--muted)' }}
            >
              Volume
            </label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full accent-jade"
              style={{ accentColor: 'var(--jade)' }}
            />
          </div>

          {/* Mute toggle */}
          <button
            type="button"
            onClick={() => {
              toggleSound();
              if (soundEnabled && howlRef.current) {
                howlRef.current.stop();
                howlRef.current.unload();
                howlRef.current = null;
                setCurrentSound(null);
              }
            }}
            className="mt-1 w-full rounded-lg px-3 py-1.5 text-center font-mono text-[10px] uppercase tracking-label transition-colors duration-150"
            style={{
              color: 'var(--muted)',
              background: 'var(--bg-surface)',
            }}
          >
            {soundEnabled ? 'Couper le son' : 'Activer le son'}
          </button>
        </div>
      )}
    </div>
  );
}
