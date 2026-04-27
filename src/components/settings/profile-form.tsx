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

const COMMON_TZ = [
  "Europe/Paris",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Madrid",
  "America/New_York",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
]

interface ProfileFormProps {
  initial: {
    display_name: string
    locale: "fr" | "en"
    timezone: string
    email: string
    plan: string
  }
}

export function ProfileForm({ initial }: ProfileFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [displayName, setDisplayName] = useState(initial.display_name)
  const [locale, setLocale] = useState<"fr" | "en">(initial.locale)
  const [timezone, setTimezone] = useState(initial.timezone)

  async function onSave() {
    startTransition(async () => {
      const r = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ display_name: displayName, locale, timezone }),
      })
      const json = (await r.json()) as { ok?: true; error?: string }
      if (!r.ok || !json.ok) {
        toast.error(json.error ?? "Impossible d'enregistrer.")
        return
      }
      toast.success("Profil mis à jour.")
      router.refresh()
    })
  }

  return (
    <Card className="glass">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Profil</CardTitle>
        <CardDescription>Visible uniquement pour toi.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={initial.email} disabled readOnly />
            <p className="text-[10px] text-muted-foreground">Pour changer d&apos;email, écris-nous.</p>
          </div>
          <div className="space-y-1.5">
            <Label>Plan</Label>
            <Input value={initial.plan.toUpperCase()} disabled readOnly />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="display_name">Comment on t&apos;appelle ?</Label>
          <Input
            id="display_name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={60}
            placeholder="Prénom"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Langue</Label>
            <Select value={locale} onValueChange={(v) => setLocale((v as "fr" | "en") ?? "fr")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Fuseau horaire</Label>
            <Select value={timezone} onValueChange={(v) => setTimezone(v ?? "Europe/Paris")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMMON_TZ.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onSave} disabled={pending}>
            {pending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
