import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PulseCheckSlider } from "@/components/pulse/pulse-check-slider"
import { OneActionCard } from "@/components/today/one-action-card"
import { StreakBadge } from "@/components/today/streak-badge"
import { TwinReminder } from "@/components/today/twin-reminder"
import { MagicButtonGrid } from "@/components/buttons/magic-button-grid"
import type { Plan, PulseCheck } from "@/lib/supabase/types"

export const metadata = {
  title: "Aujourd'hui",
  description: "Une seule action maintenant. Pas plus de trois aujourd'hui.",
}

export default async function TodayPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const profileResp = await supabase
    .from("profiles")
    .select("display_name, plan, trial_ends_at")
    .eq("id", user.id)
    .maybeSingle()
  const profile = profileResp.data ?? null

  const greeting = profile?.display_name ?? user.email?.split("@")[0] ?? "toi"
  const plan: Plan = (profile?.plan as Plan | undefined) ?? "free"
  const trialEnd = profile?.trial_ends_at
  const trialDaysLeft = trialEnd
    ? Math.max(0, Math.ceil((new Date(trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0
  const trialActive = !!trialEnd && trialDaysLeft > 0 && plan === "free"

  // Latest pulse — used to skip the slider if recent (< 30 minutes).
  const lastPulseResp = await supabase
    .from("pulse_checks")
    .select("id, stress, energy, time_available, context, created_at, mood_tags, notes")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  const lastPulse = lastPulseResp.data as PulseCheck | null
  const pulseFreshMinutes = lastPulse
    ? Math.floor((Date.now() - new Date(lastPulse.created_at).getTime()) / 60000)
    : Infinity
  const pulseFresh = pulseFreshMinutes < 30

  // Streak — read latest daily_score row. Empty in P2 (filled in P7), default 0.
  let streakDays = 0
  try {
    const scoreResp = await supabase
      .from("daily_scores")
      .select("streak_days")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle()
    const score = scoreResp.data as { streak_days: number } | null
    streakDays = score?.streak_days ?? 0
  } catch {
    streakDays = 0
  }

  return (
    <div className="container-calm py-6 sm:py-10 space-y-6 sm:space-y-8">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted-foreground">Bon retour.</p>
          <StreakBadge streakDays={streakDays} />
          {trialActive ? (
            <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] uppercase tracking-wider text-primary">
              Essai Pro · {trialDaysLeft}j
            </span>
          ) : null}
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl tracking-tight">
          Bonjour {greeting}.
        </h1>
        <p className="text-muted-foreground max-w-prose leading-relaxed">
          Tu es là. C&apos;est déjà beaucoup. On commence par un Pulse Check, puis une seule action.
        </p>
      </div>

      {pulseFresh ? null : (
        <PulseCheckSlider
          defaults={
            lastPulse
              ? {
                  stress: lastPulse.stress,
                  energy: lastPulse.energy,
                  time_available: lastPulse.time_available,
                  context: lastPulse.context,
                }
              : undefined
          }
        />
      )}

      <OneActionCard />

      <div className="space-y-3">
        <div className="flex items-end justify-between gap-3 px-1">
          <div>
            <h2 className="font-heading text-xl sm:text-2xl">Boutons magiques</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Tape sur celui qui te parle. {plan === "free" ? "3 par jour offerts." : "Illimité sur ton plan."}
            </p>
          </div>
        </div>
        <MagicButtonGrid plan={plan} />
      </div>

      <TwinReminder insight={null} />
    </div>
  )
}
