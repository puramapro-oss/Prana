"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { RoomMessage } from "@/lib/supabase/types"
import { track } from "@/lib/analytics"

interface JoinResponse {
  ok: true
  membership_id: string
}

export function useJoinRoom() {
  const qc = useQueryClient()
  return useMutation<JoinResponse, Error, { slug: string }>({
    mutationFn: async ({ slug }) => {
      const r = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug }),
      })
      const json = (await r.json()) as JoinResponse | { error: string; upgradeRequired?: string }
      if (!r.ok || !("ok" in json)) {
        throw new Error(("error" in json && json.error) || "Impossible de rejoindre.")
      }
      return json
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["room", variables.slug] })
      qc.invalidateQueries({ queryKey: ["rooms"] })
      track("room_joined", { slug: variables.slug })
    },
  })
}

export function useLeaveRoom() {
  const qc = useQueryClient()
  return useMutation<void, Error, { slug: string }>({
    mutationFn: async ({ slug }) => {
      const r = await fetch("/api/rooms/leave", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug }),
      })
      const json = (await r.json()) as { ok?: true; error?: string }
      if (!r.ok || !json.ok) throw new Error(json.error || "Impossible de quitter.")
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["room", variables.slug] })
      qc.invalidateQueries({ queryKey: ["rooms"] })
    },
  })
}

export function useTickRoom() {
  const qc = useQueryClient()
  return useMutation<
    { ok: true; pointsGranted: number; current_day: number; completed: boolean },
    Error,
    { slug: string }
  >({
    mutationFn: async ({ slug }) => {
      const r = await fetch("/api/rooms/tick", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug }),
      })
      const json = (await r.json()) as
        | { ok: true; pointsGranted: number; current_day: number; completed: boolean }
        | { error: string }
      if (!r.ok || !("ok" in json)) {
        throw new Error(("error" in json && json.error) || "Impossible.")
      }
      return json
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["room", variables.slug] })
      qc.invalidateQueries({ queryKey: ["score", "daily"] })
    },
  })
}

interface MessagesResponse {
  ok: true
  messages: RoomMessage[]
}

export function useRoomMessages(slug: string) {
  return useQuery<MessagesResponse>({
    queryKey: ["room", slug, "messages"],
    queryFn: async () => {
      const r = await fetch(`/api/rooms/messages?slug=${encodeURIComponent(slug)}`, {
        cache: "no-store",
      })
      const json = (await r.json()) as MessagesResponse | { error: string }
      if (!r.ok || !("ok" in json)) {
        throw new Error(("error" in json && json.error) || "Messages indisponibles.")
      }
      return json
    },
    refetchInterval: 8_000,
    refetchOnWindowFocus: true,
  })
}

export function usePostRoomMessage() {
  const qc = useQueryClient()
  return useMutation<void, Error, { slug: string; body: string }>({
    mutationFn: async ({ slug, body }) => {
      const r = await fetch("/api/rooms/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, body }),
      })
      const json = (await r.json()) as { ok?: true; error?: string }
      if (!r.ok || !json.ok) throw new Error(json.error || "Impossible d'envoyer.")
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["room", variables.slug, "messages"] })
    },
  })
}
