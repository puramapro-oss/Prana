import Link from "next/link"
import { ArrowLeft, Wind } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LegalLayout({ children }: { children: React.ReactNode }) {
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
      <article className="container-calm max-w-2xl py-16 md:py-20 prose prose-neutral dark:prose-invert prose-headings:font-heading prose-headings:tracking-tight">
        {children}
      </article>
    </div>
  )
}
