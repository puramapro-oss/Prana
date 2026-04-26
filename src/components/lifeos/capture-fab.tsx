"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { CaptureSheet } from "./capture-sheet"
import { cn } from "@/lib/utils"

interface CaptureFABProps {
  className?: string
}

/**
 * Floating action button — always visible inside (app)/lifeos and (app)/today.
 * Bottom-right, raised above mobile bottom tabs (which sit at bottom-0).
 */
export function CaptureFAB({ className }: CaptureFABProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Capturer une idée, une tâche, ou un nom"
        className={cn(
          "fixed right-5 z-40 flex size-14 items-center justify-center rounded-full",
          "bottom-24 md:bottom-8",
          "bg-primary text-primary-foreground shadow-lg shadow-primary/30",
          "transition-transform hover:scale-105 active:scale-95",
          "border border-primary/30 backdrop-blur-md",
          className,
        )}
      >
        <Plus className="size-6" strokeWidth={2.2} />
      </button>
      <CaptureSheet open={open} onOpenChange={setOpen} />
    </>
  )
}
