import Link from "next/link"
import { Wind } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-4 py-10">
      <Link
        href="/"
        className="mb-10 flex items-center gap-2 text-foreground/80 hover:text-foreground transition-colors"
      >
        <Wind className="size-5 text-primary" strokeWidth={1.6} />
        <span className="font-heading text-xl tracking-tight">PURAMA ONE</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
      <p className="mt-10 text-center text-xs text-muted-foreground max-w-md">
        Cet espace prend soin de toi. Si tu traverses un moment difficile,{" "}
        <Link href="/sos" className="underline underline-offset-2 hover:text-foreground">
          appelle de l&apos;aide maintenant
        </Link>
        .
      </p>
    </div>
  )
}
