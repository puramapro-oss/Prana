import Link from "next/link"
import { ArrowLeft, ArrowRight, Wind } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Manifeste",
  description:
    "Pourquoi PURAMA ONE existe. Un seul système qui calme, organise, et exécute pour toi — sans surcharge cognitive ni gamification anxiogène.",
  alternates: { canonical: "/manifesto" },
  openGraph: {
    title: "Manifeste · PURAMA ONE",
    description: "Pourquoi PURAMA ONE existe. Et pour qui.",
    images: [
      {
        url: "/api/og?title=Manifeste&subtitle=Pourquoi PURAMA ONE existe",
        width: 1200,
        height: 630,
      },
    ],
  },
}

export default function ManifestoPage() {
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

      <article className="container-calm max-w-2xl py-16 md:py-24 space-y-8">
        <h1 className="font-heading text-4xl md:text-6xl tracking-tight">
          On est tous fatigués.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Surchargés mentalement. Dérégulés émotionnellement. Paralysés par le chaos. On accumule les apps :
          Calm pour méditer, Notion pour organiser, ChatGPT pour exécuter, un journal papier pour respirer.
          Aucune ne fait les quatre ensemble.
        </p>

        <h2 className="font-heading text-2xl md:text-3xl tracking-tight pt-8">
          PURAMA ONE est différent.
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          On t&apos;apprend pas à méditer 30 minutes. On te calme en 20 secondes. On te liste pas tes
          tâches : on te donne <strong className="text-foreground">une seule action maintenant</strong>. On
          fait pas semblant de t&apos;écouter : on a un Twin qui te connaît, qui sait quand tu es efficace,
          ce qui te recharge, ce qui te stresse.
        </p>

        <h2 className="font-heading text-2xl md:text-3xl tracking-tight pt-8">Nos règles.</h2>
        <ul className="space-y-3 text-muted-foreground leading-relaxed">
          <li>
            <strong className="text-foreground">Une seule action maintenant.</strong> Jamais plus de trois par
            jour. Tu n&apos;es pas une machine.
          </li>
          <li>
            <strong className="text-foreground">Calmer avant d&apos;organiser.</strong> Si tu es à 8/10 de
            stress, on respire. Pas de to-do list.
          </li>
          <li>
            <strong className="text-foreground">Aucun jugement.</strong> Tu reprends quand tu veux. Le streak
            n&apos;est pas une punition.
          </li>
          <li>
            <strong className="text-foreground">Aucun claim médical.</strong> On n&apos;est pas un soignant.
            On est un outil de bien-être. Si c&apos;est dur, on t&apos;oriente vers un pro.
          </li>
          <li>
            <strong className="text-foreground">Le silence par défaut.</strong> Pas de &quot;ding&quot;. Pas
            de notifications agressives. Pas de gamification creuse.
          </li>
        </ul>

        <div className="pt-8">
          <Button asChild size="lg">
            <Link href="/signup">
              Commencer à respirer
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </article>
    </div>
  )
}
