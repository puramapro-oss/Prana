import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TwinStringListEditor } from "@/components/twin/twin-string-list-editor"
import type { Plan } from "@/lib/supabase/types"

export const metadata = {
  title: "Twin · Valeurs",
}

export default async function TwinValuesPage() {
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
        <h1 className="font-heading text-2xl sm:text-3xl tracking-tight">Valeurs</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-prose">
          Ce qui compte pour toi en profondeur. PRANA s&apos;y appuie pour aligner
          tes décisions et plans avec ce qui te tient vraiment.
        </p>
      </div>

      <TwinStringListEditor
        field="values"
        label="Tes valeurs"
        description="2 à 5 mots simples. Ex : famille, liberté, santé, création, service, vérité."
        placeholder="Ex: famille"
        emptyHint="Aucune valeur déclarée. Démarre par 3 — celles qui guident tes décisions."
        maxItems={10}
        maxLength={40}
        canEdit={canEdit}
        variant="chips"
      />
    </div>
  )
}
