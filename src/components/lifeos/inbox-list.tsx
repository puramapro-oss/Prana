"use client"

import { Loader2, Inbox as InboxIcon, RefreshCw } from "lucide-react"
import { useInboxCaptures } from "@/hooks/use-lifeos"
import { Button } from "@/components/ui/button"

export function InboxList() {
  const { data, isLoading, isError, refetch, isFetching } = useInboxCaptures()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        <span className="ml-2 text-sm">Chargement…</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-center">
        <p className="text-sm">Impossible de charger l&apos;inbox. Vérifie ta connexion.</p>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-3">
          Réessayer
        </Button>
      </div>
    )
  }

  const items = data ?? []
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-card/30 p-10 text-center">
        <InboxIcon className="mx-auto size-8 text-muted-foreground/60" strokeWidth={1.4} />
        <p className="mt-4 font-heading text-lg">Inbox vide.</p>
        <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
          Capture une idée, une tâche ou un nom avec le bouton ＋ en bas à droite.
          Je trie pour toi en quelques secondes.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
        <span>
          {items.length} capture{items.length > 1 ? "s" : ""} en attente de tri
        </span>
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-1 hover:text-foreground transition"
          disabled={isFetching}
        >
          <RefreshCw className={`size-3 ${isFetching ? "animate-spin" : ""}`} />
          Rafraîchir
        </button>
      </div>

      <ul className="space-y-2">
        {items.map((c) => (
          <li
            key={c.id}
            className="rounded-xl border border-border/50 bg-card/60 px-4 py-3 transition hover:border-border"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {c.raw_text}
              </p>
              <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground/80">
                {c.source === "voice" ? "vocal" : c.source === "share" ? "partage" : "texte"}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
              <Loader2 className="size-3 animate-spin" />
              <span>Tri en cours…</span>
              <span className="opacity-60">·</span>
              <span>
                {new Date(c.created_at).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
