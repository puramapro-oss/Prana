import Link from "next/link"
import { ArrowLeft, Heart, Phone, ShieldCheck, Wind } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HOTLINES } from "@/lib/safety/hotlines"

export const metadata = {
  title: "Sécurité & soin",
  description:
    "PURAMA ONE n'est pas un soignant. Si c'est dur, on t'oriente vers un pro. Numéros d'urgence FR/EN/INT, ressources, et règles claires.",
  alternates: { canonical: "/safety" },
  openGraph: {
    title: "Sécurité & soin · PURAMA ONE",
    description: "On n'est pas un soignant. Si c'est dur, on t'oriente vers un pro.",
    images: [
      {
        url: "/api/og?title=Sécurité %26 soin&subtitle=Si c%27est dur, on t%27oriente vers un pro",
        width: 1200,
        height: 630,
      },
    ],
  },
}

export default function SafetyPage() {
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

      <article className="container-calm max-w-2xl py-16 md:py-20 space-y-10">
        <header className="space-y-4">
          <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="size-6 text-primary" strokeWidth={1.4} />
          </div>
          <h1 className="font-heading text-4xl md:text-5xl tracking-tight">
            Tu es en sécurité ici.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            PURAMA ONE est un outil de bien-être. Pas un soignant. On ne diagnostique rien. On ne soigne rien.
            Mais on prend soin de toi, à notre niveau, avec honnêteté.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="font-heading text-2xl tracking-tight">Si c&apos;est dur, là, maintenant.</h2>
          <p className="text-muted-foreground leading-relaxed">
            Appelle quelqu&apos;un. Ces lignes sont gratuites, anonymes, ouvertes 24h/24, et formées pour t&apos;écouter
            sans jugement.
          </p>
          <div className="grid gap-3">
            {HOTLINES.map((h) => (
              <div key={h.countryCode} className="glass rounded-2xl p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {h.name} <span className="text-xs text-muted-foreground">· {h.country}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{h.description}</p>
                </div>
                {h.number ? (
                  <Button asChild size="sm">
                    <a href={`tel:${h.number}`}>
                      <Phone className="size-3.5" />
                      {h.number}
                    </a>
                  </Button>
                ) : h.url ? (
                  <Button asChild size="sm" variant="outline">
                    <a href={h.url} target="_blank" rel="noopener noreferrer">
                      Trouver
                    </a>
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-2xl tracking-tight">Notre engagement.</h2>
          <ul className="space-y-3 text-muted-foreground leading-relaxed">
            <li className="flex gap-3">
              <Heart className="size-4 text-primary shrink-0 mt-1" strokeWidth={1.8} />
              <span>
                <strong className="text-foreground">Aucun claim médical.</strong> On n&apos;utilise jamais les
                mots &quot;dépression&quot;, &quot;anxiété généralisée&quot;, &quot;trouble&quot;,
                &quot;maladie&quot; pour parler de toi.
              </span>
            </li>
            <li className="flex gap-3">
              <Heart className="size-4 text-primary shrink-0 mt-1" strokeWidth={1.8} />
              <span>
                <strong className="text-foreground">Détection douce.</strong> Si tu écris quelque chose de
                lourd, on te propose tranquillement de parler à quelqu&apos;un. On ne te bloque pas. On ne te
                fait pas honte.
              </span>
            </li>
            <li className="flex gap-3">
              <Heart className="size-4 text-primary shrink-0 mt-1" strokeWidth={1.8} />
              <span>
                <strong className="text-foreground">Aucune donnée sensible vendue.</strong> Tes Pulse Checks,
                tes notes, ton Twin sont à toi. Tu peux tout exporter ou supprimer en un clic.
              </span>
            </li>
            <li className="flex gap-3">
              <Heart className="size-4 text-primary shrink-0 mt-1" strokeWidth={1.8} />
              <span>
                <strong className="text-foreground">Bouton SOS toujours visible.</strong> Sur chaque écran de
                l&apos;app. Discret, mais présent.
              </span>
            </li>
          </ul>
        </section>
      </article>
    </div>
  )
}
