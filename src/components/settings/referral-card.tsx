"use client"

import { useState } from "react"
import { Copy, Share2, Check, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ReferralCardProps {
  initial: {
    referralCode: string | null
    referralUrl: string | null
    totalPending: number
    totalConverted: number
    pointsEarned: number
    recent: { id: string; status: "pending" | "converted" | "rewarded"; created_at: string }[]
  }
}

export function ReferralCard({ initial }: ReferralCardProps) {
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    if (!initial.referralUrl) return
    try {
      await navigator.clipboard.writeText(initial.referralUrl)
      setCopied(true)
      toast.success("Lien copié.")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Impossible de copier. Sélectionne le lien manuellement.")
    }
  }

  async function nativeShare() {
    if (!initial.referralUrl) return
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: "PURAMA ONE",
          text: "Un OS humain qui te calme, t'organise, et exécute pour toi.",
          url: initial.referralUrl,
        })
      } catch {
        // user cancelled
      }
    } else {
      void copyLink()
    }
  }

  return (
    <div className="space-y-4">
      <Card className="glass border-primary/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Sparkles className="size-4 text-primary" strokeWidth={1.6} />
            Ton lien de parrainage
          </CardTitle>
          <CardDescription>
            Quand un·e ami·e s&apos;inscrit avec ton lien et passe payant·e : tu gagnes 500 points · iel reçoit 30 jours Pro offerts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {initial.referralUrl ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <Input value={initial.referralUrl} readOnly className="font-mono text-xs" />
              <div className="flex gap-2">
                <Button onClick={copyLink} variant="outline" size="sm">
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  {copied ? "Copié" : "Copier"}
                </Button>
                <Button onClick={nativeShare} size="sm">
                  <Share2 className="size-4" />
                  Partager
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Ton code arrive dans un instant. Recharge la page si rien n&apos;apparaît.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="En attente" value={initial.totalPending} />
        <Stat label="Convertis" value={initial.totalConverted} accent />
        <Stat label="Points gagnés" value={initial.pointsEarned} accent />
      </div>

      <Card className="glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Historique récent</CardTitle>
          <CardDescription>
            On affiche uniquement les statuts. Aucun nom, aucun email — RGPD by design.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {initial.recent.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              Personne n&apos;a encore utilisé ton lien. Quand ce sera le cas, tu verras les statuts apparaître ici.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {initial.recent.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between text-xs py-1.5 border-b border-border/30 last:border-b-0"
                >
                  <span className="text-muted-foreground">
                    {format(parseISO(r.created_at), "d MMM yyyy", { locale: fr })}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                      r.status === "pending" && "bg-muted text-muted-foreground",
                      r.status === "converted" && "bg-primary/15 text-primary",
                      r.status === "rewarded" && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
                    )}
                  >
                    {r.status === "pending"
                      ? "en attente"
                      : r.status === "converted"
                        ? "converti·e"
                        : "récompensé·e"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Stat({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl glass border p-4 text-center",
        accent ? "border-primary/30" : "border-border/40",
      )}
    >
      <p className={cn("text-2xl font-heading font-medium tabular-nums", accent && "text-primary")}>
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
        {label}
      </p>
    </div>
  )
}
