import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { apiLimiter } from "@/lib/upstash"
import { computeDailyScore, getRangeScores, todayUtcISODate } from "@/lib/score/compute"
import { getUserPoints } from "@/lib/redistribution/points"
import { createAdminClient } from "@/lib/supabase/admin"
import type { DailyScore } from "@/lib/supabase/types"

const QuerySchema = z.object({
  range: z.coerce.number().int().min(1).max(180).optional(),
})

/**
 * GET /api/score/daily         → today's score (computed on-demand) + 30d range + points balance
 * GET /api/score/daily?range=N → custom range (1..180 days)
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Connecte-toi pour voir ton score." }, { status: 401 })
    }

    const limited = await apiLimiter.limit(`score:${user.id}`)
    if (!limited.success) {
      return NextResponse.json({ error: "Trop de requêtes. Patiente." }, { status: 429 })
    }

    const url = new URL(req.url)
    const parsed = QuerySchema.safeParse({ range: url.searchParams.get("range") ?? undefined })
    if (!parsed.success) {
      return NextResponse.json({ error: "Paramètre range invalide." }, { status: 400 })
    }
    const range = parsed.data.range ?? 30

    const today = await computeDailyScore({ userId: user.id })
    const series = await getRangeScores(user.id, range)
    const points = await getUserPoints(user.id)

    // 5 badges — derived from series. Each badge is on/off + earnedAt (last-day-met).
    const badges = computeBadges(series)

    return NextResponse.json({
      ok: true,
      today: today ?? null,
      series,
      points,
      badges,
      generated_at: new Date().toISOString(),
      range_days: range,
    })
  } catch (e) {
    console.error("[api/score/daily]", e)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}

/**
 * POST /api/score/daily — force recompute today.
 * Used after a feature that changes score (e.g. protocol just completed).
 */
export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Connecte-toi." }, { status: 401 })
    }

    const limited = await apiLimiter.limit(`score-recompute:${user.id}`)
    if (!limited.success) {
      return NextResponse.json({ error: "Trop de requêtes." }, { status: 429 })
    }

    const today = await computeDailyScore({ userId: user.id })
    return NextResponse.json({ ok: true, today, recomputed_at: new Date().toISOString() })
  } catch (e) {
    console.error("[api/score/daily POST]", e)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}

/**
 * PATCH /api/score/daily — user reports `sleep_quality` (0..10) for today.
 * Optional, never inferred — we only store what the user explicitly tells us.
 */
const PatchSchema = z.object({
  sleep_quality: z.number().int().min(0).max(10),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Connecte-toi." }, { status: 401 })
    }
    const body = await req.json().catch(() => null)
    const parsed = PatchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
    }
    const date = parsed.data.date ?? todayUtcISODate()

    // Ensure a row exists, then update sleep_quality.
    await computeDailyScore({ userId: user.id, date })
    const admin = createAdminClient()
    const { error } = await admin
      .from("daily_scores")
      .update({ sleep_quality: parsed.data.sleep_quality })
      .eq("user_id", user.id)
      .eq("date", date)
    if (error) {
      console.error("[api/score/daily] PATCH update", error)
      return NextResponse.json({ error: "Impossible d'enregistrer." }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[api/score/daily PATCH]", e)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}

export interface BadgeStatus {
  slug: "calm_7d" | "sleep_7d" | "focus_7d" | "streak_7d" | "streak_30d"
  earned: boolean
  progress: number
  label: string
  description: string
}

function computeBadges(series: DailyScore[]): BadgeStatus[] {
  const last7 = series.slice(-7)
  const last30 = series.slice(-30)

  const calmDays = last7.filter((d) => d.stress_avg !== null && d.stress_avg <= 4).length
  const sleepDays = last7.filter((d) => d.sleep_quality !== null && d.sleep_quality >= 6).length
  const focusDays = last7.filter((d) => d.protocols_done >= 1 || d.focus_minutes >= 10).length

  const lastStreak = series[series.length - 1]?.streak_days ?? 0
  const streak7 = lastStreak >= 7
  const streak30 = lastStreak >= 30

  return [
    {
      slug: "calm_7d",
      earned: calmDays >= 5,
      progress: Math.min(calmDays / 5, 1),
      label: "Calme 7 jours",
      description: "5 journées sur 7 avec un stress moyen ≤ 4/10.",
    },
    {
      slug: "sleep_7d",
      earned: sleepDays >= 5,
      progress: Math.min(sleepDays / 5, 1),
      label: "Sommeil 7 jours",
      description: "5 nuits sur 7 avec une qualité ≥ 6/10.",
    },
    {
      slug: "focus_7d",
      earned: focusDays >= 5,
      progress: Math.min(focusDays / 5, 1),
      label: "Focus 7 jours",
      description: "5 jours sur 7 avec au moins 1 protocole ou 10 min de focus.",
    },
    {
      slug: "streak_7d",
      earned: streak7,
      progress: Math.min(lastStreak / 7, 1),
      label: "Série 7 jours",
      description: "7 jours consécutifs d'activité.",
    },
    {
      slug: "streak_30d",
      earned: streak30,
      progress: Math.min(lastStreak / 30, 1),
      label: "Série 30 jours",
      description: "30 jours consécutifs d'activité. Tu reprends quand tu veux — la série n'est jamais punitive.",
    },
  ]
  // last30 reserved for future "monthly retrospective" badges (P8+)
  void last30
}
