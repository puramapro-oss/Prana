import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Lock, MessageSquare, Mail, Megaphone, ListTodo, FileText, Mic } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { EXECUTE_TYPES } from "@/lib/agent/prompts/execute"
import { cn } from "@/lib/utils"
import type { Plan } from "@/lib/supabase/types"

export const metadata = {
  title: "Execute · 3 brouillons en 10 secondes",
  description: "Tu décris la situation. L'IA produit 3 alternatives prêtes.",
}

const TYPE_ICON = {
  message: MessageSquare,
  email: Mail,
  post: Megaphone,
  plan: ListTodo,
  doc: FileText,
  script: Mic,
} as const

const TYPE_HREF = {
  message: "/execute/messages",
  email: "/execute/emails",
  post: "/execute",
  plan: "/execute/plans",
  doc: "/execute",
  script: "/execute",
} as const

export default async function ExecuteIndexPage() {
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
  const locked = userPlan === "free"

  return (
    <div className="container-calm py-6 sm:py-10 space-y-6 sm:space-y-8">
      <div className="space-y-3 max-w-2xl">
        <h1 className="font-heading text-3xl sm:text-4xl tracking-tight">Execute</h1>
        <p className="text-muted-foreground leading-relaxed">
          Tu décris la situation, l&apos;IA produit 3 alternatives prêtes à
          envoyer ou poster. Tu copies celle qui te ressemble — ou tu régénères.
        </p>
      </div>

      {locked ? (
        <div className="rounded-2xl border border-border/50 bg-card/40 p-6 sm:p-8 max-w-2xl">
          <div className="flex items-start gap-3">
            <Lock className="size-5 text-primary/70 shrink-0 mt-0.5" strokeWidth={1.6} />
            <div>
              <h2 className="font-heading text-lg">Plan Starter requis</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Execute est inclus dans Starter (5 générations/jour) et illimité
                en Pro et Ultime.
              </p>
              <Link
                href="/pricing"
                className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Voir les plans
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {EXECUTE_TYPES.map((tpl) => {
          const Icon = TYPE_ICON[tpl.type]
          const href = TYPE_HREF[tpl.type]
          return (
            <li key={tpl.type}>
              <Link
                href={locked ? "/pricing" : href}
                className={cn(
                  "block group rounded-2xl border border-border/50 bg-card/60 p-5 transition",
                  "hover:border-primary/40 hover:bg-card hover:shadow-md hover:shadow-primary/5",
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" strokeWidth={1.6} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-base leading-snug">{tpl.label}</h3>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {tpl.description}
                    </p>
                    <p className="mt-3 text-[11px] text-muted-foreground italic line-clamp-1">
                      ex : {tpl.example}
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>

      <p className="text-xs text-muted-foreground italic">
        L&apos;IA n&apos;invente pas de faits. Si une info manque dans ta description,
        elle reste neutre — pas de [Nom] ou [date] à remplacer.
      </p>
    </div>
  )
}
