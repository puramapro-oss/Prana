"use client"

import { Loader2, Users, Heart } from "lucide-react"
import { usePeople, useTouchPersonContact } from "@/hooks/use-lifeos"
import { PersonCreateDialog } from "@/components/lifeos/person-create-dialog"
import { Button } from "@/components/ui/button"
import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface PersonStatus {
  forgottenDays: number | null
  isOverdue: boolean
}

function getStatus(
  lastContact: string | null,
  frequencyDays: number | null,
): PersonStatus {
  if (!frequencyDays || !lastContact) {
    return { forgottenDays: null, isOverdue: false }
  }
  const days = Math.floor(
    (Date.now() - new Date(lastContact).getTime()) / (1000 * 60 * 60 * 24),
  )
  return { forgottenDays: days, isOverdue: days >= frequencyDays }
}

export default function PeoplePage() {
  const peopleQ = usePeople()
  const touch = useTouchPersonContact()

  const sorted = useMemo(() => {
    const data = peopleQ.data ?? []
    return [...data].sort((a, b) => {
      const sa = getStatus(a.last_contact_at, a.contact_frequency_days)
      const sb = getStatus(b.last_contact_at, b.contact_frequency_days)
      if (sa.isOverdue && !sb.isOverdue) return -1
      if (!sa.isOverdue && sb.isOverdue) return 1
      return a.name.localeCompare(b.name, "fr")
    })
  }, [peopleQ.data])

  return (
    <div className="container-calm py-6 sm:py-8 space-y-5">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl tracking-tight">Personnes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tes liens importants. Je te rappelle quand le silence dure.
          </p>
        </div>
        <PersonCreateDialog />
      </div>

      {peopleQ.isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          <span className="ml-2 text-sm">Chargement…</span>
        </div>
      ) : sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-card/30 p-10 text-center">
          <Users className="mx-auto size-8 text-muted-foreground/60" strokeWidth={1.4} />
          <p className="mt-4 font-heading text-lg">Personne pour l&apos;instant.</p>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
            Ajoute quelqu&apos;un que tu veux garder vivant dans ta vie.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((p) => {
            const status = getStatus(p.last_contact_at, p.contact_frequency_days)
            return (
              <li
                key={p.id}
                className={cn(
                  "rounded-xl border bg-card/60 p-4 transition",
                  status.isOverdue
                    ? "border-amber-500/40 shadow-md shadow-amber-500/10"
                    : "border-border/50",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading text-base leading-snug truncate">
                      {p.name}
                    </h3>
                    {p.relation ? (
                      <p className="text-xs text-muted-foreground mt-0.5">{p.relation}</p>
                    ) : null}
                  </div>
                  {status.isOverdue ? (
                    <span className="shrink-0 inline-flex items-center gap-1 rounded-md border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-amber-200">
                      Silence
                    </span>
                  ) : null}
                </div>

                {p.notes ? (
                  <p className="mt-3 text-xs text-muted-foreground line-clamp-2 whitespace-pre-wrap">
                    {p.notes}
                  </p>
                ) : null}

                <div className="mt-4 space-y-1.5 text-[11px] text-muted-foreground">
                  {p.last_contact_at ? (
                    <p>
                      Dernier contact ·{" "}
                      <span className="text-foreground/80">
                        {new Date(p.last_contact_at).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      {status.forgottenDays !== null
                        ? ` · il y a ${status.forgottenDays}j`
                        : null}
                    </p>
                  ) : (
                    <p>Aucun contact enregistré.</p>
                  )}
                  {p.contact_frequency_days ? (
                    <p>Fréquence souhaitée : tous les {p.contact_frequency_days} jours.</p>
                  ) : null}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  disabled={touch.isPending}
                  onClick={async () => {
                    try {
                      await touch.mutateAsync(p.id)
                      toast.success(`Contact avec ${p.name} mis à jour.`)
                    } catch {
                      toast.error("Erreur, réessaie.")
                    }
                  }}
                >
                  <Heart className="size-3.5 mr-1.5" />
                  Je l&apos;ai contacté·e
                </Button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
