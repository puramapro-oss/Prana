import { cn } from "@/lib/utils"

interface TwinRebuildSummaryProps {
  summary: string
  confidence: "low" | "medium" | "high"
}

export function TwinRebuildSummary({ summary, confidence }: TwinRebuildSummaryProps) {
  return (
    <div className="rounded-xl border border-primary/30 bg-primary/[0.05] p-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs uppercase tracking-wider text-primary/80">
          Synthèse opus-4-7
        </span>
        <span
          className={cn(
            "text-[10px] uppercase tracking-wider rounded-md border px-1.5 py-0.5",
            confidence === "high" && "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
            confidence === "medium" && "border-amber-500/40 bg-amber-500/10 text-amber-200",
            confidence === "low" && "border-border/50 bg-muted/40 text-muted-foreground",
          )}
        >
          Confiance {confidence}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-foreground/90">{summary}</p>
    </div>
  )
}
