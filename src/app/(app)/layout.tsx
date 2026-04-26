import { redirect } from "next/navigation"
import Link from "next/link"
import { Wind } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { SOSFloatingButton } from "@/components/safety/sos-floating-button"
import { Sidebar } from "@/components/layout/sidebar"
import { BottomTabs } from "@/components/layout/bottom-tabs"
import { PulseCheckCompact } from "@/components/pulse/pulse-check-compact"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, plan")
    .eq("id", user.id)
    .maybeSingle()

  const displayName = profile?.display_name ?? user.email?.split("@")[0] ?? "toi"
  const plan = profile?.plan ?? "free"

  return (
    <div className="min-h-svh">
      <Sidebar displayName={displayName} plan={plan} />

      {/* Top bar mobile only */}
      <header className="md:hidden sticky top-0 z-30 border-b border-border/40 bg-background/85 backdrop-blur-xl">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/today" className="flex items-center gap-2">
            <Wind className="size-5 text-primary" strokeWidth={1.6} />
            <span className="font-heading text-lg tracking-tight">PURAMA ONE</span>
          </Link>
          <PulseCheckCompact />
        </div>
      </header>

      <main className="md:pl-64 pb-24 md:pb-10">
        <div className="hidden md:flex sticky top-0 z-20 border-b border-border/40 bg-background/85 backdrop-blur-xl">
          <div className="container-calm flex items-center justify-end h-14 gap-3">
            <PulseCheckCompact />
          </div>
        </div>
        {children}
      </main>

      <BottomTabs />
      <SOSFloatingButton />
    </div>
  )
}
