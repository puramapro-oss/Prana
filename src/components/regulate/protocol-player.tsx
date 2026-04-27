"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Play, Pause, X, Check, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BreathingCircle } from "./breathing-circle"
import { PulseCheckSlider } from "@/components/pulse/pulse-check-slider"
import { cn } from "@/lib/utils"
import { track } from "@/lib/analytics"
import type { ProtocolDefinition, ProtocolStep } from "@/lib/regulate/protocols"

type Stage = "before" | "running" | "after" | "done"

interface ProtocolPlayerProps {
  protocol: ProtocolDefinition
}

interface StartResp {
  ok: boolean
  session_id: string
}

interface CompleteResp {
  ok: boolean
}

export function ProtocolPlayer({ protocol }: ProtocolPlayerProps) {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>("before")
  const [stepIndex, setStepIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const startedAtRef = useRef<number>(0)

  const currentStep: ProtocolStep | undefined = protocol.steps[stepIndex]

  useEffect(() => {
    if (stage !== "running" || paused) return
    if (!currentStep || currentStep.type === "breath") return
    // Timed step
    const ms = currentStep.duration_seconds * 1000
    const t = setTimeout(() => advanceStep(), ms)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, stepIndex, paused])

  function advanceStep() {
    setStepIndex((i) => {
      const next = i + 1
      if (next >= protocol.steps.length) {
        setStage("after")
        return i
      }
      return next
    })
  }

  async function startProtocol(beforePulseId: string | null) {
    startedAtRef.current = Date.now()
    try {
      const r = await fetch("/api/regulate/protocol", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "start",
          protocol_slug: protocol.slug,
          pulse_before_id: beforePulseId,
        }),
      })
      const j = (await r.json()) as StartResp | { error: string }
      if (!r.ok || "error" in j) throw new Error(("error" in j && j.error) || "Erreur")
      setSessionId((j as StartResp).session_id)
      setStage("running")
      setStepIndex(0)
      track("protocol_started", { slug: protocol.slug })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur")
    }
  }

  async function completeProtocol(afterPulseId: string | null) {
    if (!sessionId) {
      router.push("/regulate")
      return
    }
    setSubmitting(true)
    try {
      const elapsed = Math.round((Date.now() - startedAtRef.current) / 1000)
      const r = await fetch("/api/regulate/protocol", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "complete",
          session_id: sessionId,
          pulse_after_id: afterPulseId,
          duration_seconds_actual: elapsed,
        }),
      })
      const j = (await r.json()) as CompleteResp | { error: string }
      if (!r.ok || "error" in j) throw new Error(("error" in j && j.error) || "Erreur")
      toast.success("Bien joué.")
      setStage("done")
      track("protocol_completed", { slug: protocol.slug, duration_s: elapsed })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur")
    } finally {
      setSubmitting(false)
    }
  }

  if (stage === "before") {
    return (
      <div className="space-y-6">
        <Card className="glass">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{protocol.hero}</div>
              <div>
                <h2 className="font-heading text-2xl">{protocol.name_fr}</h2>
                <p className="text-sm text-muted-foreground">
                  {Math.round(protocol.duration_seconds / 60) || 1} min · {protocol.category}
                </p>
              </div>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {protocol.description_fr}
            </p>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <div className="text-sm text-muted-foreground px-1">
            On commence par un Pulse Check rapide. Tu pourras le refaire après.
          </div>
          <PulseCheckSlider
            variant="card"
            showNotes={false}
            ctaLabel="Commencer le protocole"
            onCompleted={(id) => startProtocol(id)}
          />
        </div>

        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => startProtocol(null)}
            className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
          >
            Démarrer sans Pulse Check
          </button>
        </div>
      </div>
    )
  }

  if (stage === "running") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="text-xs text-muted-foreground tabular-nums">
            Étape {stepIndex + 1} / {protocol.steps.length}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setPaused((p) => !p)}
            >
              {paused ? (
                <>
                  <Play className="size-4" /> Reprendre
                </>
              ) : (
                <>
                  <Pause className="size-4" /> Pause
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setStage("after")}
              aria-label="Terminer maintenant"
            >
              <X className="size-4" /> Stop
            </Button>
          </div>
        </div>

        {currentStep ? (
          currentStep.type === "breath" ? (
            <BreathingCircle
              step={currentStep}
              paused={paused}
              onComplete={advanceStep}
            />
          ) : (
            <Card className="glass">
              <CardContent className="p-6 sm:p-8 text-center space-y-4">
                <div className="text-[11px] uppercase tracking-wider text-primary">
                  {currentStep.type === "ground"
                    ? "Ancrage"
                    : currentStep.type === "stretch"
                      ? "Étirement"
                      : currentStep.type === "visualize"
                        ? "Visualisation"
                        : currentStep.type === "say"
                          ? "À voix basse"
                          : "Pause"}
                </div>
                <p className="font-heading text-xl sm:text-2xl leading-snug">
                  {currentStep.label}
                </p>
                <div className="text-sm text-muted-foreground tabular-nums">
                  {currentStep.duration_seconds}s
                </div>
                <div
                  className={cn(
                    "h-1 w-full rounded-full bg-muted overflow-hidden",
                    paused && "opacity-50",
                  )}
                >
                  <div
                    className="h-full bg-primary transition-[width]"
                    style={{
                      width: paused ? "50%" : "100%",
                      transitionDuration: `${currentStep.duration_seconds}s`,
                      transitionTimingFunction: "linear",
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )
        ) : null}
      </div>
    )
  }

  if (stage === "after") {
    return (
      <div className="space-y-5">
        <Card className="glass">
          <CardContent className="p-6 space-y-2">
            <h2 className="font-heading text-2xl">Comment tu te sens maintenant ?</h2>
            <p className="text-sm text-muted-foreground">
              Un dernier Pulse Check pour mesurer l&apos;effet.
            </p>
          </CardContent>
        </Card>
        <PulseCheckSlider
          variant="card"
          showNotes={false}
          ctaLabel={submitting ? "Enregistrement…" : "Terminer"}
          onCompleted={(id) => completeProtocol(id)}
        />
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => completeProtocol(null)}
            disabled={submitting}
            className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline inline-flex items-center gap-1"
          >
            {submitting ? <Loader2 className="size-3 animate-spin" /> : null}
            Terminer sans Pulse Check
          </button>
        </div>
      </div>
    )
  }

  // done
  return (
    <Card className="glass border-primary/30">
      <CardContent className="p-8 text-center space-y-4">
        <div className="size-12 mx-auto rounded-full bg-primary/15 flex items-center justify-center">
          <Check className="size-6 text-primary" strokeWidth={2} />
        </div>
        <h2 className="font-heading text-2xl">Protocole terminé</h2>
        <p className="text-sm text-muted-foreground">
          Tu peux y revenir quand tu veux. Pas de pression.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
          <Button onClick={() => router.push("/today")}>Retour à aujourd&apos;hui</Button>
          <Button variant="outline" onClick={() => router.push("/regulate")}>
            Voir d&apos;autres protocoles
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
