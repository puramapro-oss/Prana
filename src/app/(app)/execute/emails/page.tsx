import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ExecuteWorkflow } from "@/components/execute/execute-workflow"
import type { Plan } from "@/lib/supabase/types"

export const metadata = {
  title: "Execute · Emails",
}

export default async function EmailsExecutePage() {
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
        type="email"
        label="Emails"
        description="Objet + corps. Adapté au lien que tu as avec ton interlocuteur."
        example="Relancer mon manager sur ma demande de congé envoyée la semaine dernière."
        plan={userPlan}
        showBack
      />
    </div>
  )
}
