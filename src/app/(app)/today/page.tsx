import { redirect } from "next/navigation"
import { Wind, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

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

  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("display_name, plan, trial_ends_at")
    .eq("id", user.id)
    .maybeSingle()
  const profile = profileRaw as { display_name: string | null; plan: string; trial_ends_at: string | null } | null

  const greeting = profile?.display_name ?? user.email?.split("@")[0] ?? "toi"

  return (
    <div className="container-calm py-10 space-y-8">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Bon retour.</p>
        <h1 className="font-heading text-4xl md:text-5xl tracking-tight">
          Bonjour {greeting}.
        </h1>
        <p className="text-muted-foreground max-w-prose leading-relaxed">
          Tu es là. C&apos;est déjà beaucoup. On commence par respirer 90 secondes, puis une seule action.
        </p>
      </div>

      <Card className="glass">
        <CardHeader className="space-y-3">
          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Wind className="size-5 text-primary" strokeWidth={1.6} />
          </div>
          <CardTitle className="font-heading text-2xl">Pulse Check</CardTitle>
          <CardDescription>
            Comment tu te sens, là, maintenant ? Trois curseurs. C&apos;est tout.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic">
            Le Pulse Check arrive en P2. Pour l&apos;instant, on respire ensemble.
          </p>
        </CardContent>
      </Card>

      <Card className="glass border-primary/30">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary">
            <Sparkles className="size-3.5" strokeWidth={1.8} />
            Bienvenue sur PURAMA ONE
          </div>
          <CardTitle className="font-heading text-2xl">Plan {profile?.plan ?? "free"}</CardTitle>
          <CardDescription>
            {profile?.trial_ends_at
              ? `Ton essai Pro court jusqu'au ${new Date(profile.trial_ends_at).toLocaleDateString("fr-FR")}.`
              : "Bienvenue dans ton espace."}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
