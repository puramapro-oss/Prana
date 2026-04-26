import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TwinPersonalityForm } from "@/components/twin/twin-personality"
import type { Plan } from "@/lib/supabase/types"

export const metadata = {
  title: "Twin · Personnalité",
}

export default async function TwinPersonalityPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const profileResp = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle()
  const userPlan: Plan = ((profileResp.data?.plan as Plan | undefined) ?? "free")
  const canEdit = userPlan !== "free"

  return (
    <div className="container-calm py-6 sm:py-8 space-y-6">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl tracking-tight">Personnalité</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-prose">
          Ton, longueur, formalité, emojis. Tes choix s&apos;appliquent à
          chaque réponse PRANA et à chaque brouillon Execute.
        </p>
        {!canEdit ? (
          <p className="mt-3 text-xs text-amber-300/90">
            Édition disponible dès le plan Starter. Le plan Free ne peut pas modifier la personnalité.
          </p>
        ) : null}
      </div>
      <TwinPersonalityForm canEdit={canEdit} />
    </div>
  )
}
