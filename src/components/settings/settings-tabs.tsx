"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const TABS = [
  { href: "/settings", label: "Profil" },
  { href: "/settings/billing", label: "Abonnement" },
  { href: "/settings/referral", label: "Parrainage" },
  { href: "/settings/safety", label: "Sécurité" },
  { href: "/settings/notifications", label: "Notifications" },
  { href: "/settings/data", label: "Données" },
]

export function SettingsTabs() {
  const pathname = usePathname()
  return (
    <nav className="flex gap-1 overflow-x-auto -mx-1 px-1 pb-2 mb-4 border-b border-border/40">
      {TABS.map((t) => {
        const active = pathname === t.href
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "px-3 py-1.5 text-sm rounded-md whitespace-nowrap transition-colors",
              active
                ? "bg-primary/10 text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            {t.label}
          </Link>
        )
      })}
    </nav>
  )
}
