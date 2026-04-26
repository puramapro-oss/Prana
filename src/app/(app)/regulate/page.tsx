import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProtocolList } from "@/components/regulate/protocol-list"
import type { Plan } from "@/lib/supabase/types"

export const metadata = {
  title: "Régulation",
  description: "12 protocoles guidés pour redescendre, ralentir, ou s'ancrer.",
}

export default async function RegulatePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const profileResp = await supabase.from("profiles").select("plan").eq("id", user.id).maybeSingle()
  const plan = ((profileResp.data?.plan as Plan | undefined) ?? "free") as Plan

  return (
    <div className="container-calm py-6 sm:py-10 space-y-6">
      <div className="space-y-2 max-w-2xl">
        <h1 className="font-heading text-3xl sm:text-4xl tracking-tight">Régulation</h1>
        <p className="text-muted-foreground leading-relaxed">
          Douze protocoles courts pour redescendre, ralentir, t&apos;ancrer. Chacun mesure
          l&apos;effet : un Pulse Check avant, un après.
        </p>
      </div>
      <ProtocolList plan={plan} />
    </div>
  )
}
