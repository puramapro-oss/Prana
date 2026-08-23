import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { Database } from "@/lib/supabase/types"

export type LegalAcceptanceRow = Pick<
  Database["prana"]["Tables"]["legal_acceptances"]["Row"],
  "doc_type" | "version" | "accepted_at"
>

const DOC_LABELS: Record<LegalAcceptanceRow["doc_type"], string> = {
  mentions: "Mentions légales",
  cgu: "Conditions générales d'utilisation",
  cgv: "Conditions générales de vente",
  confidentialite: "Politique de confidentialité",
}

export function LegalAcceptancesList({ acceptances }: { acceptances: LegalAcceptanceRow[] }) {
  return (
    <Card className="glass">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Mes acceptations légales</CardTitle>
        <CardDescription>
          Preuve horodatée des documents que tu as acceptés, conservée à ton nom.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {acceptances.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune acceptation enregistrée pour l&apos;instant.</p>
        ) : (
          <ul className="text-sm space-y-1.5">
            {acceptances.map((a) => (
              <li key={a.doc_type} className="text-muted-foreground">
                <span className="text-foreground">{DOC_LABELS[a.doc_type]}</span> — version {a.version} acceptée
                le {new Date(a.accepted_at).toLocaleString("fr-FR")}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
