import Link from "next/link"
import { WifiOff, RefreshCw } from "lucide-react"

export const dynamic = "force-static"

export const metadata = {
  title: "Hors ligne",
  description: "Tu es hors ligne. Reviens dès que la connexion revient.",
}

export default function OfflinePage() {
  return (
    <div className="min-h-svh flex items-center justify-center px-6">
      <div className="max-w-md w-full glass rounded-3xl p-10 text-center space-y-6">
        <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <WifiOff className="size-6 text-primary" strokeWidth={1.6} />
        </div>
        <h1 className="font-heading text-2xl tracking-tight">Tu es hors ligne</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Pas de connexion pour le moment. Respire. Tes captures et notes seront synchronisées dès le retour
          du réseau.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- offline retry must be a hard reload, not SPA */}
          <a
            href="/"
            className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90 transition"
          >
            <RefreshCw className="size-4" strokeWidth={1.6} />
            Réessayer
          </a>
          <Link
            href="/sos"
            className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-md border border-border text-sm font-medium hover:bg-muted/40 transition"
          >
            Aide d&apos;urgence
          </Link>
        </div>
      </div>
    </div>
  )
}
