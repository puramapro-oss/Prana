"use client"

import { useEffect, useState } from "react"
import { Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useTwin, useUpdateTwin } from "@/hooks/use-twin"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { TwinCommunicationStyle } from "@/lib/supabase/types"

const TONE_OPTIONS = [
  { value: "casual", label: "Décontracté", hint: "Comme à un·e ami·e" },
  { value: "warm", label: "Chaleureux", hint: "Doux, posé" },
  { value: "professional", label: "Professionnel", hint: "Neutre, structuré" },
  { value: "direct", label: "Direct", hint: "Court, sans détour" },
  { value: "playful", label: "Joueur", hint: "Avec humour, légèreté" },
] as const

const LENGTH_OPTIONS = [
  { value: "short", label: "Court", hint: "1-3 phrases" },
  { value: "medium", label: "Moyen", hint: "Un paragraphe" },
  { value: "long", label: "Long", hint: "Détaillé, structuré" },
] as const

const FORMALITY_OPTIONS = [
  { value: "low", label: "Tutoiement", hint: "On se connaît" },
  { value: "medium", label: "Mixte", hint: "Selon contexte" },
  { value: "high", label: "Vouvoiement", hint: "Distance respectueuse" },
] as const

const EMOJI_OPTIONS = [
  { value: "none", label: "Aucun", hint: "Texte pur" },
  { value: "rare", label: "Rares", hint: "1 quand vraiment utile" },
  { value: "moderate", label: "Modérés", hint: "Quelques par message" },
  { value: "frequent", label: "Fréquents", hint: "Expressifs" },
] as const

interface TwinPersonalityFormProps {
  canEdit: boolean
}

export function TwinPersonalityForm({ canEdit }: TwinPersonalityFormProps) {
  const twinQ = useTwin()
  const update = useUpdateTwin()

  const [tone, setTone] = useState<TwinCommunicationStyle["tone"] | null>(null)
  const [length, setLength] = useState<TwinCommunicationStyle["length"] | null>(null)
  const [formality, setFormality] = useState<TwinCommunicationStyle["formality"] | null>(null)
  const [emojiUse, setEmojiUse] = useState<TwinCommunicationStyle["emoji_use"] | null>(null)

  useEffect(() => {
    const cs = (twinQ.data?.communication_style as TwinCommunicationStyle | null) ?? null
    setTone(cs?.tone ?? null)
    setLength(cs?.length ?? null)
    setFormality(cs?.formality ?? null)
    setEmojiUse(cs?.emoji_use ?? null)
  }, [twinQ.data])

  if (twinQ.isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        <span className="ml-2 text-sm">Chargement…</span>
      </div>
    )
  }

  async function save() {
    if (!canEdit) {
      toast.error("L'édition manuelle fait partie du plan Starter.")
      return
    }
    try {
      await update.mutateAsync({
        communication_style: {
          tone,
          length,
          formality,
          emoji_use: emojiUse,
        },
      })
      toast.success("Personnalité mise à jour. Tes prochains messages s'adapteront.")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur d'enregistrement.")
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <RadioGroup
        label="Ton dominant"
        description="Comment PRANA te parle par défaut."
        value={tone}
        onChange={(v) => setTone(v as TwinCommunicationStyle["tone"])}
        options={[...TONE_OPTIONS]}
        disabled={!canEdit}
      />
      <RadioGroup
        label="Longueur préférée"
        description="Volume de chaque réponse."
        value={length}
        onChange={(v) => setLength(v as TwinCommunicationStyle["length"])}
        options={[...LENGTH_OPTIONS]}
        disabled={!canEdit}
      />
      <RadioGroup
        label="Formalité"
        description="Tutoiement / vouvoiement."
        value={formality}
        onChange={(v) => setFormality(v as TwinCommunicationStyle["formality"])}
        options={[...FORMALITY_OPTIONS]}
        disabled={!canEdit}
      />
      <RadioGroup
        label="Usage des emojis"
        description="Combien dans les messages générés."
        value={emojiUse}
        onChange={(v) => setEmojiUse(v as TwinCommunicationStyle["emoji_use"])}
        options={[...EMOJI_OPTIONS]}
        disabled={!canEdit}
      />

      <div className="pt-4 border-t border-border/40 flex items-center justify-end gap-3">
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

interface RadioOption {
  value: string
  label: string
  hint: string
}

interface RadioGroupProps {
  label: string
  description: string
  value: string | null | undefined
  onChange: (v: string | null) => void
  options: RadioOption[]
  disabled?: boolean
}

function RadioGroup({ label, description, value, onChange, options, disabled }: RadioGroupProps) {
  return (
    <div className="space-y-2">
      <div>
        <Label className="text-base font-heading">{label}</Label>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {options.map((opt) => {
          const active = value === opt.value
          return (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => onChange(active ? null : opt.value)}
                disabled={disabled}
                className={cn(
                  "w-full text-left rounded-xl border px-3 py-2.5 transition disabled:opacity-50 disabled:cursor-not-allowed",
                  active
                    ? "border-primary/60 bg-primary/[0.07] shadow-sm shadow-primary/10"
                    : "border-border/50 bg-card/50 hover:border-border hover:bg-card",
                )}
              >
                <p
                  className={cn(
                    "text-sm font-medium leading-snug",
                    active ? "text-foreground" : "text-foreground/90",
                  )}
                >
                  {opt.label}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{opt.hint}</p>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
