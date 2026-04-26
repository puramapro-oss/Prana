import Link from "next/link"
import { ArrowLeft, Wind } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-4 text-center">
      <Wind className="size-10 text-primary mb-6" strokeWidth={1.4} />
      <h1 className="font-heading text-5xl tracking-tight mb-3">Cette page n&apos;existe pas.</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        Tu peux respirer un coup, et revenir tranquillement à l&apos;accueil.
      </p>
      <Button asChild size="lg">
        <Link href="/">
          <ArrowLeft className="size-4" />
          Retour à l&apos;accueil
        </Link>
      </Button>
    </div>
  )
}
