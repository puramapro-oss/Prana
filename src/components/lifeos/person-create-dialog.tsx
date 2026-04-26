"use client"

import { useState } from "react"
import { UserPlus, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCreatePerson } from "@/hooks/use-lifeos"
import { toast } from "sonner"

export function PersonCreateDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [relation, setRelation] = useState("")
  const [frequency, setFrequency] = useState("")
  const create = useCreatePerson()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim().length < 2) {
      toast.error("Donne un prénom au moins.")
      return
    }
    const freq = frequency.trim() ? Number(frequency) : undefined
    if (freq !== undefined && (Number.isNaN(freq) || freq < 1 || freq > 365)) {
      toast.error("Fréquence : entre 1 et 365 jours.")
      return
    }
    try {
      await create.mutateAsync({
        name,
        relation: relation || undefined,
        contact_frequency_days: freq,
      })
      toast.success("Personne ajoutée.")
      setName("")
      setRelation("")
      setFrequency("")
      setOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        nativeButton={true}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
      >
        <UserPlus className="size-4" />
        Ajouter
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle personne</DialogTitle>
          <DialogDescription>
            Quelqu&apos;un que tu veux garder en tête. Tu seras nudgé selon la
            fréquence que tu choisis.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="person-name">Prénom (et nom si tu veux)</Label>
            <Input
              id="person-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Sophie"
              maxLength={120}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="person-relation">Lien · optionnel</Label>
            <Input
              id="person-relation"
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              placeholder="Ex: amie, mentor, sœur, collègue"
              maxLength={80}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="person-freq">Tu veux la contacter tous les… (jours)</Label>
            <Input
              id="person-freq"
              type="number"
              min={1}
              max={365}
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              placeholder="Ex: 30"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={create.isPending}>
              Annuler
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" /> Création…
                </>
              ) : (
                "Ajouter"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
