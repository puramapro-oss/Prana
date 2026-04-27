import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { ReferralCard } from "@/components/settings/referral-card"

export const dynamic = "force-dynamic"

export default async function SettingsReferralPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login?next=/settings/referral")

  const admin = createAdminClient()
  const profileResp = await admin
    .from("profiles")
    .select("referral_code")
    .eq("id", user.id)
    .maybeSingle()
  const referralCode = (profileResp.data?.referral_code as string | null) ?? null

  const refsResp = await admin
    .from("referrals")
    .select("id, status, reward_points, created_at")
    .eq("referrer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  type Row = {
    id: string
    status: "pending" | "converted" | "rewarded"
    reward_points: number | null
    created_at: string
  }
  const refs = (refsResp.data ?? []) as Row[]

  const totalPending = refs.filter((r) => r.status === "pending").length
  const totalConverted = refs.filter(
    (r) => r.status === "converted" || r.status === "rewarded",
  ).length
  const pointsEarned = refs
    .filter((r) => r.status === "converted" || r.status === "rewarded")
    .reduce((acc, r) => acc + (r.reward_points ?? 500), 0)

  const baseHost = process.env.NEXT_PUBLIC_APP_URL ?? "https://prana.purama.dev"
  const referralUrl = referralCode ? `${baseHost}/ref/${referralCode}` : null

  return (
    <ReferralCard
      initial={{
        referralCode,
        referralUrl,
        totalPending,
        totalConverted,
        pointsEarned,
        recent: refs.slice(0, 10).map((r) => ({
          id: r.id,
          status: r.status,
          created_at: r.created_at,
        })),
      }}
    />
  )
}
