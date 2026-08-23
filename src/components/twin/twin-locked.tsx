import { Brain } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TwinLocked() {
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
