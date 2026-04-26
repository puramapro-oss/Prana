import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TwinOverview } from "@/components/twin/twin-overview"
import type { Plan } from "@/lib/supabase/types"

export const metadata = {
  title: "Twin · Jumeau IA",
  description: "Le profil que PRANA apprend de toi pour personnaliser chaque réponse.",
}

export default async function TwinPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const profileResp = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle()
  const userPlan: Plan = ((profileResp.data?.plan as Plan | undefined) ?? "free")

  return (
    <div className="container-calm py-6 sm:py-8">
      <TwinOverview plan={userPlan} />
    </div>
  )
}
