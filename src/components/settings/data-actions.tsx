"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Download, Trash2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

export function DataActions() {
  const [confirm, setConfirm] = useState("")
  const [pendingDel, startDel] = useTransition()

  async function exportData() {
    const r = await fetch("/api/settings/data/export")
    if (!r.ok) {
      toast.error("Export impossible. Réessaie dans un instant.")
      return
    }
    const blob = await r.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `prana-export-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    toast.success("Export téléchargé.")
  }

  async function deleteAccount() {
    startDel(async () => {
      const r = await fetch("/api/settings/data/delete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirm: "SUPPRIMER" }),
      })
      const json = (await r.json()) as { ok?: true; error?: string }
      if (!r.ok || !json.ok) {
        toast.error(json.error ?? "Suppression impossible.")
        return
      }
      toast.success("Compte supprimé. Bonne suite.")
      window.location.href = "/"
    })
  }

  return (
    <div className="space-y-4">
      <Card className="glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Export RGPD</CardTitle>
          <CardDescription>
            Récupère toutes tes données en un fichier JSON. C&apos;est ton droit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={exportData} variant="outline">
            <Download className="size-4" />
            Télécharger mon export
          </Button>
        </CardContent>
      </Card>

      <Card className="glass border-destructive/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <AlertTriangle className="size-4 text-destructive" strokeWidth={1.6} />
            Supprimer mon compte
          </CardTitle>
          <CardDescription>
            Toutes tes données seront effacées définitivement. Action irréversible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger
              render={
                <Button variant="destructive">
                  <Trash2 className="size-4" />
                  Supprimer mon compte
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmer la suppression</DialogTitle>
                <DialogDescription>
                  Cette action efface ton profil, tes pulses, tes captures, ton Twin, ton score et tes points.
                  Tape <span className="font-semibold">SUPPRIMER</span> pour confirmer.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="confirm-delete">Confirmation</Label>
                <Input
                  id="confirm-delete"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="SUPPRIMER"
                />
              </div>
              <DialogFooter>
                <Button
                  variant="destructive"
                  disabled={confirm !== "SUPPRIMER" || pendingDel}
                  onClick={deleteAccount}
                >
                  {pendingDel ? "Suppression…" : "Supprimer définitivement"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}
