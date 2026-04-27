"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface NotifFormProps {
  initial: {
    push_enabled: boolean
    email_enabled: boolean
    sms_enabled: boolean
    daily_reminder_hour: number | null
  }
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 6) // 6..18

export function NotificationsForm({ initial }: NotifFormProps) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [push, setPush] = useState(initial.push_enabled)
  const [email, setEmail] = useState(initial.email_enabled)
  const [sms, setSms] = useState(initial.sms_enabled)
  const [hour, setHour] = useState<string>(
    initial.daily_reminder_hour === null ? "off" : String(initial.daily_reminder_hour),
  )

  async function save() {
    start(async () => {
      const r = await fetch("/api/settings/notifications", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          push_enabled: push,
          email_enabled: email,
          sms_enabled: sms,
          daily_reminder_hour: hour === "off" ? null : Number(hour),
        }),
      })
      const json = (await r.json()) as { ok?: true; error?: string }
      if (!r.ok || !json.ok) {
        toast.error(json.error ?? "Impossible d'enregistrer.")
        return
      }
      toast.success("Préférences mises à jour.")
      router.refresh()
    })
  }

  return (
    <Card className="glass">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Notifications</CardTitle>
        <CardDescription>
          Tu décides. On ne te dérange jamais entre 22h et 8h. Aucune notif marketing automatique.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Toggle label="Push (mobile + navigateur)" checked={push} onChange={setPush} />
        <Toggle label="Email" checked={email} onChange={setEmail} />
        <Toggle label="SMS (urgences uniquement)" checked={sms} onChange={setSms} />

        <div className="border-t border-border/40 pt-4 space-y-2">
          <Label>Rappel quotidien doux</Label>
          <Select value={hour} onValueChange={(v) => setHour(v ?? "off")}>
            <SelectTrigger className="max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="off">Désactivé</SelectItem>
              {HOURS.map((h) => (
                <SelectItem key={h} value={String(h)}>
                  À {h}h{h < 10 ? "" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end">
          <Button onClick={save} disabled={pending}>
            {pending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <Label className="text-sm font-normal">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
