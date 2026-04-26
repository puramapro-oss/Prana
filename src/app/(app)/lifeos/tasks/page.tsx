"use client"

import { useMemo, useState } from "react"
import { Loader2, ListChecks } from "lucide-react"
import { useTasks, useProjects, usePeople } from "@/hooks/use-lifeos"
import { TaskRow } from "@/components/lifeos/task-row"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { TaskStatus, EnergyRequired } from "@/lib/supabase/types"

type StatusFilter = "open" | TaskStatus | "all"
type EnergyFilter = "all" | EnergyRequired
type PriorityFilter = "all" | "p1" | "p2" | "p1_p2"

export default function TasksPage() {
  const [status, setStatus] = useState<StatusFilter>("open")
  const [priority, setPriority] = useState<PriorityFilter>("all")
  const [energy, setEnergy] = useState<EnergyFilter>("all")
  const [project, setProject] = useState<string>("all")
  const [search, setSearch] = useState("")

  const filters = useMemo(() => {
    const f: { status?: TaskStatus; priorityMax?: number; energy?: EnergyRequired; projectId?: string } = {}
    if (status !== "open" && status !== "all") f.status = status
    if (priority === "p1") f.priorityMax = 1
    if (priority === "p2") f.priorityMax = 2
    if (priority === "p1_p2") f.priorityMax = 2
    if (energy !== "all") f.energy = energy
    if (project !== "all") f.projectId = project
    return f
  }, [status, priority, energy, project])

  const tasksQ = useTasks(filters)
  const projectsQ = useProjects()
  const peopleQ = usePeople()

  const projectsById = useMemo(() => {
    const m = new Map<string, string>()
    for (const p of projectsQ.data ?? []) m.set(p.id, p.name)
    return m
  }, [projectsQ.data])

  const peopleById = useMemo(() => {
    const m = new Map<string, string>()
    for (const p of peopleQ.data ?? []) m.set(p.id, p.name)
    return m
  }, [peopleQ.data])

  const visible = useMemo(() => {
    let list = tasksQ.data ?? []
    if (status === "open") list = list.filter((t) => t.status === "todo" || t.status === "doing")
    if (search.trim().length >= 2) {
      const q = search.toLowerCase().trim()
      list = list.filter(
        (t) => t.title.toLowerCase().includes(q) || (t.description ?? "").toLowerCase().includes(q),
      )
    }
    return list
  }, [tasksQ.data, status, search])

  function resetFilters() {
    setStatus("open")
    setPriority("all")
    setEnergy("all")
    setProject("all")
    setSearch("")
  }

  return (
    <div className="container-calm py-6 sm:py-8 space-y-5">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl tracking-tight">Tâches</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {visible.length} {visible.length === 1 ? "tâche" : "tâches"}
            {status === "open" ? " ouvertes" : ""}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card/40 p-3 sm:p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Ouvertes</SelectItem>
              <SelectItem value="todo">À faire</SelectItem>
              <SelectItem value="doing">En cours</SelectItem>
              <SelectItem value="done">Terminées</SelectItem>
              <SelectItem value="dropped">Abandonnées</SelectItem>
              <SelectItem value="all">Toutes</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priority} onValueChange={(v) => setPriority(v as PriorityFilter)}>
            <SelectTrigger>
              <SelectValue placeholder="Priorité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes priorités</SelectItem>
              <SelectItem value="p1">P1 uniquement</SelectItem>
              <SelectItem value="p2">P2 et au-dessus</SelectItem>
              <SelectItem value="p1_p2">P1 + P2</SelectItem>
            </SelectContent>
          </Select>

          <Select value={energy} onValueChange={(v) => setEnergy(v as EnergyFilter)}>
            <SelectTrigger>
              <SelectValue placeholder="Énergie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toute énergie</SelectItem>
              <SelectItem value="low">Faible</SelectItem>
              <SelectItem value="medium">Moyenne</SelectItem>
              <SelectItem value="high">Forte</SelectItem>
            </SelectContent>
          </Select>

          <Select value={project} onValueChange={(v) => setProject(v ?? "all")}>
            <SelectTrigger>
              <SelectValue placeholder="Projet" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous projets</SelectItem>
              {(projectsQ.data ?? []).map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher…"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {filters.status || filters.priorityMax || filters.energy || filters.projectId || search
              ? "Filtres actifs"
              : "Aucun filtre"}
          </span>
          <Button onClick={resetFilters} variant="ghost" size="sm">
            Réinitialiser
          </Button>
        </div>
      </div>

      {tasksQ.isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          <span className="ml-2 text-sm">Chargement…</span>
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-card/30 p-10 text-center">
          <ListChecks className="mx-auto size-8 text-muted-foreground/60" strokeWidth={1.4} />
          <p className="mt-4 font-heading text-lg">Aucune tâche.</p>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
            Capture une action avec le bouton ＋ — je crée la tâche pour toi.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {visible.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              projectName={t.project_id ? projectsById.get(t.project_id) : undefined}
              personName={t.person_id ? peopleById.get(t.person_id) : undefined}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
