import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ExecuteWorkflow } from "@/components/execute/execute-workflow"
import type { Plan } from "@/lib/supabase/types"

export const metadata = {
  title: "Execute · Messages",
}

export default async function MessagesExecutePage() {
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
        type="message"
        label="Messages courts"
        description="SMS, WhatsApp, DM. 3 versions prêtes en 10 secondes."
        example="Annoncer à Pierre que je décale notre déjeuner de mardi à jeudi."
        plan={userPlan}
        showBack
      />
    </div>
  )
}
