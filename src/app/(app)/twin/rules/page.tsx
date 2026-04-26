import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TwinStringListEditor } from "@/components/twin/twin-string-list-editor"
import type { Plan } from "@/lib/supabase/types"

export const metadata = {
  title: "Twin · Règles personnelles",
}

export default async function TwinRulesPage() {
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
    <div className="container-calm py-6 sm:py-8 space-y-8">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl tracking-tight">Règles personnelles</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-prose">
          Tes règles déclarées (PRANA les respecte). Ex : &quot;jamais de réunion
          avant 10h&quot;, &quot;1 sortie nature par semaine&quot;, &quot;pas de boulot le dimanche&quot;.
        </p>
      </div>

      <TwinStringListEditor
        field="personal_rules"
        label="Règles déclarées"
        description="Phrases courtes au présent. PRANA s'y réfère pour proposer ou refuser des actions."
        placeholder="Ex: jamais de réunion avant 10h"
        emptyHint="Aucune règle pour l'instant. Ajoute-en une — PRANA s'y tiendra."
        maxItems={15}
        maxLength={160}
        canEdit={canEdit}
        variant="list"
      />

      <TwinStringListEditor
        field="stress_triggers"
        label="Triggers stress"
        description="Ce qui te crispe. PRANA évite de t'y exposer ou te prépare avant."
        placeholder="Ex: décisions urgentes, réunions matinales"
        emptyHint="Aucun trigger pour l'instant — soit ils sont rares, soit on n'a pas encore observé."
        maxItems={10}
        maxLength={80}
        canEdit={canEdit}
        variant="chips"
      />

      <TwinStringListEditor
        field="recharge_activities"
        label="Recharge"
        description="Ce qui te ressource vraiment. PRANA t'y oriente quand l'énergie chute."
        placeholder="Ex: marcher, écrire, voir Sophie"
        emptyHint="Aucune activité de recharge déclarée."
        maxItems={10}
        maxLength={80}
        canEdit={canEdit}
        variant="chips"
      />
    </div>
  )
}
