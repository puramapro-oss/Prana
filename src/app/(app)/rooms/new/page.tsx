import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { RoomCreateForm } from "@/components/rooms/room-create-form"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Plan } from "@/lib/supabase/types"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Nouvelle room · PURAMA ONE",
}

export default async function RoomNewPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login?next=/rooms/new")

  const profileResp = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle()
  const userPlan: Plan = (profileResp.data?.plan as Plan | undefined) ?? "free"
  const canCreate = userPlan === "pro" || userPlan === "ultime"

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
      <Link
        href="/rooms"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Toutes les rooms
      </Link>

      {canCreate ? (
        <RoomCreateForm />
      ) : (
        <Card className="glass border-amber-300/40">
          <CardContent className="py-6 space-y-3">
            <h2 className="text-base font-medium">La création de rooms est réservée aux plans Pro et Ultime.</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Crée des programmes pour ta communauté, ton équipe ou tes amis. Tu fixes les actions, l&apos;IA accompagne.
            </p>
            <Button asChild>
              <Link href="/pricing">Voir les plans</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
