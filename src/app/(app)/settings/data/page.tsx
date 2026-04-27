import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DataActions } from "@/components/settings/data-actions"

export const dynamic = "force-dynamic"

export default async function SettingsDataPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login?next=/settings/data")
  return <DataActions />
}
