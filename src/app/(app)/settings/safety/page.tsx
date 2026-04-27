import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SafetyForm } from "@/components/settings/safety-form"
import type { ProfileMetadata } from "@/lib/supabase/types"

export const dynamic = "force-dynamic"

export default async function SettingsSafetyPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login?next=/settings/safety")

  const { data: profile } = await supabase
    .from("profiles")
    .select("metadata, locale")
    .eq("id", user.id)
    .maybeSingle()

  const meta = (profile?.metadata as ProfileMetadata | null) ?? {}
  const defaultCountry =
    meta.safety_country ??
    (profile?.locale === "en" ? "US" : profile?.locale === "fr" ? "FR" : "INTL")

  return (
    <SafetyForm
      initial={{
        safety_country: defaultCountry,
        emergency_contact: meta.emergency_contact ?? null,
      }}
    />
  )
}
