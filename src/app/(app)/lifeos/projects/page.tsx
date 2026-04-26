"use client"

import { Loader2, Layers, Calendar } from "lucide-react"
import Link from "next/link"
import { useProjects, useTasks } from "@/hooks/use-lifeos"
import { ProjectCreateDialog } from "@/components/lifeos/project-create-dialog"
import { useMemo } from "react"

const STATUS_LABEL = {
  active: "Actif",
  paused: "En pause",
  done: "Terminé",
  dropped: "Abandonné",
} as const

const STATUS_COLOR = {
  active: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30",
  paused: "bg-amber-500/15 text-amber-200 border-amber-500/30",
  done: "bg-muted/40 text-muted-foreground border-border/50",
  dropped: "bg-muted/30 text-muted-foreground/70 border-border/40",
} as const

export default function ProjectsPage() {
  const projectsQ = useProjects()
  const tasksQ = useTasks({})

  const taskCountByProject = useMemo(() => {
    const m = new Map<string, { total: number; done: number }>()
    for (const t of tasksQ.data ?? []) {
      if (!t.project_id) continue
      const cur = m.get(t.project_id) ?? { total: 0, done: 0 }
      cur.total += 1
      if (t.status === "done") cur.done += 1
      m.set(t.project_id, cur)
    }
    return m
  }, [tasksQ.data])

  return (
    <div className="container-calm py-6 sm:py-8 space-y-5">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl tracking-tight">Projets</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tes intentions durables. Pas tes tâches.
          </p>
        </div>
        <ProjectCreateDialog />
      </div>

      {projectsQ.isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          <span className="ml-2 text-sm">Chargement…</span>
        </div>
      ) : (projectsQ.data ?? []).length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-card/30 p-10 text-center">
          <Layers className="mx-auto size-8 text-muted-foreground/60" strokeWidth={1.4} />
          <p className="mt-4 font-heading text-lg">Aucun projet.</p>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
            Capture une intention longue durée — je crée le projet pour toi —
            ou utilise le bouton ci-dessus.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(projectsQ.data ?? []).map((p) => {
            const counts = taskCountByProject.get(p.id) ?? { total: 0, done: 0 }
            const progress = counts.total > 0 ? Math.round((counts.done / counts.total) * 100) : 0
            const color = STATUS_COLOR[p.status]
            return (
              <li key={p.id}>
                <Link
                  href={`/lifeos/tasks?project=${p.id}`}
                  className="block rounded-xl border border-border/50 bg-card/60 p-4 transition hover:border-border hover:bg-card"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading text-base leading-snug">{p.name}</h3>
                    <span
                      className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${color}`}
                    >
                      {STATUS_LABEL[p.status]}
                    </span>
                  </div>
                  {p.why ? (
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                      {p.why}
                    </p>
                  ) : null}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>
                        {counts.done} / {counts.total} tâche{counts.total > 1 ? "s" : ""}
                      </span>
                      {p.target_date ? (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="size-3" />
                          {new Date(p.target_date).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </span>
                      ) : null}
                    </div>
                    {counts.total > 0 ? (
                      <div className="h-1 rounded-full bg-muted/40 overflow-hidden">
                        <div
                          className="h-full bg-primary/70 transition-all"
                          style={{ width: `${progress}%` }}
                          aria-hidden
                        />
                      </div>
                    ) : null}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
