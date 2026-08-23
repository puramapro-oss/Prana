import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DataActions } from "@/components/settings/data-actions"
import { LegalAcceptancesList } from "@/components/settings/legal-acceptances-list"

export const dynamic = "force-dynamic"

export default async function SettingsDataPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login?next=/settings/data")

  const { data: acceptances } = await supabase
    .from("legal_acceptances")
    .select("doc_type, version, accepted_at")
    .eq("user_id", user.id)
    .order("accepted_at", { ascending: false })

  return (
    <div className="space-y-4">
      <DataActions />
      <LegalAcceptancesList acceptances={acceptances ?? []} />
    </div>
  )
}
