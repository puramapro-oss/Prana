"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Lock, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  PROTOCOL_CATEGORIES,
  PROTOCOLS,
  type ProtocolDefinition,
  type ProtocolCategory,
} from "@/lib/regulate/protocols"
import type { Plan } from "@/lib/supabase/types"

const PLAN_TIER: Record<Plan, number> = { free: 0, starter: 1, pro: 2, ultime: 3 }

interface ProtocolListProps {
  plan: Plan
}

function durationLabel(seconds: number): string {
  if (seconds < 60) return `${seconds} sec`
  const m = Math.round(seconds / 60)
  return `${m} min`
}

export function ProtocolList({ plan }: ProtocolListProps) {
  const [q, setQ] = useState("")
  const [cat, setCat] = useState<ProtocolCategory | "all">("all")

  const filtered = useMemo(() => {
    const lower = q.trim().toLowerCase()
    return PROTOCOLS.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false
      if (!lower) return true
      return (
        p.name_fr.toLowerCase().includes(lower) ||
        p.description_fr.toLowerCase().includes(lower) ||
        p.category.toLowerCase().includes(lower)
      )
    })
  }, [q, cat])

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="relative">
          <Search
            className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2"
            strokeWidth={1.8}
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Chercher un protocole…"
            className="pl-9 h-11"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto -mx-1 px-1 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {PROTOCOL_CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCat(c.value)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors",
                cat === c.value
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center">
          Aucun protocole. Essaie un autre mot.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map((p) => (
            <ProtocolCard key={p.slug} protocol={p} userPlan={plan} />
          ))}
        </div>
      )}
    </div>
  )
}

function ProtocolCard({ protocol, userPlan }: { protocol: ProtocolDefinition; userPlan: Plan }) {
  const locked = PLAN_TIER[userPlan] < PLAN_TIER[protocol.base_plan]
  return (
    <Link
      href={`/regulate/${protocol.slug}`}
      className={cn(
        "group flex flex-col gap-3 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-md p-4 sm:p-5 transition-all",
        "hover:border-primary/40 hover:bg-card/80 hover:-translate-y-0.5",
        locked && "opacity-80",
      )}
      aria-label={`${protocol.name_fr} — ${durationLabel(protocol.duration_seconds)}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className="size-10 rounded-xl flex items-center justify-center bg-primary/10 text-2xl"
          aria-hidden
        >
          {protocol.hero}
        </div>
        {locked ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-card/70 border border-border/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <Lock className="size-3" strokeWidth={1.8} />
            {protocol.base_plan}
          </span>
        ) : (
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/80">
            {durationLabel(protocol.duration_seconds)}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="font-heading text-lg leading-tight">{protocol.name_fr}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
          {protocol.description_fr}
        </p>
      </div>
      <div className="text-[11px] text-muted-foreground/70 capitalize mt-auto">
        {protocol.category}
      </div>
    </Link>
  )
}
