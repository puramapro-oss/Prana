"use client"

import { useState } from "react"
import { Loader2, FileText, Pin, PinOff, Trash2, Search } from "lucide-react"
import { useNotes, useTogglePinNote, useDeleteNote } from "@/hooks/use-lifeos"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function NotesPage() {
  const [search, setSearch] = useState("")
  const notesQ = useNotes(search)
  const togglePin = useTogglePinNote()
  const remove = useDeleteNote()

  const items = notesQ.data ?? []

  return (
    <div className="container-calm py-6 sm:py-8 space-y-5">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl tracking-tight">Notes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tes idées et infos gardées. Capture, je classe.
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher dans tes notes…"
          className="pl-9"
        />
      </div>

      {notesQ.isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          <span className="ml-2 text-sm">Chargement…</span>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-card/30 p-10 text-center">
          <FileText className="mx-auto size-8 text-muted-foreground/60" strokeWidth={1.4} />
          <p className="mt-4 font-heading text-lg">
            {search ? "Rien trouvé." : "Aucune note."}
          </p>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
            {search
              ? "Essaie d'autres mots-clés."
              : "Capture une idée — je la classe en note pour toi."}
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((n) => (
            <li
              key={n.id}
              className={cn(
                "group rounded-xl border bg-card/60 p-4 transition hover:border-border",
                n.pinned ? "border-primary/40" : "border-border/50",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-heading text-sm leading-snug min-w-0 flex-1 break-words">
                  {n.title || "Sans titre"}
                </h3>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await togglePin.mutateAsync({ id: n.id, pinned: !n.pinned })
                      } catch {
                        toast.error("Erreur d'épinglage.")
                      }
                    }}
                    className="p-1 rounded hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                    aria-label={n.pinned ? "Désépingler" : "Épingler"}
                  >
                    {n.pinned ? <PinOff className="size-3.5" /> : <Pin className="size-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await remove.mutateAsync(n.id)
                        toast.success("Note supprimée.")
                      } catch {
                        toast.error("Erreur de suppression.")
                      }
                    }}
                    className="p-1 rounded hover:bg-destructive/15 text-muted-foreground hover:text-destructive"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>

              <p className="mt-2 text-xs text-muted-foreground line-clamp-5 whitespace-pre-wrap break-words">
                {n.body}
              </p>

              {n.tags && n.tags.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1">
                  {n.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                    >
                      #{tag.replace(/^#/, "")}
                    </span>
                  ))}
                </div>
              ) : null}

              <p className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground/60">
                {new Date(n.updated_at).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "short",
                })}
                {n.pinned ? " · épinglée" : ""}
              </p>
            </li>
          ))}
        </ul>
      )}

      {/* Spacer to clear FAB */}
      <div className="h-16" aria-hidden />
      <div className="text-center text-xs text-muted-foreground">
        Pour ajouter une note, utilise le bouton de capture <Button asChild variant="link" size="sm" className="px-1 h-auto"><span>＋</span></Button>.
      </div>
    </div>
  )
}
