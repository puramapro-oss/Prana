"use client"

import { useState } from "react"
import { Activity } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { PulseCheckSlider } from "./pulse-check-slider"
import { useLastPulseCheck } from "@/hooks/use-pulse-check"

interface PulseCheckCompactProps {
  /** Compact label override. Default shows last stress / energy. */
  className?: string
}

export function PulseCheckCompact({ className }: PulseCheckCompactProps) {
  const [open, setOpen] = useState(false)
  const { last, isLoading } = useLastPulseCheck()

  const lastTime = last?.created_at
    ? new Date(last.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    : null

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        nativeButton={true}
        className={`group flex items-center gap-2.5 rounded-full border border-border/50 bg-card/60 px-3 py-1.5 text-xs hover:border-primary/40 hover:bg-card transition-colors ${className ?? ""}`}
        aria-label="Faire un Pulse Check"
      >
        <span className="size-2 rounded-full bg-primary animate-pulse" aria-hidden />
        {isLoading ? (
          <span className="text-muted-foreground">Pulse…</span>
        ) : last ? (
          <>
            <span className="text-muted-foreground">
              S<span className="text-foreground/80 font-mono">{last.stress}</span>
              <span className="mx-1 opacity-40">·</span>
              E<span className="text-foreground/80 font-mono">{last.energy}</span>
            </span>
            {lastTime ? <span className="text-muted-foreground/60">{lastTime}</span> : null}
          </>
        ) : (
          <span className="text-muted-foreground">Pulse Check</span>
        )}
        <Activity className="size-3.5 text-primary opacity-70 group-hover:opacity-100" strokeWidth={1.8} />
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto">
        <SheetHeader className="text-left pb-2">
          <SheetTitle className="font-heading text-2xl">Pulse Check</SheetTitle>
          <SheetDescription>Trois curseurs. Vingt secondes.</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-8 sm:px-6">
          <PulseCheckSlider
            variant="inline"
            showNotes={false}
            ctaLabel="Enregistrer & continuer"
            defaults={
              last
                ? {
                    stress: last.stress,
                    energy: last.energy,
                    time_available: last.time_available,
                    context: last.context,
                  }
                : undefined
            }
            onCompleted={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
