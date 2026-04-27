import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { NotificationsForm } from "@/components/settings/notifications-form"
import type { ProfileMetadata } from "@/lib/supabase/types"

export const dynamic = "force-dynamic"

export default async function SettingsNotificationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login?next=/settings/notifications")

  const { data: profile } = await supabase
    .from("profiles")
    .select("metadata")
    .eq("id", user.id)
    .maybeSingle()

  const meta = (profile?.metadata as ProfileMetadata | null) ?? {}
  const prefs = meta.notif_prefs ?? {}

  return (
    <NotificationsForm
      initial={{
        push_enabled: prefs.push_enabled ?? true,
        email_enabled: prefs.email_enabled ?? true,
        sms_enabled: prefs.sms_enabled ?? false,
        daily_reminder_hour: prefs.daily_reminder_hour ?? 9,
      }}
    />
  )
}
