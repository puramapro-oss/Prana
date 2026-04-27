"use client"

import { useState } from "react"
import { Phone, ExternalLink, X } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

/**
 * Affiché 1×/30j (logique côté serveur via /api/safety/event consult_prompt qui touche
 * profile.metadata.last_pro_consult_prompt_at). Le composant côté client se contente
 * de respecter le `defaultOpen` calculé serveur.
 */
interface ProConsultPromptProps {
  defaultOpen: boolean
}

export function ProConsultPrompt({ defaultOpen }: ProConsultPromptProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [submitting, setSubmitting] = useState(false)

  if (!defaultOpen) return null

  const close = async (proReferred: boolean) => {
    setSubmitting(true)
    try {
      await fetch("/api/safety/event", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          trigger: "consult_prompt",
          severity: "low",
          pro_referred: proReferred,
        }),
      })
      setOpen(false)
      if (proReferred) {
        toast.success("Bonne décision. Prends ton temps.")
      }
    } catch {
      toast.error("Réessaie dans un instant.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) void close(false) }}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
        <SheetHeader className="text-left space-y-2">
          <SheetTitle>Quand consulter quelqu&apos;un de formé</SheetTitle>
          <SheetDescription>
            PURAMA t&apos;accompagne. Mais nous ne remplaçons pas un soignant. On rappelle ça 1× tous les 30 jours, doucement.
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-6 pt-3 space-y-4">
          <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <li>• Si tu dors moins de 5 h plusieurs nuits d&apos;affilée.</li>
            <li>• Si tu te sens isolé·e ou éteint·e depuis plusieurs jours.</li>
            <li>• Si des pensées sombres reviennent sans que tu arrives à t&apos;en détacher.</li>
            <li>• Si quelque chose en toi te dit «&nbsp;ça va trop loin&nbsp;».</li>
          </ul>

          <div className="rounded-2xl glass border border-primary/30 p-4 space-y-3">
            <p className="text-sm leading-relaxed">
              Un médecin généraliste, un psychologue, ou la ligne d&apos;écoute nationale 3114 — c&apos;est gratuit, c&apos;est anonyme.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button asChild size="sm">
                <a href="tel:3114" onClick={() => void close(true)}>
                  <Phone className="size-4" />
                  Appeler le 3114
                </a>
              </Button>
              <Button asChild size="sm" variant="outline">
                <a
                  href="https://findahelpline.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => void close(true)}
                >
                  <ExternalLink className="size-4" />
                  Lignes internationales
                </a>
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              disabled={submitting}
              onClick={() => void close(false)}
            >
              <X className="size-4" />
              Fermer · merci
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
