"use client"

import LegalReacceptanceGate from "@/lib/legal/components/LegalReacceptanceGate"
import type { LegalDocType } from "@/lib/legal/types"
import { APP_BRAND } from "@/lib/constants"

interface LegalReacceptanceGateMountProps {
  /** Documents dont l'utilisateur a accepté une version strictement antérieure — calculé
   * côté serveur dans `(app)/layout.tsx` via `computeDocsEnAttente`. */
  docsEnAttente: LegalDocType[]
}

/**
 * Wrapper client de `LegalReacceptanceGate` (socle légal) — branche `onAccept` sur
 * `POST /api/legal/accept` (même endpoint que `LegalAcceptanceNotice` au signup).
 * Rendu inconditionnellement dans `(app)/layout.tsx` : le composant se rend lui-même
 * `null` tant que `docsEnAttente` est vide (versions déjà à jour, cas normal).
 */
export function LegalReacceptanceGateMount({ docsEnAttente }: LegalReacceptanceGateMountProps) {
  if (docsEnAttente.length === 0) return null

  return (
    <LegalReacceptanceGate
      appName={APP_BRAND}
      docsEnAttente={docsEnAttente}
      onAccept={async (docType) => {
        const res = await fetch("/api/legal/accept", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ docType }),
        })
        if (!res.ok) throw new Error("Échec de l'enregistrement de l'acceptation.")
      }}
    />
  )
}
