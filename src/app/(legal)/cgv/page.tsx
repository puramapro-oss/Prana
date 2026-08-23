import { buildCGV } from "@/lib/legal/content/cgv"
import { PRANA_LEGAL_CONFIG } from "@/lib/legal/config"

export const metadata = { title: "Conditions Générales de Vente" }

const sections = buildCGV(PRANA_LEGAL_CONFIG)

export default function CGVPage() {
  return (
    <div className="space-y-4">
      <h1>Conditions Générales de Vente</h1>
      <p className="text-sm text-muted-foreground">Dernière mise à jour : août 2026.</p>

      {sections.map((section, i) => (
        <div key={section.titre}>
          <h2>
            {i + 1}. {section.titre}
          </h2>
          {section.paragraphes.map((p, j) => (
            <p key={j}>{p}</p>
          ))}
          {section.liste ? (
            <ul>
              {section.liste.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </div>
  )
}
