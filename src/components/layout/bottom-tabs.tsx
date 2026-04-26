"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { NAV_ITEMS } from "@/lib/nav"
import { cn } from "@/lib/utils"

export function BottomTabs() {
  const pathname = usePathname()
  const items = NAV_ITEMS.filter((i) => i.bottom)

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border/40 bg-background/85 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]"
      aria-label="Navigation principale"
    >
      <div className="grid grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10.5px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon
                className={cn("size-5", active ? "" : "opacity-80")}
                strokeWidth={active ? 2 : 1.6}
              />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
