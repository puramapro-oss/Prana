import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { RoomCard } from "@/components/rooms/room-card"
import type { Room, RoomMembership, Plan } from "@/lib/supabase/types"

export const metadata = {
  title: "Rooms · PURAMA ONE",
  description: "Des programmes de 3 à 30 jours, en groupe, avec un host IA bienveillant.",
}

export const dynamic = "force-dynamic"

export default async function RoomsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login?next=/rooms")

  const profileResp = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle()
  const userPlan: Plan = (profileResp.data?.plan as Plan | undefined) ?? "free"
  const canCreate = userPlan === "pro" || userPlan === "ultime"

  const [roomsResp, membershipsResp] = await Promise.all([
    supabase
      .from("rooms")
      .select(
        "id, slug, name_fr, description_fr, duration_days, category, is_official, is_premium, participants_count, cover_image_url",
      )
      .eq("is_official", true)
      .order("duration_days", { ascending: true }),
    supabase
      .from("room_memberships")
      .select("room_id, current_day, completed")
      .eq("user_id", user.id),
  ])

  type RoomBrief = Pick<
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
    | "cover_image_url"
  >
  const rooms = (roomsResp.data ?? []) as RoomBrief[]
  const memberships = (membershipsResp.data ?? []) as Pick<
    RoomMembership,
    "room_id" | "current_day" | "completed"
  >[]
  const membershipMap = new Map<string, { current_day: number; completed: boolean }>()
  memberships.forEach((m) =>
    membershipMap.set(m.room_id, { current_day: m.current_day, completed: m.completed }),
  )

  const myRooms = rooms.filter((r) => membershipMap.has(r.id))
  const otherRooms = rooms.filter((r) => !membershipMap.has(r.id))

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-8">
      <header className="flex items-end justify-between gap-3 flex-wrap">
        <div className="space-y-1.5">
          <h1 className="font-heading text-3xl tracking-tight">Rooms</h1>
          <p className="text-sm text-muted-foreground max-w-prose leading-relaxed">
            Tu rejoins une room. Chaque jour, une seule action. Un host IA personnalisé t&apos;accompagne. Tu n&apos;es pas seul·e — tu es avec d&apos;autres qui font la même chose.
          </p>
        </div>
        {canCreate && (
          <Button asChild variant="outline" size="sm">
            <Link href="/rooms/new">
              <Plus className="size-4" />
              Créer une room
            </Link>
          </Button>
        )}
      </header>

      {myRooms.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Mes rooms
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {myRooms.map((r) => (
              <RoomCard
                key={r.id}
                slug={r.slug}
                name={r.name_fr}
                description={r.description_fr}
                durationDays={r.duration_days}
                participantsCount={r.participants_count}
                isPremium={r.is_premium}
                isOfficial={r.is_official}
                membership={membershipMap.get(r.id) ?? null}
              />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Rooms officielles
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {otherRooms.map((r) => (
            <RoomCard
              key={r.id}
              slug={r.slug}
              name={r.name_fr}
              description={r.description_fr}
              durationDays={r.duration_days}
              participantsCount={r.participants_count}
              isPremium={r.is_premium}
              isOfficial={r.is_official}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
