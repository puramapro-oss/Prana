import Link from "next/link"
import Script from "next/script"
import { ArrowRight, Wind, Sparkles, Brain, ListChecks, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PLANS } from "@/lib/stripe/plans"
import { formatPrice } from "@/lib/utils"

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://prana.purama.dev"

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${BASE}/#organization`,
      name: "PURAMA",
      url: BASE,
      logo: `${BASE}/icon.png`,
      sameAs: ["https://github.com/puramapro-oss"],
    },
    {
      "@type": "WebSite",
      "@id": `${BASE}/#website`,
      url: BASE,
      name: "PURAMA ONE",
      description:
        "L'OS humain qui te calme, t'organise, et exécute pour toi. Régule ton système nerveux en 20 secondes.",
      publisher: { "@id": `${BASE}/#organization` },
      inLanguage: "fr-FR",
    },
    {
      "@type": "SoftwareApplication",
      name: "PURAMA ONE",
      applicationCategory: "HealthApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "9.99",
        priceCurrency: "EUR",
      },
      aggregateRating: undefined,
    },
  ],
}

export default function HomePage() {
  return (
    <div className="min-h-svh">
      <Script
        id="ld-home"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* HEADER */}
      <header className="container-calm flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <Wind className="size-5 text-primary" strokeWidth={1.6} />
          <span className="font-heading text-lg tracking-tight">PURAMA ONE</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/manifesto" className="text-muted-foreground hover:text-foreground transition-colors">
            Manifesto
          </Link>
          <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
            Tarifs
          </Link>
          <Link href="/safety" className="text-muted-foreground hover:text-foreground transition-colors">
            Sécurité
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Se connecter</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">
              Commencer
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </header>

      <main id="main">
      {/* HERO */}
      <section className="container-calm pt-16 pb-20 md:pt-28 md:pb-32 text-center">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-primary mb-6">
          <Sparkles className="size-3.5" strokeWidth={1.8} />
          Le premier OS humain
        </div>
        <h1 className="font-heading text-5xl md:text-7xl tracking-tight max-w-4xl mx-auto leading-[1.05]">
          Calme instantané.
          <br />
          Clarté totale.
          <br />
          <span className="text-primary">Exécution automatique.</span>
        </h1>
        <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Régule ton système nerveux en 20 secondes. Organise ta vie. Laisse l&apos;IA exécuter pour toi. Un
          seul système, en synergie totale.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="h-12 px-6 text-base">
            <Link href="/signup">
              Commencer — 7 jours Pro offerts
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base">
            <Link href="/manifesto">Lire le manifeste</Link>
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Sans carte bancaire. Annule à tout moment.</p>
      </section>

      {/* 4 DIFFÉRENCIATEURS */}
      <section className="container-calm py-20 md:py-28">
        <div className="text-center mb-14">
          <h2 className="font-heading text-3xl md:text-4xl tracking-tight">
            Quatre choses, en synergie totale.
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Personne ne fait les quatre ensemble. PURAMA ONE, oui.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Wind,
              title: "Régule",
              desc: "20 secondes à 3 minutes. Protocoles guidés pour ramener le calme avant tout.",
            },
            {
              icon: ListChecks,
              title: "Organise",
              desc: "LifeOS : tâches, projets, personnes, notes. Capture vocale, classement automatique.",
            },
            {
              icon: Brain,
              title: "Exécute",
              desc: "L'agent IA rédige tes messages, mails, plans, docs. Tu approuves. Tu copies.",
            },
            {
              icon: Users,
              title: "Stabilise",
              desc: "Une seule action maintenant. Jamais plus de 3 par jour. Rooms collectives animées par l'IA.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass rounded-2xl p-6 space-y-3">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon className="size-5 text-primary" strokeWidth={1.6} />
              </div>
              <h3 className="font-heading text-xl">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING TEASER */}
      <section className="container-calm py-20 md:py-28">
        <div className="text-center mb-14">
          <h2 className="font-heading text-3xl md:text-4xl tracking-tight">Un tarif honnête.</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Commence gratuitement. Passe Pro quand tu sens la différence.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`glass rounded-2xl p-6 space-y-4 ${
                plan.highlighted ? "ring-1 ring-primary/40 shadow-xl shadow-primary/10" : ""
              }`}
            >
              <div>
                <h3 className="font-heading text-xl">{plan.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{plan.tagline}</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-heading text-3xl">
                  {plan.priceMonthly === 0 ? "0€" : formatPrice(plan.priceMonthly)}
                </span>
                {plan.priceMonthly > 0 && <span className="text-muted-foreground text-sm">/ mois</span>}
              </div>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {plan.features.slice(0, 4).map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-primary">·</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild variant={plan.highlighted ? "default" : "outline"} className="w-full">
                <Link href="/signup">{plan.ctaLabel}</Link>
              </Button>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button asChild variant="ghost">
            <Link href="/pricing">
              Voir tout en détail
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="container-calm py-20 md:py-28">
        <div className="glass rounded-3xl p-10 md:p-16 text-center space-y-6">
          <h2 className="font-heading text-3xl md:text-5xl tracking-tight">Tu vas respirer.</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            C&apos;est tout. On commence par là. Le reste suit, naturellement.
          </p>
          <Button asChild size="lg" className="h-12 px-8">
            <Link href="/signup">
              Créer mon espace
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
      </main>

      {/* FOOTER */}
      <footer className="container-calm py-12 border-t border-border/40">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} PURAMA · 8 Rue de la Chapelle, 25560 Frasne</p>
          <div className="flex flex-wrap gap-6">
            <Link href="/manifesto" className="hover:text-foreground transition-colors">
              Manifesto
            </Link>
            <Link href="/pricing" className="hover:text-foreground transition-colors">
              Tarifs
            </Link>
            <Link href="/safety" className="hover:text-foreground transition-colors">
              Sécurité
            </Link>
            <Link href="/cgu" className="hover:text-foreground transition-colors">
              CGU
            </Link>
            <Link href="/confidentialite" className="hover:text-foreground transition-colors">
              Confidentialité
            </Link>
            <Link href="/mentions-legales" className="hover:text-foreground transition-colors">
              Mentions légales
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
