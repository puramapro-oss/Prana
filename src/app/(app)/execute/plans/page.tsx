import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ExecuteWorkflow } from "@/components/execute/execute-workflow"
import type { Plan } from "@/lib/supabase/types"

export const metadata = {
  title: "Execute · Plans d'action",
}

export default async function PlansExecutePage() {
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
      <ExecuteWorkflow
        type="plan"
        label="Plans d'action"
        description="Une liste d'étapes claires, courtes, faisables. Pas de jargon corporate."
        example="Plan pour préparer mon entretien de jeudi avec un client important."
        plan={userPlan}
        showBack
      />
    </div>
  )
}
