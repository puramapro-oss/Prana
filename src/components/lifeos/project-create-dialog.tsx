"use client"

import { useState } from "react"
import { Plus, Loader2 } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { useCreateProject } from "@/hooks/use-lifeos"
import { toast } from "sonner"

export function ProjectCreateDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [why, setWhy] = useState("")
  const create = useCreateProject()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim().length < 2) {
      toast.error("Donne un nom à ton projet.")
      return
    }
    try {
      await create.mutateAsync({ name, why })
      toast.success("Projet créé.")
      setName("")
      setWhy("")
      setOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur de création.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        nativeButton={true}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
      >
        <Plus className="size-4" />
        Nouveau projet
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau projet</DialogTitle>
          <DialogDescription>
            Un projet, c&apos;est une intention durable. Pas une tâche.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="project-name">Nom</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Lancer mon site perso"
              maxLength={120}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="project-why">Pourquoi · optionnel</Label>
            <Textarea
              id="project-why"
              value={why}
              onChange={(e) => setWhy(e.target.value)}
              placeholder="Ce qui t'importe vraiment dans ce projet."
              rows={3}
              maxLength={500}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={create.isPending}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Création…
                </>
              ) : (
                "Créer le projet"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
