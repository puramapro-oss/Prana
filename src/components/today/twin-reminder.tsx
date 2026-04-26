"use client"

import { Brain } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

interface TwinReminderProps {
  /** Pretty insight string. If null, the card hides itself. */
  insight: string | null
}

/**
 * Affiché 1×/jour quand le Twin a appris quelque chose à dire.
 * Sans Twin actif → le composant retourne null pour ne pas créer de bruit.
 */
export function TwinReminder({ insight }: TwinReminderProps) {
  if (!insight) return null
  return (
    <Card className="glass border-violet-500/20">
      <CardContent className="p-5 flex items-start gap-4">
        <div className="size-9 rounded-full bg-violet-500/15 flex items-center justify-center shrink-0">
          <Brain className="size-4 text-violet-500" strokeWidth={1.7} />
        </div>
        <div className="space-y-2 flex-1 min-w-0">
          <div className="text-[11px] uppercase tracking-wider text-violet-500">Ton Twin</div>
          <p className="text-sm text-foreground/85 leading-relaxed">{insight}</p>
          <Link
            href="/twin"
            className="inline-flex text-xs text-violet-500 hover:text-violet-400 transition-colors"
          >
            Voir mon profil →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
