"use client"

import { useEffect, useRef, useState } from "react"
import { Mic, Square, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const MAX_RECORD_SECONDS = 60

interface CaptureRecorderProps {
  onAudio: (blob: Blob) => void
  /** When uploading is true, the parent is busy — disable controls. */
  uploading?: boolean
}

type RecorderState = "idle" | "asking" | "recording" | "denied" | "unsupported"

export function CaptureRecorder({ onAudio, uploading = false }: CaptureRecorderProps) {
  const [state, setState] = useState<RecorderState>("idle")
  const [seconds, setSeconds] = useState(0)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const tickRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (typeof MediaRecorder === "undefined") {
      setState("unsupported")
    }
    return () => {
      stopAll()
    }
  }, [])

  function stopAll() {
    if (tickRef.current) {
      window.clearInterval(tickRef.current)
      tickRef.current = null
    }
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      try {
        recorderRef.current.stop()
      } catch {
        /* ignore */
      }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }

  async function start() {
    if (state === "recording" || state === "asking") return
    setState("asking")
    setSeconds(0)
    chunksRef.current = []
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mime = pickMime()
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
      recorderRef.current = rec
      rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data)
      }
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mime ?? "audio/webm",
        })
        if (blob.size > 1024) {
          onAudio(blob)
        }
        chunksRef.current = []
        setState("idle")
        setSeconds(0)
      }
      rec.start(250)
      setState("recording")
      tickRef.current = window.setInterval(() => {
        setSeconds((s) => {
          const next = s + 1
          if (next >= MAX_RECORD_SECONDS) {
            stop()
          }
          return next
        })
      }, 1000)
    } catch (err) {
      console.error("[recorder] denied", err)
      setState("denied")
    }
  }

  function stop() {
    stopAll()
  }

  if (state === "unsupported") {
    return (
      <div className="rounded-xl border border-border/50 bg-muted/40 p-4 text-sm text-muted-foreground">
        Ton navigateur ne supporte pas l&apos;enregistrement audio. Utilise le mode texte.
      </div>
    )
  }

  if (state === "denied") {
    return (
      <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
        <p className="text-amber-200">Micro refusé. Autorise dans les réglages du navigateur, puis recharge.</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => setState("idle")}>
          Réessayer
        </Button>
      </div>
    )
  }

  const recording = state === "recording"
  const remaining = Math.max(0, MAX_RECORD_SECONDS - seconds)

  return (
    <div className="flex flex-col items-center justify-center gap-5 py-6">
      <button
        type="button"
        onClick={recording ? stop : start}
        disabled={state === "asking" || uploading}
        aria-label={recording ? "Arrêter l'enregistrement" : "Démarrer l'enregistrement"}
        className={cn(
          "relative flex size-24 items-center justify-center rounded-full border transition",
          recording
            ? "border-red-500/60 bg-red-500/15 text-red-200 shadow-lg shadow-red-500/20"
            : "border-primary/50 bg-primary/10 text-primary hover:bg-primary/20",
          (state === "asking" || uploading) && "opacity-60 cursor-not-allowed",
        )}
      >
        {state === "asking" || uploading ? (
          <Loader2 className="size-9 animate-spin" strokeWidth={1.6} />
        ) : recording ? (
          <Square className="size-8 fill-current" strokeWidth={0} />
        ) : (
          <Mic className="size-9" strokeWidth={1.6} />
        )}
        {recording ? (
          <span
            className="absolute inset-0 rounded-full border-2 border-red-500/70 motion-safe:animate-ping"
            aria-hidden
          />
        ) : null}
      </button>
      <div className="text-center">
        {recording ? (
          <>
            <p className="font-mono text-2xl tabular-nums">{formatSeconds(seconds)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {remaining > 5 ? `${remaining}s restantes` : `Coupure dans ${remaining}s`}
            </p>
          </>
        ) : uploading ? (
          <p className="text-sm text-muted-foreground">Transcription en cours…</p>
        ) : state === "asking" ? (
          <p className="text-sm text-muted-foreground">Autorise le micro…</p>
        ) : (
          <p className="text-sm text-muted-foreground">Appuie pour parler. 60s max.</p>
        )}
      </div>
    </div>
  )
}

function pickMime(): string | null {
  if (typeof MediaRecorder === "undefined") return null
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ]
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported(c)) return c
  }
  return null
}

function formatSeconds(s: number): string {
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, "0")}`
}
