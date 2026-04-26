import { redirect } from "next/navigation"
import Link from "next/link"
import { Wind } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { SignOutButton } from "@/components/shared/sign-out-button"
import { SOSFloatingButton } from "@/components/safety/sos-floating-button"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  return (
    <div className="min-h-svh flex flex-col">
      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container-calm flex items-center justify-between h-14">
          <Link href="/today" className="flex items-center gap-2">
            <Wind className="size-5 text-primary" strokeWidth={1.6} />
            <span className="font-heading text-lg tracking-tight">PURAMA ONE</span>
          </Link>
          <SignOutButton />
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <SOSFloatingButton />
    </div>
  )
}
