"use client"

import { useEffect, useState } from "react"
import {
  Loader2,
  RefreshCw,
  Lock,
  Sun,
  Moon,
  Battery,
  BatteryFull,
  BatteryLow,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { Plan, LifeosPlan } from "@/lib/supabase/types"
import type { Plan7DaysOutput } from "@/lib/agent/prompts/plan-7days"

interface Plan7DaysViewProps {
  plan: Plan
}

interface PlanResponse {
  ok: true
  plan: (LifeosPlan & { user_id: string }) | null
  cached?: boolean
  fallback_used?: boolean
}

const ENERGY_ICON = {
  low: BatteryLow,
  medium: Battery,
  high: BatteryFull,
} as const

const ENERGY_LABEL = {
  low: "Énergie douce",
  medium: "Énergie ok",
  high: "Énergie haute",
} as const

const WEEKDAY = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]

export function Plan7DaysView({ plan }: Plan7DaysViewProps) {
  const locked = plan !== "pro" && plan !== "ultime"

  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [data, setData] = useState<Plan7DaysOutput | null>(null)
  const [generatedAt, setGeneratedAt] = useState<string | null>(null)

  useEffect(() => {
    let cancel = false
    async function load() {
      try {
        const r = await fetch("/api/lifeos/plan-7days")
        if (!r.ok) throw new Error("fetch failed")
        const j = (await r.json()) as PlanResponse
        if (cancel) return
        if (j.plan?.payload) {
          setData(j.plan.payload as unknown as Plan7DaysOutput)
          setGeneratedAt(j.plan.generated_at)
        }
      } catch (e) {
        if (!cancel) console.error("[plan-7days] load", e)
      } finally {
        if (!cancel) setLoading(false)
      }
    }
    if (!locked) load()
    else setLoading(false)
    return () => {
      cancel = true
    }
  }, [locked])

  async function generate(force = false) {
    if (locked || generating) return
    setGenerating(true)
    try {
      const r = await fetch("/api/lifeos/plan-7days", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ force }),
      })
      const j = (await r.json()) as PlanResponse | { error: string }
      if (!r.ok || !("ok" in j)) {
        throw new Error("error" in j ? j.error : "Erreur")
      }
      if (j.plan?.payload) {
        setData(j.plan.payload as unknown as Plan7DaysOutput)
        setGeneratedAt(j.plan.generated_at)
        toast.success(j.cached ? "Plan rechargé." : "Plan régénéré.")
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur de génération.")
    } finally {
      setGenerating(false)
    }
  }

  if (locked) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card/40 p-8 sm:p-12 text-center max-w-2xl mx-auto">
        <Lock className="mx-auto size-8 text-primary/70" strokeWidth={1.5} />
        <h2 className="mt-4 font-heading text-xl">Plan 7 jours · Plan Pro</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          Le Plan 7 jours est généré par l&apos;IA pour calibrer ta semaine selon
          ton énergie réelle et tes priorités. Disponible sur le plan Pro.
        </p>
        <Button asChild className="mt-6">
          <a href="/pricing">Découvrir le plan Pro</a>
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        <span className="ml-2 text-sm">Chargement…</span>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-card/30 p-10 text-center max-w-2xl mx-auto">
        <Sun className="mx-auto size-8 text-amber-300/70" strokeWidth={1.4} />
        <h2 className="mt-4 font-heading text-xl">Génère ton plan de la semaine.</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          Je calibre les 7 prochains jours selon ton énergie récente et tes
          tâches prioritaires. Ça prend ~10 secondes.
        </p>
        <Button
          onClick={() => generate(false)}
          disabled={generating}
          className="mt-6"
        >
          {generating ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Génération en cours…
            </>
          ) : (
            <>
              <Sun className="size-4 mr-2" />
              Générer mon plan 7 jours
            </>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Plan généré
            {generatedAt
              ? ` le ${new Date(generatedAt).toLocaleString("fr-FR", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}`
              : ""}
          </p>
        </div>
        <Button
          onClick={() => generate(true)}
          disabled={generating}
          variant="outline"
          size="sm"
        >
          {generating ? (
            <>
              <Loader2 className="size-3.5 mr-1.5 animate-spin" />
              Régénération…
            </>
          ) : (
            <>
              <RefreshCw className="size-3.5 mr-1.5" />
              Régénérer
            </>
          )}
        </Button>
      </div>

      <p className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm leading-relaxed text-foreground/90">
        {data.summary}
      </p>

      <ul className="space-y-2">
        {data.days.map((d, i) => {
          const date = new Date(d.date + "T00:00:00")
          const wd = WEEKDAY[date.getDay()] ?? ""
          const Energy = ENERGY_ICON[d.energy_hint] ?? Battery
          const isToday = i === 0
          return (
            <li
              key={d.date}
              className={cn(
                "rounded-xl border p-4 sm:p-5 transition",
                isToday
                  ? "border-primary/50 bg-primary/[0.04] shadow-md shadow-primary/10"
                  : "border-border/50 bg-card/60",
              )}
            >
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <div className="flex items-baseline gap-2">
                  <span className="font-heading text-base capitalize">{wd}</span>
                  <span className="text-xs text-muted-foreground">
                    {date.toLocaleDateString("fr-FR", { day: "2-digit", month: "long" })}
                  </span>
                </div>
                {isToday ? (
                  <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary">
                    Aujourd&apos;hui
                  </span>
                ) : null}
                <span
                  className={cn(
                    "ml-auto inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] uppercase tracking-wider",
                    d.energy_hint === "high"
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                      : d.energy_hint === "low"
                        ? "border-blue-400/40 bg-blue-400/10 text-blue-200"
                        : "border-border/50 bg-muted/40 text-muted-foreground",
                  )}
                >
                  <Energy className="size-3" />
                  {ENERGY_LABEL[d.energy_hint]}
                </span>
              </div>

              <p className="text-sm text-muted-foreground italic">{d.focus}</p>

              <p className="mt-3 text-base sm:text-lg font-medium leading-snug">
                {d.action}
              </p>

              {d.micro_actions.length > 0 ? (
                <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {d.micro_actions.map((m, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Moon className="mt-1 size-3 shrink-0 opacity-50" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
