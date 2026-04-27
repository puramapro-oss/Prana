"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"

type Country = "FR" | "US" | "INTL"

interface SafetyFormProps {
  initial: {
    safety_country: Country
    emergency_contact: { name: string; phone: string; relationship?: string | null } | null
  }
}

export function SafetyForm({ initial }: SafetyFormProps) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [country, setCountry] = useState<Country>(initial.safety_country)
  const [name, setName] = useState(initial.emergency_contact?.name ?? "")
  const [phone, setPhone] = useState(initial.emergency_contact?.phone ?? "")
  const [relation, setRelation] = useState(initial.emergency_contact?.relationship ?? "")

  async function save() {
    start(async () => {
      const emergency_contact =
        name.trim() && phone.trim()
          ? { name: name.trim(), phone: phone.trim(), relationship: relation.trim() || null }
          : null
      const r = await fetch("/api/settings/safety", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ safety_country: country, emergency_contact }),
      })
      const json = (await r.json()) as { ok?: true; error?: string }
      if (!r.ok || !json.ok) {
        toast.error(json.error ?? "Impossible d'enregistrer.")
        return
      }
      toast.success("Préférences sécurité mises à jour.")
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <Card className="glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Pays pour les hotlines</CardTitle>
          <CardDescription>
            On affiche les bons numéros d&apos;écoute en cas de besoin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={country} onValueChange={(v) => setCountry((v as Country) ?? "FR")}>
            <SelectTrigger className="max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FR">France · 3114</SelectItem>
              <SelectItem value="US">USA · 988</SelectItem>
              <SelectItem value="INTL">International · findahelpline</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Contact de confiance (facultatif)</CardTitle>
          <CardDescription>
            Pas partagé avec PURAMA. Stocké chiffré, visible uniquement par toi. Affiché en cas d&apos;usage du SOS.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="name">Prénom · nom</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={40} placeholder="+33 6 …" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="relation">Lien (facultatif)</Label>
            <Input
              id="relation"
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              maxLength={40}
              placeholder="frère, amie proche, partenaire…"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </div>
  )
}
