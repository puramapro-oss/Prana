import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

interface ReferralStats {
  ok: true
  referral_code: string | null
  referral_url: string | null
  total_pending: number
  total_converted: number
  points_earned: number
  /** Most recent 10 referrals (referee_id only — we never expose referee email/name). */
  recent: { id: string; status: "pending" | "converted" | "rewarded"; created_at: string }[]
}

/**
 * GET /api/referral/stats — current user's referral overview.
 * Returns code + share URL + counts + recent referrals.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Connecte-toi." }, { status: 401 })
    }

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

    type Row = { id: string; status: "pending" | "converted" | "rewarded"; reward_points: number | null; created_at: string }
    const refs = (refsResp.data ?? []) as Row[]

    const totalPending = refs.filter((r) => r.status === "pending").length
    const totalConverted = refs.filter(
      (r) => r.status === "converted" || r.status === "rewarded",
    ).length
    const pointsEarned = refs
      .filter((r) => r.status === "converted" || r.status === "rewarded")
      .reduce((acc, r) => acc + (r.reward_points ?? 500), 0)

    const baseHost = process.env.NEXT_PUBLIC_APP_URL ?? "https://prana.purama.dev"
    const shareUrl = referralCode ? `${baseHost}/ref/${referralCode}` : null

    const payload: ReferralStats = {
      ok: true,
      referral_code: referralCode,
      referral_url: shareUrl,
      total_pending: totalPending,
      total_converted: totalConverted,
      points_earned: pointsEarned,
      recent: refs.slice(0, 10).map((r) => ({
        id: r.id,
        status: r.status,
        created_at: r.created_at,
      })),
    }

    return NextResponse.json(payload)
  } catch (e) {
    console.error("[api/referral/stats]", e)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
