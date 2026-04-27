import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Users, Clock, Crown } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RoomJoinButton } from "@/components/rooms/room-join-button"
import { RoomDayActionCard, RoomLockedCard } from "@/components/rooms/room-day-action"
import { RoomMessages } from "@/components/rooms/room-messages"
import type { Plan, Room, RoomMembership, RoomDayAction } from "@/lib/supabase/types"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const admin = createAdminClient()
  const r = await admin
    .from("rooms")
    .select("name_fr, description_fr")
    .eq("slug", slug)
    .maybeSingle()
  return {
    title: r.data?.name_fr ? `${r.data.name_fr} · PURAMA ONE` : "Room · PURAMA ONE",
    description: r.data?.description_fr ?? "Une room PURAMA.",
  }
}

export default async function RoomDetailPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/rooms/${slug}`)

  const profileResp = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle()
  const userPlan: Plan = (profileResp.data?.plan as Plan | undefined) ?? "free"

  const roomResp = await supabase
    .from("rooms")
    .select(
      "id, slug, name_fr, description_fr, duration_days, category, is_official, is_premium, participants_count, daily_action_template",
    )
    .eq("slug", slug)
    .maybeSingle()
  const room = roomResp.data as Pick<
    Room,
    | "id"
    | "slug"
    | "name_fr"
    | "description_fr"
    | "duration_days"
    | "category"
    | "is_official"
    | "is_premium"
    | "participants_count"
    | "daily_action_template"
  > | null
  if (!room) notFound()

  // Check membership (we may have joined this premium room before plan changed)
  const membershipResp = await supabase
    .from("room_memberships")
    .select("id, current_day, completed, joined_at")
    .eq("user_id", user.id)
    .eq("room_id", room.id)
    .maybeSingle()
  const membership = membershipResp.data as Pick<
    RoomMembership,
    "id" | "current_day" | "completed" | "joined_at"
  > | null
  const isMember = !!membership

  const PLAN_TIER: Record<Plan, number> = { free: 0, starter: 1, pro: 2, ultime: 3 }
  const isLockedPremium = room.is_premium && PLAN_TIER[userPlan] < PLAN_TIER.pro && !isMember

  // Today's action
  const template = (room.daily_action_template as RoomDayAction[] | null) ?? []
  const todayAction =
    isMember && membership && !membership.completed
      ? (template.find((d) => d.day === membership.current_day) ?? null)
      : null

  // Already ticked today : look at point_events for room_day with metadata.slug=slug today UTC
  let alreadyTickedToday = false
  if (membership && !membership.completed) {
    const startOfDay = new Date()
    startOfDay.setUTCHours(0, 0, 0, 0)
    const admin = createAdminClient()
    const tickResp = await admin
      .from("point_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("reason", "room_day")
      .gte("created_at", startOfDay.toISOString())
      .limit(1)
    alreadyTickedToday = (tickResp.count ?? 0) > 0
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
      <Link
        href="/rooms"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Toutes les rooms
      </Link>

      <header className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          {room.is_premium && (
            <Badge className="text-[10px]" variant="secondary">
              <Crown className="size-3" strokeWidth={1.6} />
              Premium
            </Badge>
          )}
          <Badge variant="outline" className="text-[10px] capitalize">
            {room.category}
          </Badge>
        </div>
        <h1 className="font-heading text-3xl tracking-tight">{room.name_fr}</h1>
        {room.description_fr && (
          <p className="text-sm text-muted-foreground max-w-prose leading-relaxed">
            {room.description_fr}
          </p>
        )}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" strokeWidth={1.6} />
            {room.duration_days} jours
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" strokeWidth={1.6} />
            {room.participants_count} participant{room.participants_count > 1 ? "s" : ""}
          </span>
        </div>
        {!isLockedPremium && (
          <div className="pt-2">
            <RoomJoinButton slug={room.slug} isMember={isMember} durationDays={room.duration_days} />
          </div>
        )}
      </header>

      <div className="grid gap-4 md:grid-cols-5">
        <div className="md:col-span-2 space-y-4">
          {isLockedPremium ? (
            <RoomLockedCard requiredPlan="pro" />
          ) : isMember ? (
            <RoomDayActionCard
              slug={room.slug}
              durationDays={room.duration_days}
              currentDay={membership!.current_day}
              completed={membership!.completed}
              today={todayAction}
              alreadyTickedToday={alreadyTickedToday}
            />
          ) : (
            <Card className="glass">
              <CardContent className="py-6 space-y-3">
                <p className="text-sm leading-relaxed">
                  Tu n&apos;es pas encore dans cette room. Une fois rejoint·e, tu reçois une action par jour pendant {room.duration_days} jours.
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Aperçu jour 1 :{" "}
                  <span className="text-foreground">
                    {template[0]?.title ?? "—"}
                  </span>
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-3">
          <RoomMessages
            slug={room.slug}
            isMember={isMember && !isLockedPremium}
            currentUserId={user.id}
          />
        </div>
      </div>
    </div>
  )
}
