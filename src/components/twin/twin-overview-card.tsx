interface OverviewCardProps {
  icon: React.ReactNode
  title: string
  items: (string | null)[]
  empty: string
}

export function OverviewCard({ icon, title, items, empty }: OverviewCardProps) {
  const filtered = items.filter((x): x is string => Boolean(x))
  return (
    <div className="rounded-xl border border-border/50 bg-card/60 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <span className="text-primary">{icon}</span>
        <span>{title}</span>
      </div>
      {filtered.length > 0 ? (
        <ul className="mt-3 space-y-1.5 text-sm">
          {filtered.map((it, i) => (
            <li key={i} className="leading-snug">
              {it}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground italic">{empty}</p>
      )}
    </div>
  )
}
