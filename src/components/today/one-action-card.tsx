"use client"

import { useState } from "react"
import { Check, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLastPulseCheck } from "@/hooks/use-pulse-check"

const FALLBACK_ACTIONS: { stress: number; energy: number; text: string }[] = [
  { stress: 7, energy: 2, text: "Bois un grand verre d'eau. Rien d'autre. Tu reprends après." },
  { stress: 7, energy: 5, text: "Trois respirations 4-7-8. Une seule. Maintenant." },
  { stress: 5, energy: 3, text: "Note la première chose qui doit être faite, en une phrase." },
  { stress: 3, energy: 7, text: "Choisis la tâche la plus importante et démarre 25 minutes." },
  { stress: 2, energy: 9, text: "Profite du moment pour avancer sur ce que tu reportes." },
]

function pickAction(stress: number | undefined, energy: number | undefined): string {
  if (stress === undefined || energy === undefined) {
    return "Pose-toi 20 secondes. Trois respirations longues. Puis on choisit ensemble."
  }
  let best = FALLBACK_ACTIONS[0]
  let bestDist = Infinity
  for (const a of FALLBACK_ACTIONS) {
    const d = Math.abs(a.stress - stress) + Math.abs(a.energy - energy)
    if (d < bestDist) {
      bestDist = d
      best = a
    }
  }
  return best.text
}

interface OneActionCardProps {
  initialActionText?: string
}

export function OneActionCard({ initialActionText }: OneActionCardProps) {
  const { last } = useLastPulseCheck()
  const [done, setDone] = useState(false)
  const [pending, setPending] = useState(false)

  const action = initialActionText ?? pickAction(last?.stress, last?.energy)

  async function markDone() {
    setPending(true)
    try {
      // Optimistic: just toast + visual. Persistence in P3 (daily_scores).
      await new Promise((r) => setTimeout(r, 250))
      setDone(true)
      toast.success("C'est fait. Bien joué.")
    } finally {
      setPending(false)
    }
  }

  return (
    <Card className="glass border-primary/30">
      <CardContent className="p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary">
          <Sparkles className="size-3.5" strokeWidth={1.8} />
          Une action maintenant
        </div>

        <p className="font-heading text-2xl sm:text-3xl leading-snug text-foreground">
          {action}
        </p>

        <div className="flex items-center justify-between gap-3 pt-1">
          <p className="text-xs text-muted-foreground">
            Pas plus de trois actions aujourd&apos;hui. C&apos;est la règle.
          </p>
          <Button
            onClick={markDone}
            disabled={done || pending}
            size="lg"
            className="min-w-32"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : done ? (
              <>
                <Check className="size-4" /> Fait
              </>
            ) : (
              "C'est fait"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
