"use client"

import { useState } from "react"
import { Mic, Pencil, Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { CaptureRecorder } from "./capture-recorder"
import { useCreateCapture } from "@/hooks/use-lifeos"

interface CaptureSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialMode?: "text" | "voice"
}

export function CaptureSheet({
  open,
  onOpenChange,
  initialMode = "voice",
}: CaptureSheetProps) {
  const [text, setText] = useState("")
  const [mode, setMode] = useState<"text" | "voice">(initialMode)
  const create = useCreateCapture()

  async function submitText() {
    const trimmed = text.trim()
    if (trimmed.length < 2) {
      toast.error("Écris au moins 2 caractères.")
      return
    }
    try {
      await create.mutateAsync({ raw_text: trimmed, source: "text" })
      toast.success("Capture enregistrée. Je la trie pour toi.")
      setText("")
      onOpenChange(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur d'enregistrement.")
    }
  }

  async function submitAudio(blob: Blob) {
    try {
      const fd = new FormData()
      fd.append("audio", blob, "capture.webm")
      await create.mutateAsync(fd)
      toast.success("Vocal capté. Transcription + tri en cours.")
      onOpenChange(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur de transcription.")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[92vh] overflow-y-auto rounded-t-2xl"
      >
        <SheetHeader className="text-left pb-2">
          <SheetTitle className="font-heading text-2xl">Capture rapide</SheetTitle>
          <SheetDescription>
            Vide-toi la tête. Je trie en arrière-plan.
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-8 sm:px-6">
          <Tabs
            value={mode}
            onValueChange={(v) => setMode(v as "text" | "voice")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="voice" className="gap-2">
                <Mic className="size-4" /> Voix
              </TabsTrigger>
              <TabsTrigger value="text" className="gap-2">
                <Pencil className="size-4" /> Texte
              </TabsTrigger>
            </TabsList>

            <TabsContent value="voice" className="mt-4">
              <CaptureRecorder
                onAudio={submitAudio}
                uploading={create.isPending}
              />
              <p className="mt-4 text-center text-xs text-muted-foreground">
                Whisper transcrit en français · ton enregistrement n&apos;est pas conservé.
              </p>
            </TabsContent>

            <TabsContent value="text" className="mt-4 space-y-4">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Une idée, une tâche, un nom à recontacter… ce que tu veux."
                rows={6}
                maxLength={4000}
                disabled={create.isPending}
                className="resize-none"
              />
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">
                  {text.length}/4000
                </span>
                <Button
                  type="button"
                  onClick={submitText}
                  disabled={create.isPending || text.trim().length < 2}
                  className="min-w-32"
                >
                  {create.isPending ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Enregistrement…
                    </>
                  ) : (
                    "Capturer"
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
