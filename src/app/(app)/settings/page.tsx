import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProfileForm } from "@/components/settings/profile-form"

export const dynamic = "force-dynamic"

export default async function SettingsProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login?next=/settings")

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, locale, timezone, email, plan")
    .eq("id", user.id)
    .maybeSingle()

  return (
    <ProfileForm
      initial={{
        display_name: profile?.display_name ?? user.email?.split("@")[0] ?? "",
        locale: (profile?.locale ?? "fr") as "fr" | "en",
        timezone: profile?.timezone ?? "Europe/Paris",
        email: profile?.email ?? user.email ?? "",
        plan: profile?.plan ?? "free",
      }}
    />
  )
}
