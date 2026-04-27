import { Sparkles, Wallet } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"

interface PointsCardProps {
  balance: number
  totalEarned: number
  totalRedeemed: number
}

export function PointsCard({ balance, totalEarned, totalRedeemed }: PointsCardProps) {
  return (
    <Card className="glass border-primary/30">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Sparkles className="size-4 text-primary" strokeWidth={1.6} />
              Tes points
            </CardTitle>
            <CardDescription className="text-xs">
              Phase 1 : tu accumules. Phase 2 (Treezor) : 100 pts = 1 € en SEPA instant.
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-3xl font-heading font-medium tabular-nums">{balance}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">points</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 pt-0">
        <div className="rounded-lg bg-muted/40 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total gagné</p>
          <p className="text-sm font-medium tabular-nums">{totalEarned}</p>
        </div>
        <div className="rounded-lg bg-muted/40 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total utilisé</p>
          <p className="text-sm font-medium tabular-nums">{totalRedeemed}</p>
        </div>
      </CardContent>
      <CardContent className="pt-0">
        <div className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed bg-muted/30 rounded-lg p-3">
          <Wallet className="size-3.5 mt-0.5 shrink-0" strokeWidth={1.6} />
          <p>
            Le cash arrive en Phase 2, dès que Treezor (EME ACPR) est activé. Pour l&apos;instant, tu construis ton solde.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
