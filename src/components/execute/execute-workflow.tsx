"use client"

import { useState } from "react"
import { Loader2, Sparkles, Copy, Check, RefreshCw, Lock, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useGenerateExecution, useMarkExecutionUsed } from "@/hooks/use-execute"
import { cn } from "@/lib/utils"
import type { ExecutionType, Plan } from "@/lib/supabase/types"
import type { ExecuteAlternative, ExecuteOutput } from "@/lib/agent/prompts/execute"

interface ExecuteWorkflowProps {
  type: ExecutionType
  label: string
  description: string
  example: string
  plan: Plan
  /** Show "back to /execute" link (set true on /execute/messages, etc). */
  showBack?: boolean
}

const TONE_BADGE: Record<string, string> = {
  direct: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  warm: "border-rose-400/40 bg-rose-400/10 text-rose-200",
  professional: "border-sky-500/40 bg-sky-500/10 text-sky-200",
  concise: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  playful: "border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-200",
  firm: "border-orange-500/40 bg-orange-500/10 text-orange-200",
}

export function ExecuteWorkflow({
  type,
  label,
  description,
  example,
  plan,
  showBack = false,
}: ExecuteWorkflowProps) {
  const [situation, setSituation] = useState("")
  const [recipient, setRecipient] = useState("")
  const [tone, setTone] = useState("")
  const [output, setOutput] = useState<ExecuteOutput | null>(null)
  const [executionId, setExecutionId] = useState<string | null>(null)

  const generate = useGenerateExecution()
  const markUsed = useMarkExecutionUsed()

  const locked = plan === "free"

  async function submit() {
    if (situation.trim().length < 4) {
      toast.error("Décris la situation en quelques mots.")
      return
    }
    try {
      const result = await generate.mutateAsync({
        type,
        situation: situation.trim(),
        recipient: recipient.trim() || undefined,
        tone: tone.trim() || undefined,
      })
      setOutput(result.response)
      setExecutionId(result.execution?.id ?? null)
      if (result.fallback_used) {
        toast.message("Brouillon généré (mode dégradé). Tu peux régénérer.")
      } else {
        toast.success("3 alternatives prêtes.")
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur de génération.")
    }
  }

  async function copyText(alt: ExecuteAlternative) {
    try {
      await navigator.clipboard.writeText(alt.body)
      toast.success("Copié.")
      if (executionId) {
        markUsed.mutate(executionId)
      }
    } catch {
      toast.error("Impossible de copier.")
    }
  }

  if (locked) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card/40 p-8 sm:p-12 text-center max-w-2xl mx-auto">
        <Lock className="mx-auto size-8 text-primary/70" strokeWidth={1.5} />
        <h2 className="mt-4 font-heading text-xl">Execute · Plan Starter</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          La génération de messages, emails, posts et plans fait partie du plan
          Starter. Tu écris ce que tu veux dire — j&apos;en fais 3 versions
          prêtes à copier.
        </p>
        <Button asChild className="mt-6">
          <a href="/pricing">Voir le plan Starter</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {showBack ? (
        <Link
          href="/execute"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="size-3.5" />
          Tous les templates
        </Link>
      ) : null}

      <div>
        <h1 className="font-heading text-2xl sm:text-3xl tracking-tight">{label}</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-prose">{description}</p>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card/40 p-4 sm:p-5 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="exec-situation">La situation</Label>
          <Textarea
            id="exec-situation"
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder={example}
            rows={4}
            maxLength={2000}
            disabled={generate.isPending}
          />
          <p className="text-[11px] text-muted-foreground">
            {situation.length}/2000 · sois clair sur le contexte et l&apos;objectif.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="exec-recipient">Destinataire · optionnel</Label>
            <Input
              id="exec-recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Ex: mon manager, Pierre, ma sœur, mon audience LinkedIn"
              maxLength={160}
              disabled={generate.isPending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="exec-tone">Ton souhaité · optionnel</Label>
            <Input
              id="exec-tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              placeholder="Ex: ferme, chaleureux, posé, énergique"
              maxLength={60}
              disabled={generate.isPending}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            onClick={submit}
            disabled={generate.isPending || situation.trim().length < 4}
            className="min-w-44"
          >
            {generate.isPending ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Génération…
              </>
            ) : (
              <>
                <Sparkles className="size-4 mr-2" />
                {output ? "Régénérer" : "Générer 3 alternatives"}
              </>
            )}
          </Button>
        </div>
      </div>

      {output ? (
        <div className="space-y-4">
          <p className="rounded-xl border border-primary/30 bg-primary/[0.05] px-4 py-3 text-sm leading-relaxed text-foreground/90">
            {output.guidance}
          </p>

          <ul className="space-y-3">
            {output.alternatives.map((alt, i) => {
              const badge = TONE_BADGE[alt.tone.toLowerCase()] ?? "border-border/50 bg-muted/40 text-muted-foreground"
              return (
                <li
                  key={i}
                  className="rounded-xl border border-border/50 bg-card/60 p-4 sm:p-5 transition hover:border-border"
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="font-heading text-base truncate">{alt.title}</h3>
                      <span
                        className={cn(
                          "shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] uppercase tracking-wider",
                          badge,
                        )}
                      >
                        {alt.tone}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyText(alt)}
                      className="shrink-0"
                    >
                      <Copy className="size-3.5 mr-1.5" />
                      Copier
                    </Button>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {alt.body}
                  </p>
                </li>
              )
            })}
          </ul>

          <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
            <p className="text-xs text-muted-foreground">
              Pas convaincu ? <Check className="inline size-3 mx-0.5" />
              Modifie la situation ou le ton, puis régénère.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={submit}
              disabled={generate.isPending}
            >
              <RefreshCw className="size-3.5 mr-1.5" />
              Régénérer 3 nouvelles
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
