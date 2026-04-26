import Link from "next/link"
import { Phone, ExternalLink, ArrowLeft, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { HOTLINES } from "@/lib/safety/hotlines"

export const metadata = {
  title: "Tu n'es pas seul·e",
  description: "Si c'est dur en ce moment. Hotlines, écoute, ressources.",
  robots: { index: false, follow: false },
}

export default function SOSPage() {
  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-4 py-10 bg-background">
      <div className="w-full max-w-xl space-y-6">
        <div className="text-center space-y-3">
          <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Heart className="size-6 text-primary" strokeWidth={1.4} />
          </div>
          <h1 className="font-heading text-3xl tracking-tight">Tu n&apos;es pas seul·e.</h1>
          <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
            Respire. Tu as fait le bon geste en venant ici. Quelqu&apos;un peut t&apos;écouter maintenant.
          </p>
        </div>

        <div className="grid gap-3">
          {HOTLINES.map((h) => (
            <Card key={h.countryCode} className="glass">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-xl">{h.name}</CardTitle>
                    <CardDescription className="mt-1">{h.country}</CardDescription>
                  </div>
                  {h.free && (
                    <span className="text-xs uppercase tracking-wider text-primary font-medium">
                      Gratuit • {h.hours}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">{h.description}</p>
                {h.number && (
                  <Button asChild size="lg" className="w-full">
                    <a href={`tel:${h.number}`}>
                      <Phone className="size-4" />
                      Appeler le {h.number}
                    </a>
                  </Button>
                )}
                {h.url && (
                  <Button asChild size="lg" variant="outline" className="w-full">
                    <a href={h.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-4" />
                      Trouver une ligne d&apos;écoute
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="glass border-primary/30">
          <CardContent className="pt-6 space-y-3">
            <h2 className="font-heading text-lg">90 secondes, on respire ensemble</h2>
            <ol className="text-sm text-muted-foreground space-y-2 leading-relaxed list-decimal list-inside">
              <li>Pose tes pieds bien à plat. Sens le sol.</li>
              <li>Inspire 4 secondes par le nez.</li>
              <li>Expire 6 secondes par la bouche, lentement.</li>
              <li>Recommence 6 fois. Sans te juger. Sans te presser.</li>
            </ol>
          </CardContent>
        </Card>

        <div className="text-center pt-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <ArrowLeft className="size-4" />
              Revenir tranquillement
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
