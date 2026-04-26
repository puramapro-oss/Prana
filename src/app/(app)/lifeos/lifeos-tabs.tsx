"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Inbox,
  ListChecks,
  Layers,
  Users,
  FileText,
  CalendarRange,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Tab {
  href: string
  label: string
  icon: LucideIcon
  exact?: boolean
}

const TABS: Tab[] = [
  { href: "/lifeos", label: "Inbox", icon: Inbox, exact: true },
  { href: "/lifeos/tasks", label: "Tâches", icon: ListChecks },
  { href: "/lifeos/projects", label: "Projets", icon: Layers },
  { href: "/lifeos/people", label: "Personnes", icon: Users },
  { href: "/lifeos/notes", label: "Notes", icon: FileText },
  { href: "/lifeos/plan", label: "Plan 7j", icon: CalendarRange },
]

export function LifeosTabs() {
  const pathname = usePathname()
  return (
    <div className="border-b border-border/40">
      <div className="container-calm flex items-end gap-1 overflow-x-auto pt-4 pb-0 -mb-px">
        {TABS.map((tab) => {
          const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "inline-flex items-center gap-2 px-3 py-2.5 text-sm border-b-2 transition-colors whitespace-nowrap",
                active
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
              )}
            >
              <tab.icon className="size-4" strokeWidth={1.7} />
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
