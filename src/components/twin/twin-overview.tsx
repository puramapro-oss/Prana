"use client"

import { useState } from "react"
import {
  Loader2,
  RefreshCw,
  Brain,
  Lock,
  Sparkles,
  Sun,
  Battery,
  Wind,
  Compass,
  Heart,
  ScrollText,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useTwin, useRebuildTwin, useUpdateTwin } from "@/hooks/use-twin"
import { toast } from "sonner"
import type { Plan, TwinCommunicationStyle, TwinWorkingHabits } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

interface TwinOverviewProps {
  plan: Plan
}

const TONE_LABEL: Record<string, string> = {
  casual: "Décontracté",
  warm: "Chaleureux",
  professional: "Professionnel",
  direct: "Direct",
  playful: "Joueur",
}

const LENGTH_LABEL: Record<string, string> = {
  short: "Court",
  medium: "Moyen",
  long: "Long",
}

const FORMALITY_LABEL: Record<string, string> = {
  low: "Tutoiement",
  medium: "Mixte",
  high: "Vouvoiement",
}

const FOCUS_LABEL: Record<string, string> = {
  morning: "Matin",
  afternoon: "Après-midi",
  evening: "Soir",
  night: "Nuit",
}

export function TwinOverview({ plan }: TwinOverviewProps) {
  const locked = plan === "free"
  const canRebuild = plan === "pro" || plan === "ultime"

  const [rebuildSummary, setRebuildSummary] = useState<string | null>(null)
  const [confidence, setConfidence] = useState<"low" | "medium" | "high" | null>(null)

  const twinQ = useTwin()
  const rebuild = useRebuildTwin()
  const update = useUpdateTwin()

  if (locked) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card/40 p-8 sm:p-12 text-center max-w-2xl mx-auto">
        <Brain className="mx-auto size-9 text-primary/70" strokeWidth={1.4} />
        <h2 className="mt-4 font-heading text-xl">Twin · Plan Starter+</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          Ton Jumeau IA apprend ton ton, tes triggers, tes heures efficaces, et
          adapte CHAQUE réponse de PRANA à ta façon d&apos;être. Disponible
          dès le plan Starter (édition manuelle) et complet en Pro (rebuild
          automatique opus-4-7).
        </p>
        <Button asChild className="mt-6">
          <a href="/pricing">Voir les plans</a>
        </Button>
      </div>
    )
  }

  if (twinQ.isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        <span className="ml-2 text-sm">Chargement de ton Twin…</span>
      </div>
    )
  }

  const twin = twinQ.data
  const cs = (twin?.communication_style as TwinCommunicationStyle | null) ?? null
  const wh = (twin?.working_habits as TwinWorkingHabits | null) ?? null
  const lastUpdate = twin?.last_full_update ?? null

  async function handleRebuild() {
    if (!canRebuild) {
      toast.error("Le rebuild IA fait partie du plan Pro.")
      return
    }
    try {
      const result = await rebuild.mutateAsync(false)
      setRebuildSummary(result.summary)
      setConfidence(result.confidence)
      if (result.fallback_used) {
        toast.message("Twin recalculé en mode dégradé. Reprends bientôt.")
      } else {
        toast.success(
          `Twin recalculé · ${result.signal.pulses} pulses, ${result.signal.captures} captures lues.`,
        )
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur de rebuild.")
    }
  }

  async function toggleProtective(checked: boolean) {
    if (!canRebuild) {
      toast.error("Le mode protecteur fait partie du plan Pro.")
      return
    }
    try {
      await update.mutateAsync({ protective_mode: checked })
      toast.success(
        checked
          ? "Mode protecteur activé. PRANA filtre les messages stressants entrants."
          : "Mode protecteur désactivé.",
      )
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur.")
    }
  }

  const empty =
    !twin ||
    (!cs?.tone &&
      (!twin.stress_triggers || twin.stress_triggers.length === 0) &&
      (!twin.recharge_activities || twin.recharge_activities.length === 0))

  return (
    <div className="space-y-6">
      <header className="space-y-3 max-w-2xl">
        <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
          <Brain className="size-3.5 text-primary" />
          Jumeau IA
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl tracking-tight">Ton Twin.</h1>
        <p className="text-muted-foreground leading-relaxed">
          Un profil comportemental que PRANA apprend de toi — pour adapter ton, longueur,
          énergie, et timing de toutes ses réponses. Tu peux l&apos;éditer librement.
        </p>
      </header>

      <div className="flex items-center justify-between flex-wrap gap-3 rounded-xl border border-border/50 bg-card/40 px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Dernière mise à jour
          </p>
          <p className="text-sm">
            {lastUpdate
              ? new Date(lastUpdate).toLocaleString("fr-FR", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "jamais — recalcule pour démarrer"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canRebuild ? (
            <Button onClick={handleRebuild} disabled={rebuild.isPending} size="sm">
              {rebuild.isPending ? (
                <>
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                  Recalcul opus-4-7…
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5 mr-1.5" />
                  Recalculer mon Twin
                </>
              )}
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border/50 bg-muted/40 px-2 py-1 text-[11px] text-muted-foreground">
              <Lock className="size-3" />
              Rebuild IA · plan Pro
            </span>
          )}
        </div>
      </div>

      {rebuildSummary ? (
        <div className="rounded-xl border border-primary/30 bg-primary/[0.05] p-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs uppercase tracking-wider text-primary/80">
              Synthèse opus-4-7
            </span>
            {confidence ? (
              <span
                className={cn(
                  "text-[10px] uppercase tracking-wider rounded-md border px-1.5 py-0.5",
                  confidence === "high" && "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
                  confidence === "medium" && "border-amber-500/40 bg-amber-500/10 text-amber-200",
                  confidence === "low" && "border-border/50 bg-muted/40 text-muted-foreground",
                )}
              >
                Confiance {confidence}
              </span>
            ) : null}
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">{rebuildSummary}</p>
        </div>
      ) : null}

      {empty ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-card/30 p-10 text-center">
          <Brain className="mx-auto size-8 text-muted-foreground/60" strokeWidth={1.4} />
          <p className="mt-4 font-heading text-lg">Ton Twin est encore vide.</p>
          <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
            {canRebuild
              ? "Lance un recalcul ci-dessus, ou édite directement les onglets Personnalité / Règles / Valeurs."
              : "Édite tes préférences dans les onglets Personnalité, Règles, Valeurs."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <OverviewCard
            icon={<Wind className="size-4" />}
            title="Style de communication"
            empty="Pas encore observé."
            items={[
              cs?.tone ? `Ton : ${TONE_LABEL[cs.tone] ?? cs.tone}` : null,
              cs?.length ? `Longueur : ${LENGTH_LABEL[cs.length] ?? cs.length}` : null,
              cs?.formality ? `Formalité : ${FORMALITY_LABEL[cs.formality] ?? cs.formality}` : null,
            ]}
          />
          <OverviewCard
            icon={<Sun className="size-4" />}
            title="Heures efficaces"
            empty="Signal insuffisant."
            items={
              twin?.efficient_hours && twin.efficient_hours.length > 0
                ? [`${twin.efficient_hours.map((h) => `${h}h`).join(" · ")}`]
                : []
            }
          />
          <OverviewCard
            icon={<Compass className="size-4" />}
            title="Habitudes de travail"
            empty="Pas encore observé."
            items={[
              wh?.best_focus_window ? `Focus : ${FOCUS_LABEL[wh.best_focus_window] ?? wh.best_focus_window}` : null,
              wh?.preferred_session_minutes ? `Sessions : ${wh.preferred_session_minutes} min` : null,
              wh?.avoid_meetings_before_hour ? `Pas de réunion avant ${wh.avoid_meetings_before_hour}h` : null,
              wh?.weekends_off === true ? "Week-ends OFF" : null,
            ]}
          />
          <OverviewCard
            icon={<Battery className="size-4" />}
            title="Triggers stress"
            empty="Aucun trigger récurrent identifié."
            items={twin?.stress_triggers ?? []}
          />
          <OverviewCard
            icon={<Heart className="size-4" />}
            title="Recharge"
            empty="Aucun pattern de recharge."
            items={twin?.recharge_activities ?? []}
          />
          <OverviewCard
            icon={<ScrollText className="size-4" />}
            title="Règles personnelles"
            empty="Aucune règle déclarée."
            items={twin?.personal_rules ?? []}
          />
        </div>
      )}

      {canRebuild ? (
        <div className="rounded-xl border border-border/50 bg-card/40 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <Shield className="size-5 mt-0.5 text-primary/80 shrink-0" strokeWidth={1.6} />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-heading text-base">Mode protecteur</h3>
                <Switch
                  checked={twin?.protective_mode === true}
                  onCheckedChange={toggleProtective}
                  disabled={update.isPending}
                />
              </div>
              <p className="mt-1 text-sm text-muted-foreground max-w-prose">
                Quand activé, PRANA reformule les messages stressants en arrivant —
                tu vois la version filtrée d&apos;abord, l&apos;originale en option.
                Utile en période chargée.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

interface OverviewCardProps {
  icon: React.ReactNode
  title: string
  items: (string | null)[]
  empty: string
}

function OverviewCard({ icon, title, items, empty }: OverviewCardProps) {
  const filtered = items.filter((x): x is string => Boolean(x))
  return (
    <div className="rounded-xl border border-border/50 bg-card/60 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <span className="text-primary">{icon}</span>
        <span>{title}</span>
      </div>
      {filtered.length > 0 ? (
        <ul className="mt-3 space-y-1.5 text-sm">
          {filtered.map((it, i) => (
            <li key={i} className="leading-snug">
              {it}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground italic">{empty}</p>
      )}
    </div>
  )
}
