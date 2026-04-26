"use client"

import { useEffect, useState } from "react"
import { Loader2, Plus, X, Save } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useTwin, useUpdateTwin, type TwinPatch } from "@/hooks/use-twin"
import { toast } from "sonner"
import type { TwinProfile } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

type StringField = "personal_rules" | "values" | "stress_triggers" | "recharge_activities"

interface StringListEditorProps {
  field: StringField
  label: string
  description: string
  placeholder: string
  emptyHint: string
  maxItems: number
  maxLength: number
  canEdit: boolean
  /** Use chips style (small) vs list style (one per row, with description). */
  variant?: "chips" | "list"
}

export function TwinStringListEditor({
  field,
  label,
  description,
  placeholder,
  emptyHint,
  maxItems,
  maxLength,
  canEdit,
  variant = "list",
}: StringListEditorProps) {
  const twinQ = useTwin()
  const update = useUpdateTwin()

  const [items, setItems] = useState<string[]>([])
  const [input, setInput] = useState("")

  useEffect(() => {
    const t = twinQ.data
    setItems((t ? (t[field] as TwinProfile[StringField]) ?? [] : []) as string[])
  }, [twinQ.data, field])

  if (twinQ.isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        <span className="ml-2 text-sm">Chargement…</span>
      </div>
    )
  }

  function add() {
    const v = input.trim().slice(0, maxLength)
    if (!v) return
    if (items.length >= maxItems) {
      toast.error(`Max ${maxItems} entrées.`)
      return
    }
    if (items.some((x) => x.toLowerCase() === v.toLowerCase())) {
      toast.error("Déjà présent.")
      return
    }
    setItems([...items, v])
    setInput("")
  }

  function remove(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  async function save() {
    if (!canEdit) {
      toast.error("L'édition manuelle fait partie du plan Starter.")
      return
    }
    try {
      const patch: TwinPatch = { [field]: items } as TwinPatch
      await update.mutateAsync(patch)
      toast.success("Enregistré.")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur d'enregistrement.")
    }
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="font-heading text-xl tracking-tight">{label}</h2>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>

      <div className="flex items-center gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              add()
            }
          }}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={!canEdit || items.length >= maxItems}
        />
        <Button
          type="button"
          onClick={add}
          variant="outline"
          disabled={!canEdit || input.trim().length === 0 || items.length >= maxItems}
        >
          <Plus className="size-4 mr-1" />
          Ajouter
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">{emptyHint}</p>
      ) : variant === "chips" ? (
        <div className="flex flex-wrap gap-2">
          {items.map((it, i) => (
            <span
              key={i}
              className="group inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-sm"
            >
              {it}
              <button
                type="button"
                onClick={() => remove(i)}
                disabled={!canEdit}
                className={cn(
                  "rounded-full p-0.5 hover:bg-destructive/15 hover:text-destructive transition",
                  !canEdit && "opacity-40 cursor-not-allowed",
                )}
                aria-label={`Retirer ${it}`}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((it, i) => (
            <li
              key={i}
              className="group flex items-start justify-between gap-3 rounded-xl border border-border/50 bg-card/60 px-4 py-3"
            >
              <p className="text-sm leading-snug flex-1 min-w-0 break-words">{it}</p>
              <button
                type="button"
                onClick={() => remove(i)}
                disabled={!canEdit}
                className={cn(
                  "shrink-0 rounded-md p-1 hover:bg-destructive/15 hover:text-destructive transition opacity-0 group-hover:opacity-100 focus:opacity-100",
                  !canEdit && "opacity-40 cursor-not-allowed",
                )}
                aria-label={`Retirer "${it}"`}
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="pt-2 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {items.length}/{maxItems} · enter pour ajouter
        </p>
        <Button onClick={save} disabled={update.isPending || !canEdit}>
          {update.isPending ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Enregistrement…
            </>
          ) : (
            <>
              <Save className="size-4 mr-2" />
              Enregistrer
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
