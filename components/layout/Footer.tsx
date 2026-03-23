'use client';

import Link from 'next/link';

/* ------------------------------------------------------------------ */
/*  Link groups                                                        */
/* ------------------------------------------------------------------ */

const navLinks = [
  { label: 'Modules', href: '/modules' },
  { label: 'Sagesse', href: '/sagesse' },
  { label: 'Tarifs', href: '/tarifs' },
  { label: 'Contact', href: '/contact' },
] as const;

const legalLinks = [
  { label: 'Mentions légales', href: '/mentions-legales' },
  { label: 'CGV', href: '/cgv' },
  { label: 'Confidentialité', href: '/confidentialite' },
] as const;

/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* 3-column grid */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          {/* Column 1 — Brand */}
          <div>
            <Link
              href="/"
              className="font-display text-jade tracking-display text-base select-none"
            >
              PRANA
            </Link>
            <p className="mt-3 font-mono text-[11px] leading-relaxed text-muted max-w-[260px]">
              Votre sanctuaire de bien-être holistique. Explorez 17 modules
              conçus pour harmoniser corps, esprit et âme.
            </p>
          </div>

          {/* Column 2 — Navigation */}
          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-label text-dim mb-4">
              Navigation
            </h3>
            <ul className="space-y-2.5">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="font-mono text-[11px] text-muted transition-colors hover:text-text"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Legal */}
          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-label text-dim mb-4">
              Légal
            </h3>
            <ul className="space-y-2.5">
              {legalLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="font-mono text-[11px] text-muted transition-colors hover:text-text"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-border pt-6">
          <p className="text-center font-mono text-[10px] text-dim">
            &copy; 2024 PRANA &middot; Tous droits réservés
          </p>
        </div>
      </div>
    </footer>
  );
}
