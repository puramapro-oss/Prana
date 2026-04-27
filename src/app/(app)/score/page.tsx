import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ScorePageClient } from "@/components/score/score-page-client"

export const metadata = {
  title: "Score · PURAMA ONE",
  description: "Tes 30 derniers jours, sans jugement.",
}

export const dynamic = "force-dynamic"

export default async function ScorePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login?next=/score")

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
      <header className="space-y-1.5">
        <h1 className="font-heading text-3xl tracking-tight">Score</h1>
        <p className="text-sm text-muted-foreground max-w-prose leading-relaxed">
          Tes signaux des 30 derniers jours. Pas pour te juger — pour te connaître. La série n&apos;est jamais punitive : tu reprends quand tu veux.
        </p>
      </header>
      <ScorePageClient />
    </div>
  )
}
