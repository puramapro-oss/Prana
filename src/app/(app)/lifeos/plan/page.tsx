import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Plan7DaysView } from "@/components/lifeos/plan-7days"
import type { Plan } from "@/lib/supabase/types"

export const metadata = {
  title: "LifeOS · Plan 7 jours",
  description: "Ta semaine calibrée par l'IA selon ton énergie réelle.",
}

export default async function PlanPage() {
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
    <div className="container-calm py-6 sm:py-8 space-y-5">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl tracking-tight">Plan 7 jours</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-prose">
          Une intention par jour. Une action prioritaire. Calibré sur ton énergie réelle.
        </p>
      </div>
      <Plan7DaysView plan={userPlan} />
    </div>
  )
}
