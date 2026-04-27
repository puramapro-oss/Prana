import { NextResponse, type NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { askClaudeJSON } from "@/lib/agent/anthropic"
import {
  ROOM_HOST_SYSTEM,
  buildRoomHostUserMessage,
  ROOM_HOST_FALLBACK,
  type RoomHostInput,
  type RoomHostOutput,
} from "@/lib/agent/prompts/room-host"
import { loadTwin, toTwinSnapshot } from "@/lib/agent/twin-loader"
import type {
  Profile,
  Room,
  RoomMembership,
  RoomDayAction,
} from "@/lib/supabase/types"

export const runtime = "nodejs"
export const maxDuration = 300

const TIMEOUT_MS = 15_000
const MAX_MEMBERSHIPS_PER_RUN = 1000

/**
 * CRON room-tick — runs 07:00 UTC (vercel.json schedule).
 *
 * For every active membership where the AI host hasn't posted yet for the
 * member's `current_day` today, the host generates a personalized message
 * using `loadTwin(member)` and inserts it as `is_ai_host=true`.
 *
 * Tolerant per-membership : exceptions logged, loop continues.
 *
 * Auth : Bearer CRON_SECRET (Vercel cron sets it automatically).
 */
export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET
  if (expected) {
    const auth = req.headers.get("authorization") ?? ""
    if (auth !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  } else if (!req.headers.get("x-vercel-cron")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const startedAt = Date.now()
  const admin = createAdminClient()

  // Active memberships
  const memResp = await admin
    .from("room_memberships")
    .select("id, room_id, user_id, current_day, completed, joined_at")
    .eq("completed", false)
    .order("joined_at", { ascending: true })
    .limit(MAX_MEMBERSHIPS_PER_RUN)

  const memberships = (memResp.data ?? []) as Pick<
    RoomMembership,
    "id" | "room_id" | "user_id" | "current_day" | "completed"
  >[]

  if (memberships.length === 0) {
    return NextResponse.json({
      ok: true,
      eligible: 0,
      processed: 0,
      duration_ms: Date.now() - startedAt,
    })
  }

  // Pre-fetch all rooms and profiles touched (batch)
  const roomIds = Array.from(new Set(memberships.map((m) => m.room_id)))
  const userIds = Array.from(new Set(memberships.map((m) => m.user_id)))

  const [roomsResp, profilesResp] = await Promise.all([
    admin
      .from("rooms")
      .select("id, name_fr, duration_days, daily_action_template")
      .in("id", roomIds),
    admin.from("profiles").select("id, display_name, plan, locale").in("id", userIds),
  ])

  const roomMap = new Map<string, Pick<Room, "id" | "name_fr" | "duration_days" | "daily_action_template">>()
  for (const r of (roomsResp.data ?? []) as Pick<
    Room,
    "id" | "name_fr" | "duration_days" | "daily_action_template"
  >[]) {
    roomMap.set(r.id, r)
  }
  const profileMap = new Map<string, Pick<Profile, "id" | "display_name" | "plan" | "locale">>()
  for (const p of (profilesResp.data ?? []) as Pick<
    Profile,
    "id" | "display_name" | "plan" | "locale"
  >[]) {
    profileMap.set(p.id, p)
  }

  // Today UTC bounds
  const startOfDayUtc = new Date()
  startOfDayUtc.setUTCHours(0, 0, 0, 0)

  let processed = 0
  let skipped = 0
  let failed = 0
  let fallback = 0

  for (const membership of memberships) {
    try {
      const room = roomMap.get(membership.room_id)
      const profile = profileMap.get(membership.user_id)
      if (!room || !profile) {
        skipped++
        continue
      }

      const template = (room.daily_action_template as RoomDayAction[] | null) ?? []
      const todayAction = template.find((d) => d.day === membership.current_day)
      if (!todayAction) {
        skipped++
        continue
      }

      // Did the AI already post for this day today ?
      const existingResp = await admin
        .from("room_messages")
        .select("id", { count: "exact", head: true })
        .eq("room_id", room.id)
        .eq("user_id", membership.user_id)
        .eq("is_ai_host", true)
        .eq("day_number", membership.current_day)
        .gte("created_at", startOfDayUtc.toISOString())
        .limit(1)
      if ((existingResp.count ?? 0) > 0) {
        skipped++
        continue
      }

      // Personalize via Twin
      const fullTwin = await loadTwin(membership.user_id)
      const input: RoomHostInput = {
        roomName: room.name_fr,
        todayAction,
        durationDays: room.duration_days,
        displayName: profile.display_name,
        twin: toTwinSnapshot(fullTwin),
      }

      let output: RoomHostOutput
      let usedFallback = false
      try {
        const aiCall = askClaudeJSON<RoomHostOutput>(buildRoomHostUserMessage(input), {
          system: ROOM_HOST_SYSTEM,
          tier: "default",
          maxTokens: 384,
          temperature: 0.5,
        })
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("room_host_timeout")), TIMEOUT_MS),
        )
        output = await Promise.race([aiCall, timeout])
        if (!output?.body || typeof output.body !== "string") {
          throw new Error("invalid_output")
        }
      } catch (err) {
        console.error("[cron room-tick] ai", membership.user_id, err)
        output = ROOM_HOST_FALLBACK(input)
        usedFallback = true
      }

      // Insert AI host message
      const insertResp = await admin.from("room_messages").insert({
        room_id: room.id,
        user_id: null,
        is_ai_host: true,
        body: output.body.slice(0, 1500),
        day_number: membership.current_day,
      })
      if (insertResp.error) {
        console.error("[cron room-tick] insert", membership.user_id, insertResp.error)
        failed++
        continue
      }
      processed++
      if (usedFallback) fallback++
    } catch (err) {
      console.error("[cron room-tick] loop fail", membership.user_id, err)
      failed++
    }
  }

  return NextResponse.json({
    ok: true,
    eligible: memberships.length,
    processed,
    skipped_no_action: skipped,
    failed,
    fallback,
    duration_ms: Date.now() - startedAt,
  })
}
