"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Wind, ListChecks, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { MagicButtonConfig } from "@/lib/agent/magic-buttons-config"
import type { MagicButtonResponse } from "@/lib/agent/prompts/magic-buttons"
import { track } from "@/lib/analytics"

interface MagicButtonModalProps {
  button: MagicButtonConfig
  locked: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ApiSuccess {
  ok: true
  button: { slug: string; name: string }
  response: MagicButtonResponse
  fallback_used: boolean
  safetyRedirect: string | null
  quota: { used: number; limit: number; unlimited: boolean }
}

interface ApiError {
  error: string
  upgradeRequired?: string
  quotaReached?: boolean
}

const NEEDS_USER_CONTEXT: Record<string, string | null> = {
  "focus-tunnel": "Quelle tâche tu veux verrouiller en focus ?",
  procrastination: "Quelle tâche tu reportes ?",
  "plan-7-days": "Quel objectif domine ta semaine ?",
  "mind-dump": null,
  "save-day": null,
  "stop-stress": null,
  "anti-chaos": null,
  exhausted: null,
  "sleep-express": null,
  confidence: "Pour quel rendez-vous / prise de parole ?",
  "inbox-clean": null,
  "room-of-day": null,
}

export function MagicButtonModal({ button, locked, open, onOpenChange }: MagicButtonModalProps) {
  const router = useRouter()
  const [phase, setPhase] = useState<"input" | "loading" | "result">("input")
  const [userContext, setUserContext] = useState("")
  const [result, setResult] = useState<MagicButtonResponse | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [upgradePrompt, setUpgradePrompt] = useState<string | null>(null)

  const contextQuestion = NEEDS_USER_CONTEXT[button.slug] ?? null

  function reset() {
    setPhase("input")
    setUserContext("")
    setResult(null)
    setErrorMsg(null)
    setUpgradePrompt(null)
  }

  function handleClose(value: boolean) {
    if (!value) reset()
    onOpenChange(value)
  }

  async function handleStart() {
    setPhase("loading")
    setErrorMsg(null)
    track("magic_button_clicked", { slug: button.slug })
    try {
      const r = await fetch("/api/agent/magic-button", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug: button.slug,
          user_context: userContext.trim() ? userContext.trim() : undefined,
        }),
      })
      const json = (await r.json()) as ApiSuccess | ApiError
      if (!r.ok || "error" in json) {
        const err = json as ApiError
        if (err.upgradeRequired) {
          setUpgradePrompt(err.upgradeRequired)
          setPhase("input")
          return
        }
        throw new Error(err.error ?? "Erreur")
      }
      const ok = json as ApiSuccess
      if (ok.safetyRedirect) {
        toast("Je m'inquiète. Je t'emmène en lieu sûr.")
        router.push(ok.safetyRedirect)
        handleClose(false)
        return
      }
      setResult(ok.response)
      setPhase("result")
      track("magic_button_used", { slug: button.slug, fallback: ok.fallback_used })
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur"
      setErrorMsg(msg)
      setPhase("input")
    }
  }

  async function handleDone() {
    toast.success("Bien joué.")
    handleClose(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl flex items-center gap-2">
            <button.icon className="size-5 text-primary" strokeWidth={1.7} />
            {button.name}
          </DialogTitle>
          <DialogDescription>
            {button.description} <span className="text-foreground/70">— {button.durationLabel}</span>
          </DialogDescription>
        </DialogHeader>

        {locked ? (
          <div className="space-y-4 py-3">
            <p className="text-sm text-muted-foreground">
              Ce bouton fait partie du plan{" "}
              <span className="text-foreground font-medium capitalize">{button.plan}</span>.
            </p>
            <Button
              size="lg"
              className="w-full"
              onClick={() => router.push("/pricing")}
            >
              Voir les plans
            </Button>
          </div>
        ) : phase === "input" ? (
          <div className="space-y-4 py-2">
            {upgradePrompt ? (
              <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-foreground/90">
                Ce bouton fait partie du plan{" "}
                <span className="font-medium capitalize">{upgradePrompt}</span>.{" "}
                <button
                  className="underline underline-offset-2"
                  onClick={() => router.push("/pricing")}
                >
                  Voir les plans
                </button>
              </div>
            ) : null}
            {contextQuestion ? (
              <div className="space-y-2">
                <label htmlFor="ctx" className="text-sm text-foreground/85">
                  {contextQuestion}
                </label>
                <Textarea
                  id="ctx"
                  value={userContext}
                  onChange={(e) => setUserContext(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  placeholder="Une phrase suffit."
                  className="resize-none"
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Tu peux y aller. Je t&apos;accompagne pas à pas.
              </p>
            )}
            {errorMsg ? (
              <p className="text-sm text-destructive">{errorMsg}</p>
            ) : null}
            <Button onClick={handleStart} size="lg" className="w-full">
              <Sparkles className="size-4" strokeWidth={1.8} />
              Lancer
            </Button>
          </div>
        ) : phase === "loading" ? (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <Loader2 className="size-8 animate-spin text-primary" strokeWidth={1.6} />
            <p className="text-sm text-muted-foreground">
              Je prépare ton protocole. Quelques secondes.
            </p>
          </div>
        ) : (
          <div className="space-y-5 py-2">
            <p className="text-base leading-relaxed text-foreground/90">{result?.intro}</p>

            {result?.protocol_steps.length ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary">
                  <Wind className="size-3.5" strokeWidth={1.8} />
                  Protocole
                </div>
                <ol className="space-y-2.5">
                  {result.protocol_steps.map((step, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded-lg border border-border/40 bg-card/40 p-3"
                    >
                      <span className="size-6 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-relaxed">{step.label}</p>
                        {step.duration_seconds ? (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {step.duration_seconds < 60
                              ? `${step.duration_seconds} sec`
                              : `${Math.round(step.duration_seconds / 60)} min`}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary">
                <ListChecks className="size-3.5" strokeWidth={1.8} />
                Une seule action
              </div>
              <p className="font-medium text-foreground leading-relaxed">{result?.action}</p>
            </div>

            <Button onClick={handleDone} size="lg" className="w-full">
              {result?.cta ?? "C'est fait"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
