"use client"

import { Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MagicButtonConfig } from "@/lib/agent/magic-buttons-config"

interface MagicButtonProps {
  button: MagicButtonConfig
  locked: boolean
  onClick: () => void
}

export function MagicButton({ button, locked, onClick }: MagicButtonProps) {
  const Icon = button.icon

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative isolate flex flex-col items-start gap-3 rounded-2xl p-4 sm:p-5 text-left transition-all",
        "border border-border/40 bg-card/50 backdrop-blur-md",
        "hover:border-primary/40 hover:bg-card/80 hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "active:translate-y-0",
        locked && "opacity-75",
      )}
      aria-label={`${button.name} — ${button.durationLabel}${locked ? " (verrouillé)" : ""}`}
    >
      {/* gradient accent */}
      <div
        className={cn(
          "absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br opacity-50 group-hover:opacity-80 transition-opacity",
          button.accent,
        )}
        aria-hidden
      />

      <div className="flex w-full items-start justify-between gap-2">
        <div
          className={cn(
            "size-10 rounded-xl flex items-center justify-center bg-background/60 backdrop-blur-sm border border-border/30",
          )}
        >
          <Icon className="size-5 text-foreground/85" strokeWidth={1.7} />
        </div>
        {locked ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-card/70 border border-border/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <Lock className="size-3" strokeWidth={1.8} />
            {button.plan}
          </span>
        ) : (
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/80">
            {button.durationLabel}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="font-heading text-base sm:text-lg leading-tight">{button.name}</h3>
        <p className="text-xs text-muted-foreground/90 leading-relaxed line-clamp-2">
          {button.description}
        </p>
      </div>
    </button>
  )
}
