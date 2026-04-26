"use client"

import { useState } from "react"
import { Activity, Battery, Clock, MapPin, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { TactileSlider } from "./tactile-slider"
import { useCreatePulseCheck, type PulseCheckPayload } from "@/hooks/use-pulse-check"
import { cn } from "@/lib/utils"

const TIME_OPTIONS: { value: PulseCheckPayload["time_available"]; label: string }[] = [
  { value: "20s", label: "20 sec" },
  { value: "2min", label: "2 min" },
  { value: "10min", label: "10 min" },
  { value: "1h", label: "1 heure" },
]

const CONTEXT_OPTIONS: { value: PulseCheckPayload["context"]; label: string }[] = [
  { value: "home", label: "Maison" },
  { value: "work", label: "Travail" },
  { value: "outside", label: "Dehors" },
  { value: "transit", label: "Transport" },
  { value: "bed", label: "Lit" },
  { value: "other", label: "Autre" },
]

interface PulseCheckSliderProps {
  defaults?: Partial<PulseCheckPayload>
  showNotes?: boolean
  onCompleted?: (pulseId: string) => void
  /** Compact mode for embedding inside other flows (regulate before/after). */
  variant?: "card" | "inline"
  ctaLabel?: string
}

const stressLabel = (v: number) => {
  if (v <= 2) return "Calme"
  if (v <= 4) return "Léger"
  if (v <= 6) return "Sous tension"
  if (v <= 8) return "Élevé"
  return "Submergé·e"
}

const energyLabel = (v: number) => {
  if (v <= 2) return "Vidé·e"
  if (v <= 4) return "Bas"
  if (v <= 6) return "OK"
  if (v <= 8) return "Bien"
  return "Plein·e"
}

export function PulseCheckSlider({
  defaults,
  showNotes = true,
  onCompleted,
  variant = "card",
  ctaLabel = "Enregistrer",
}: PulseCheckSliderProps) {
  const router = useRouter()
  const [stress, setStress] = useState(defaults?.stress ?? 5)
  const [energy, setEnergy] = useState(defaults?.energy ?? 5)
  const [timeAvailable, setTimeAvailable] = useState<PulseCheckPayload["time_available"]>(
    defaults?.time_available ?? "2min",
  )
  const [context, setContext] = useState<PulseCheckPayload["context"]>(defaults?.context ?? "home")
  const [notes, setNotes] = useState("")

  const create = useCreatePulseCheck()

  async function handleSubmit() {
    try {
      const res = await create.mutateAsync({
        stress,
        energy,
        time_available: timeAvailable,
        context,
        notes: notes.trim() ? notes.trim() : undefined,
      })
      toast.success("Pulse enregistré.")
      onCompleted?.(res.pulse.id)
      if (res.safetyRedirect) {
        router.push(res.safetyRedirect)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur"
      toast.error(msg)
    }
  }

  const stressColor =
    stress <= 4
      ? "bg-gradient-to-r from-emerald-400/80 to-teal-400/80"
      : stress <= 6
        ? "bg-gradient-to-r from-amber-400/80 to-orange-400/80"
        : "bg-gradient-to-r from-orange-500/80 to-rose-500/80"

  const energyColor =
    energy <= 3
      ? "bg-gradient-to-r from-slate-400/80 to-blue-400/80"
      : energy <= 6
        ? "bg-gradient-to-r from-sky-400/80 to-teal-400/80"
        : "bg-gradient-to-r from-teal-400/80 to-emerald-400/80"

  const body = (
    <div className="space-y-7">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <Label className="flex items-center gap-2 text-base font-medium">
            <Activity className="size-4 text-primary" strokeWidth={1.6} />
            Stress
          </Label>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{stressLabel(stress)}</span>
            <span className="font-mono text-2xl tabular-nums text-foreground/90 w-9 text-right">
              {stress}
            </span>
          </div>
        </div>
        <TactileSlider
          value={stress}
          onValueChange={setStress}
          min={0}
          max={10}
          ariaLabel="Niveau de stress"
          rangeClassName={stressColor}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <Label className="flex items-center gap-2 text-base font-medium">
            <Battery className="size-4 text-primary" strokeWidth={1.6} />
            Énergie
          </Label>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{energyLabel(energy)}</span>
            <span className="font-mono text-2xl tabular-nums text-foreground/90 w-9 text-right">
              {energy}
            </span>
          </div>
        </div>
        <TactileSlider
          value={energy}
          onValueChange={setEnergy}
          min={0}
          max={10}
          ariaLabel="Niveau d'énergie"
          rangeClassName={energyColor}
        />
      </div>

      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-base font-medium">
          <Clock className="size-4 text-primary" strokeWidth={1.6} />
          Temps dispo
        </Label>
        <div className="grid grid-cols-4 gap-2">
          {TIME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTimeAvailable(opt.value)}
              className={cn(
                "rounded-xl border px-3 py-3 text-sm transition-colors",
                timeAvailable === opt.value
                  ? "border-primary bg-primary/10 text-foreground shadow-sm"
                  : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground",
              )}
              aria-pressed={timeAvailable === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-base font-medium">
          <MapPin className="size-4 text-primary" strokeWidth={1.6} />
          Où es-tu ?
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {CONTEXT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setContext(opt.value)}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-sm transition-colors",
                context === opt.value
                  ? "border-primary bg-primary/10 text-foreground shadow-sm"
                  : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground",
              )}
              aria-pressed={context === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {showNotes ? (
        <div className="space-y-2">
          <Label htmlFor="pulse-notes" className="text-sm text-muted-foreground">
            Une phrase, si tu veux. (optionnel)
          </Label>
          <Textarea
            id="pulse-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ce qui se passe, là, maintenant…"
            maxLength={2000}
            rows={2}
            className="resize-none"
          />
        </div>
      ) : null}

      <Button
        onClick={handleSubmit}
        disabled={create.isPending}
        size="lg"
        className="w-full"
      >
        {create.isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Enregistrement…
          </>
        ) : (
          ctaLabel
        )}
      </Button>
    </div>
  )

  if (variant === "inline") return body

  return (
    <Card className="glass">
      <CardHeader className="space-y-2">
        <CardTitle className="font-heading text-2xl">Pulse Check</CardTitle>
        <CardDescription>
          Comment tu te sens, là ? Trois sliders. Vingt secondes.
        </CardDescription>
      </CardHeader>
      <CardContent>{body}</CardContent>
    </Card>
  )
}
