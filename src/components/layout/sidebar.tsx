"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Wind } from "lucide-react"
import { NAV_ITEMS } from "@/lib/nav"
import { cn } from "@/lib/utils"
import { SignOutButton } from "@/components/shared/sign-out-button"

interface SidebarProps {
  displayName: string
  plan: string
}

export function Sidebar({ displayName, plan }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:border-r md:border-border/40 md:bg-sidebar/80 md:backdrop-blur-xl md:z-30">
      <div className="flex h-14 items-center px-5 border-b border-border/40">
        <Link href="/today" className="flex items-center gap-2">
          <span className="size-8 rounded-xl bg-primary/15 flex items-center justify-center">
            <Wind className="size-4 text-primary" strokeWidth={1.8} />
          </span>
          <span className="font-heading text-base tracking-tight">PURAMA ONE</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV_ITEMS.filter((i) => !i.sidebarHidden).map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary/10 text-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" strokeWidth={1.8} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border/40 px-4 py-3 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate">{displayName}</div>
            <div className="text-xs text-muted-foreground capitalize">Plan {plan}</div>
          </div>
        </div>
        <SignOutButton />
      </div>
    </aside>
  )
}
