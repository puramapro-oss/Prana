'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/lib/store/uiStore';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DashboardSidebarProps {
  userName?: string;
  planLabel?: string;
}

/* ------------------------------------------------------------------ */
/*  Navigation items                                                   */
/* ------------------------------------------------------------------ */

const navItems = [
  { icon: '\u{1F305}', label: "Aujourd'hui", href: '/dashboard' },
  { icon: '\u{1F33F}', label: 'Mon Programme', href: '/dashboard/programme' },
  { icon: '\u{1F4DA}', label: '17 Modules', href: '/dashboard/modules' },
  { icon: '\u{1F54A}\u{FE0F}', label: 'Sagesse', href: '/dashboard/sagesse' },
  { icon: '\u{1F52E}', label: 'PRANA Scan', href: '/dashboard/scan' },
  { icon: '\u{1F464}', label: 'Mon Profil', href: '/dashboard/profil' },
] as const;

/* ------------------------------------------------------------------ */
/*  Mini Living Orb (40px decorative)                                  */
/* ------------------------------------------------------------------ */

function MiniOrb() {
  return (
    <div className="relative h-10 w-10 flex-shrink-0">
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-full bg-jade/20 animate-breathe" />
      {/* Core */}
      <div className="absolute inset-1.5 rounded-full bg-jade/40" />
      {/* Inner bright point */}
      <div className="absolute inset-3 rounded-full bg-jade/70" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DashboardSidebar                                                   */
/* ------------------------------------------------------------------ */

export default function DashboardSidebar({
  userName,
  planLabel = 'Gratuit',
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  /** Check active state — exact match for /dashboard, startsWith for sub-routes */
  const isActive = (href: string) =>
    href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname.startsWith(href);

  /* ---- Shared sidebar content ---- */
  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Top — branding */}
      <div className="flex items-center gap-3 px-5 py-6">
        <MiniOrb />
        <span className="font-display text-jade tracking-display text-base select-none">
          PRANA
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (sidebarOpen) toggleSidebar();
              }}
              className={`
                group flex items-center gap-3 rounded-md px-3 py-2.5
                font-mono text-[12px] tracking-label transition-colors
                ${
                  active
                    ? 'border-l-2 border-jade bg-jade-dim text-text'
                    : 'border-l-2 border-transparent text-muted hover:bg-bg-surface hover:text-text'
                }
              `}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom — user info */}
      {userName && (
        <div className="border-t border-border px-5 py-4">
          <p className="font-mono text-[11px] text-text truncate">
            {userName}
          </p>
          <span className="mt-1 inline-block rounded-full bg-jade-dim px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-label text-jade">
            {planLabel}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* ---- Desktop sidebar ---- */}
      <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0 bg-bg-secondary border-r border-border z-30">
        {sidebarContent}
      </aside>

      {/* ---- Mobile overlay ---- */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={toggleSidebar}
            aria-hidden="true"
          />

          {/* Drawer */}
          <aside className="fixed inset-y-0 left-0 z-50 w-60 bg-bg-secondary border-r border-border lg:hidden">
            {/* Close button */}
            <button
              type="button"
              onClick={toggleSidebar}
              className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:text-text hover:bg-bg-surface"
              aria-label="Fermer le menu"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <line x1="1" y1="1" x2="13" y2="13" />
                <line x1="13" y1="1" x2="1" y2="13" />
              </svg>
            </button>

            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
