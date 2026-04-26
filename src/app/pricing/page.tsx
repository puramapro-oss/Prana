import Link from "next/link"
import { ArrowLeft, Check, Wind } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PLANS, TRIAL_DAYS } from "@/lib/stripe/plans"
import { formatPrice } from "@/lib/utils"

export const metadata = {
  title: "Tarifs",
  description: "Un tarif honnête. 7 jours Pro offerts à l'inscription, sans carte.",
}

export default function PricingPage() {
  return (
    <div className="min-h-svh">
      <header className="container-calm flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <Wind className="size-5 text-primary" strokeWidth={1.6} />
          <span className="font-heading text-lg tracking-tight">PURAMA ONE</span>
        </Link>
        <Button asChild variant="ghost" size="sm">
          <Link href="/">
            <ArrowLeft className="size-4" />
            Retour
          </Link>
        </Button>
      </header>

      <section className="container-calm py-16 md:py-20 text-center">
        <h1 className="font-heading text-4xl md:text-6xl tracking-tight">Un tarif honnête.</h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          {TRIAL_DAYS} jours Pro offerts à l&apos;inscription. Sans carte. Annule à tout moment, en un clic.
        </p>
      </section>

      <section className="container-calm pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`glass rounded-2xl p-6 space-y-5 ${
                plan.highlighted
                  ? "ring-2 ring-primary/40 shadow-2xl shadow-primary/15 lg:scale-[1.03]"
                  : ""
              }`}
            >
              {plan.highlighted && (
                <div className="text-xs uppercase tracking-wider text-primary font-medium">
                  ⭐ Le plus populaire
                </div>
              )}
              <div>
                <h3 className="font-heading text-2xl">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.tagline}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline gap-1">
                  <span className="font-heading text-4xl">
                    {plan.priceMonthly === 0 ? "0€" : formatPrice(plan.priceMonthly)}
                  </span>
                  {plan.priceMonthly > 0 && (
                    <span className="text-muted-foreground text-sm">/ mois</span>
                  )}
                </div>
                {plan.priceYearly > 0 && (
                  <p className="text-xs text-muted-foreground">
                    ou {formatPrice(plan.priceYearly)} / an —{" "}
                    <span className="text-primary font-medium">économise 20%</span>
                  </p>
                )}
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="size-4 text-primary shrink-0 mt-0.5" strokeWidth={2.2} />
                    <span className="leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                size="lg"
                variant={plan.highlighted ? "default" : "outline"}
                className="w-full"
              >
                <Link href="/signup">{plan.ctaLabel}</Link>
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          <p>
            Tous les prix sont en euros, hors taxes. SASU PURAMA, 8 Rue de la Chapelle, 25560 Frasne — TVA non
            applicable, art. 293 B du CGI.
          </p>
        </div>
      </section>
    </div>
  )
}
