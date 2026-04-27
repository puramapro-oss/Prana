import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { apiLimiter } from "@/lib/upstash"

export const runtime = "nodejs"
export const maxDuration = 60

/**
 * GET /api/settings/data/export — RGPD export.
 * Returns a JSON download with every row owned by the user across all PRANA tables.
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

    const limited = await apiLimiter.limit(`export:${user.id}`)
    if (!limited.success) {
      return NextResponse.json(
        { error: "Trop d'exports rapprochés. Réessaie dans une minute." },
        { status: 429 },
      )
    }

    const admin = createAdminClient()
    const userId = user.id

    const [profile, pulses, captures, projects, people, tasks, notes, executions, twin, sessions, dailyScores, points, pointEvents, safetyEvents] =
      await Promise.all([
        admin.from("profiles").select("*").eq("id", userId).maybeSingle(),
        admin.from("pulse_checks").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        admin.from("captures").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        admin.from("projects").select("*").eq("user_id", userId),
        admin.from("people").select("*").eq("user_id", userId),
        admin.from("tasks").select("*").eq("user_id", userId),
        admin.from("notes").select("*").eq("user_id", userId),
        admin.from("executions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        admin.from("twin_profiles").select("*").eq("user_id", userId).maybeSingle(),
        admin.from("regulation_sessions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        admin.from("daily_scores").select("*").eq("user_id", userId).order("date", { ascending: false }),
        admin.from("user_points").select("*").eq("user_id", userId).maybeSingle(),
        admin.from("point_events").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        admin.from("safety_events").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      ])

    const payload = {
      exported_at: new Date().toISOString(),
      app: "PRANA · PURAMA ONE",
      user_id: userId,
      data: {
        profile: profile.data ?? null,
        pulse_checks: pulses.data ?? [],
        captures: captures.data ?? [],
        projects: projects.data ?? [],
        people: people.data ?? [],
        tasks: tasks.data ?? [],
        notes: notes.data ?? [],
        executions: executions.data ?? [],
        twin_profile: twin.data ?? null,
        regulation_sessions: sessions.data ?? [],
        daily_scores: dailyScores.data ?? [],
        user_points: points.data ?? null,
        point_events: pointEvents.data ?? [],
        safety_events: safetyEvents.data ?? [],
      },
    }

    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "content-disposition": `attachment; filename="prana-export-${userId}.json"`,
      },
    })
  } catch (e) {
    console.error("[api/settings/data/export]", e)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
