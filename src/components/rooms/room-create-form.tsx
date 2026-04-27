"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"

export function RoomCreateForm() {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [duration, setDuration] = useState("7")
  const [category, setCategory] = useState("focus")
  const [isPremium, setIsPremium] = useState("false")

  async function submit() {
    setPending(true)
    try {
      const r = await fetch("/api/rooms", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          duration_days: Number(duration),
          category,
          is_premium: isPremium === "true",
        }),
      })
      const json = (await r.json()) as { ok?: true; slug?: string; error?: string }
      if (!r.ok || !json.ok || !json.slug) {
        toast.error(json.error ?? "Création impossible.")
        return
      }
      toast.success("Room créée.")
      router.push(`/rooms/${json.slug}`)
    } finally {
      setPending(false)
    }
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-base font-medium">Créer une room</CardTitle>
        <CardDescription>
          Une room = un programme avec une action par jour. Tu peux préciser les actions par jour plus tard depuis l&apos;éditeur (à venir P8). Pour l&apos;instant, tu poses le cadre.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nom de la room</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            placeholder="Ex : Lecture matinale"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="desc">Description courte</Label>
          <Textarea
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            placeholder="À qui ça s'adresse, ce que ça apporte."
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label>Durée</Label>
            <Select value={duration} onValueChange={(v) => setDuration(v ?? "7")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 jours</SelectItem>
                <SelectItem value="7">7 jours</SelectItem>
                <SelectItem value="14">14 jours</SelectItem>
                <SelectItem value="21">21 jours</SelectItem>
                <SelectItem value="30">30 jours</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Catégorie</Label>
            <Select value={category} onValueChange={(v) => setCategory(v ?? "focus")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="focus">Focus</SelectItem>
                <SelectItem value="sleep">Sommeil</SelectItem>
                <SelectItem value="mind">Mental</SelectItem>
                <SelectItem value="morning">Matin</SelectItem>
                <SelectItem value="execute">Exécution</SelectItem>
                <SelectItem value="reset">Reset</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Accès</Label>
            <Select value={isPremium} onValueChange={(v) => setIsPremium(v ?? "false")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">Tous les plans</SelectItem>
                <SelectItem value="true">Premium uniquement</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <Button
            onClick={submit}
            disabled={pending || name.trim().length < 3}
          >
            {pending ? "Création…" : "Créer la room"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
