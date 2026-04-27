"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface BillingCardProps {
  plan: string
  trialEndsAt: string | null
  hasCustomer: boolean
}

export function BillingCard({ plan, trialEndsAt, hasCustomer }: BillingCardProps) {
  const [pending, start] = useTransition()

  async function openPortal() {
    start(async () => {
      const r = await fetch("/api/stripe/portal", { method: "POST" })
      const json = (await r.json()) as { ok?: true; url?: string; error?: string }
      if (!r.ok || !json.url) {
        toast.error(json.error ?? "Portal indisponible.")
        return
      }
      window.location.href = json.url
    })
  }

  const trialActive = trialEndsAt && new Date(trialEndsAt).getTime() > Date.now()

  return (
    <Card className="glass">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Abonnement</CardTitle>
        <CardDescription>Plan {plan.toUpperCase()}.{" "}
          {trialActive ? `Essai jusqu'au ${new Date(trialEndsAt!).toLocaleDateString("fr-FR")}.` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl glass border border-border/40 p-4 space-y-2">
          <p className="text-sm leading-relaxed">
            Gère ta carte, ton plan, tes factures depuis le portail Stripe sécurisé.
          </p>
          <p className="text-xs text-muted-foreground">
            {hasCustomer
              ? "Connecté à Stripe."
              : "Aucun moyen de paiement enregistré pour l'instant."}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center">
          <Button variant="outline" asChild>
            <a href="/pricing">Voir les plans</a>
          </Button>
          <Button onClick={openPortal} disabled={!hasCustomer || pending}>
            <ExternalLink className="size-4" />
            {pending ? "Ouverture…" : "Ouvrir le portail"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
