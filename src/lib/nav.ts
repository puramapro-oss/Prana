import type { LucideIcon } from "lucide-react"
import {
  CalendarHeart,
  Wind,
  Inbox,
  Sparkles,
  Users,
  Brain,
  LineChart,
  Settings,
} from "lucide-react"

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  /** Show in mobile bottom tabs (max 5 recommended). */
  bottom?: boolean
  /** Hide from sidebar (rare). */
  sidebarHidden?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/today", label: "Aujourd'hui", icon: CalendarHeart, bottom: true },
  { href: "/regulate", label: "Régulation", icon: Wind, bottom: true },
  { href: "/lifeos", label: "LifeOS", icon: Inbox, bottom: true },
  { href: "/execute", label: "Exécuter", icon: Sparkles },
  { href: "/rooms", label: "Rooms", icon: Users, bottom: true },
  { href: "/twin", label: "Twin", icon: Brain },
  { href: "/score", label: "Score", icon: LineChart },
  { href: "/settings", label: "Réglages", icon: Settings, bottom: true },
]
