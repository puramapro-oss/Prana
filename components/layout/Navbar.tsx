'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface NavbarProps {
  isAuthenticated?: boolean;
  userName?: string;
}

/* ------------------------------------------------------------------ */
/*  Link definitions                                                   */
/* ------------------------------------------------------------------ */

const publicLinks = [
  { label: 'MODULES', href: '/modules' },
  { label: 'SAGESSE', href: '/sagesse' },
  { label: 'TARIFS', href: '/tarifs' },
] as const;

const authLinks = [
  { label: "AUJOURD'HUI", href: '/dashboard' },
  { label: 'PROGRAMME', href: '/dashboard/programme' },
  { label: 'MODULES', href: '/dashboard/modules' },
  { label: 'SAGESSE', href: '/dashboard/sagesse' },
] as const;

/* ------------------------------------------------------------------ */
/*  Navbar                                                             */
/* ------------------------------------------------------------------ */

export default function Navbar({
  isAuthenticated = false,
  userName,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = useCallback(() => setMobileOpen((v) => !v), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const links = isAuthenticated ? authLinks : publicLinks;
  const initials = userName ? userName.charAt(0).toUpperCase() : '?';

  return (
    <>
      {/* ---- Desktop / Mobile top bar ---- */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-bg-primary/90 backdrop-blur-md border-b border-border">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left — Logo */}
          <Link
            href="/"
            className="font-display text-jade tracking-display text-lg select-none"
          >
            PRANA
          </Link>

          {/* Center — Desktop nav */}
          <ul className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="font-mono text-[11px] uppercase tracking-label text-muted transition-colors hover:text-text"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right */}
          <div className="flex items-center gap-4">
            {/* Desktop auth actions */}
            <div className="hidden md:block">
              {isAuthenticated ? (
                <Link
                  href="/dashboard/profil"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-jade-dim text-jade font-mono text-xs transition-colors hover:bg-jade/20"
                  aria-label="Mon profil"
                >
                  {initials}
                </Link>
              ) : (
                <Link
                  href="/connexion"
                  className="font-mono text-[11px] uppercase tracking-label text-jade transition-colors hover:text-jade-light"
                >
                  CONNEXION
                </Link>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={toggleMobile}
              className="relative flex h-8 w-8 items-center justify-center md:hidden"
              aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={mobileOpen}
            >
              <span className="sr-only">Menu</span>
              <span
                className={`absolute h-px w-5 bg-text transition-all duration-300 ${
                  mobileOpen ? 'rotate-45' : '-translate-y-1.5'
                }`}
              />
              <span
                className={`absolute h-px w-5 bg-text transition-all duration-300 ${
                  mobileOpen ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <span
                className={`absolute h-px w-5 bg-text transition-all duration-300 ${
                  mobileOpen ? '-rotate-45' : 'translate-y-1.5'
                }`}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* ---- Mobile overlay ---- */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-nav"
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: 'easeInOut' }}
            className="fixed inset-0 z-30 flex flex-col items-center justify-center bg-bg-primary/98 backdrop-blur-lg md:hidden"
          >
            <ul className="flex flex-col items-center gap-8">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={closeMobile}
                    className="font-mono text-sm uppercase tracking-label text-muted transition-colors hover:text-text"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}

              {/* Auth action in mobile menu */}
              <li className="mt-4 pt-4 border-t border-border">
                {isAuthenticated ? (
                  <Link
                    href="/dashboard/profil"
                    onClick={closeMobile}
                    className="flex items-center gap-3 font-mono text-sm uppercase tracking-label text-jade transition-colors hover:text-jade-light"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-jade-dim text-jade text-xs">
                      {initials}
                    </span>
                    MON PROFIL
                  </Link>
                ) : (
                  <Link
                    href="/connexion"
                    onClick={closeMobile}
                    className="font-mono text-sm uppercase tracking-label text-jade transition-colors hover:text-jade-light"
                  >
                    CONNEXION
                  </Link>
                )}
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
