"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createBrowserClient } from "@supabase/ssr"
import type {
  Capture,
  Note,
  Person,
  Project,
  Task,
  TaskStatus,
  Database,
} from "@/lib/supabase/types"

/* -------------------------------------------------------------------------- */
/*  Browser supabase singleton                                                */
/* -------------------------------------------------------------------------- */

let _client: ReturnType<typeof createBrowserClient<Database, "prana">> | null = null

function getBrowserClient() {
  if (_client) return _client
  _client = createBrowserClient<Database, "prana">(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { db: { schema: "prana" } },
  )
  return _client
}

/* -------------------------------------------------------------------------- */
/*  Query keys                                                                */
/* -------------------------------------------------------------------------- */

export const lifeosKeys = {
  inbox: ["lifeos", "inbox"] as const,
  tasks: (filters?: TaskFilters) => ["lifeos", "tasks", filters ?? {}] as const,
  projects: ["lifeos", "projects"] as const,
  people: ["lifeos", "people"] as const,
  notes: ["lifeos", "notes"] as const,
  plan7: ["lifeos", "plan7"] as const,
}

/* -------------------------------------------------------------------------- */
/*  Captures                                                                  */
/* -------------------------------------------------------------------------- */

export interface CaptureCreatePayload {
  raw_text: string
  source?: "text" | "share"
}

export function useInboxCaptures() {
  return useQuery({
    queryKey: lifeosKeys.inbox,
    queryFn: async (): Promise<Capture[]> => {
      const supabase = getBrowserClient()
      const { data, error } = await supabase
        .from("captures")
        .select(
          "id, user_id, raw_text, source, audio_url, classified_at, classification, archived, created_at",
        )
        .eq("archived", false)
        .is("classified_at", null)
        .order("created_at", { ascending: false })
        .limit(20)
      if (error) throw error
      return (data ?? []) as Capture[]
    },
    refetchInterval: 4000,
  })
}

export function useCreateCapture() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (
      payload: CaptureCreatePayload | FormData,
    ): Promise<{ ok: boolean; capture: Pick<Capture, "id" | "raw_text" | "source"> }> => {
      const init: RequestInit =
        payload instanceof FormData
          ? { method: "POST", body: payload }
          : {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ source: "text", ...payload }),
            }
      const r = await fetch("/api/lifeos/capture", init)
      const json = (await r.json()) as
        | { ok: true; capture: Pick<Capture, "id" | "raw_text" | "source"> }
        | { error: string; quotaReached?: boolean }
      if (!r.ok || !("ok" in json)) {
        const err = "error" in json ? json.error : "Erreur"
        throw new Error(err)
      }
      return json
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lifeosKeys.inbox })
      // Re-classify will materialize into other tables → invalidate broadly
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: ["lifeos"] })
      }, 1500)
    },
  })
}

/* -------------------------------------------------------------------------- */
/*  Tasks                                                                     */
/* -------------------------------------------------------------------------- */

export interface TaskFilters {
  status?: TaskStatus
  priorityMax?: number
  energy?: "low" | "medium" | "high"
  projectId?: string
}

export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: lifeosKeys.tasks(filters),
    queryFn: async (): Promise<Task[]> => {
      const supabase = getBrowserClient()
      let q = supabase
        .from("tasks")
        .select(
          "id, user_id, title, description, status, priority, energy_required, time_estimate_minutes, due_at, project_id, person_id, source_capture_id, completed_at, created_at, updated_at",
        )
        .order("priority", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(200)
      if (filters.status) q = q.eq("status", filters.status)
      if (filters.priorityMax) q = q.lte("priority", filters.priorityMax)
      if (filters.energy) q = q.eq("energy_required", filters.energy)
      if (filters.projectId) q = q.eq("project_id", filters.projectId)
      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as Task[]
    },
  })
}

export function useUpdateTaskStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { id: string; status: TaskStatus }) => {
      const supabase = getBrowserClient()
      const update: { status: TaskStatus; completed_at: string | null } = {
        status: vars.status,
        completed_at: vars.status === "done" ? new Date().toISOString() : null,
      }
      const { error } = await supabase.from("tasks").update(update).eq("id", vars.id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lifeos", "tasks"] })
    },
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getBrowserClient()
      const { error } = await supabase.from("tasks").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lifeos", "tasks"] })
    },
  })
}

/* -------------------------------------------------------------------------- */
/*  Projects                                                                  */
/* -------------------------------------------------------------------------- */

export function useProjects() {
  return useQuery({
    queryKey: lifeosKeys.projects,
    queryFn: async (): Promise<Project[]> => {
      const supabase = getBrowserClient()
      const { data, error } = await supabase
        .from("projects")
        .select("id, user_id, name, why, status, target_date, created_at")
        .order("created_at", { ascending: false })
        .limit(100)
      if (error) throw error
      return (data ?? []) as Project[]
    },
  })
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { name: string; why?: string }) => {
      const supabase = getBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Non connecté")
      const { error } = await supabase.from("projects").insert({
        user_id: user.id,
        name: vars.name.trim().slice(0, 120),
        why: vars.why?.trim() || null,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: lifeosKeys.projects }),
  })
}

/* -------------------------------------------------------------------------- */
/*  People                                                                    */
/* -------------------------------------------------------------------------- */

export function usePeople() {
  return useQuery({
    queryKey: lifeosKeys.people,
    queryFn: async (): Promise<Person[]> => {
      const supabase = getBrowserClient()
      const { data, error } = await supabase
        .from("people")
        .select("id, user_id, name, relation, notes, last_contact_at, contact_frequency_days, created_at")
        .order("name", { ascending: true })
        .limit(200)
      if (error) throw error
      return (data ?? []) as Person[]
    },
  })
}

export function useCreatePerson() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { name: string; relation?: string; contact_frequency_days?: number }) => {
      const supabase = getBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Non connecté")
      const { error } = await supabase.from("people").insert({
        user_id: user.id,
        name: vars.name.trim().slice(0, 120),
        relation: vars.relation?.trim() || null,
        contact_frequency_days: vars.contact_frequency_days ?? null,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: lifeosKeys.people }),
  })
}

export function useTouchPersonContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getBrowserClient()
      const { error } = await supabase
        .from("people")
        .update({ last_contact_at: new Date().toISOString() })
        .eq("id", id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: lifeosKeys.people }),
  })
}

/* -------------------------------------------------------------------------- */
/*  Notes                                                                     */
/* -------------------------------------------------------------------------- */

export function useNotes(searchQuery?: string) {
  return useQuery({
    queryKey: [...lifeosKeys.notes, searchQuery ?? ""],
    queryFn: async (): Promise<Note[]> => {
      const supabase = getBrowserClient()
      let q = supabase
        .from("notes")
        .select("id, user_id, title, body, tags, pinned, created_at, updated_at")
        .order("pinned", { ascending: false })
        .order("updated_at", { ascending: false })
        .limit(100)
      if (searchQuery && searchQuery.trim().length >= 2) {
        // Plain ilike fallback (FTS server-side via search_vector for /search route later)
        q = q.or(
          `title.ilike.%${searchQuery}%,body.ilike.%${searchQuery}%`,
        )
      }
      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as Note[]
    },
  })
}

export function useTogglePinNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { id: string; pinned: boolean }) => {
      const supabase = getBrowserClient()
      const { error } = await supabase
        .from("notes")
        .update({ pinned: vars.pinned })
        .eq("id", vars.id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: lifeosKeys.notes }),
  })
}

export function useDeleteNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getBrowserClient()
      const { error } = await supabase.from("notes").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: lifeosKeys.notes }),
  })
}
