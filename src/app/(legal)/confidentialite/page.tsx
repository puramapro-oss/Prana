export const metadata = { title: "Politique de confidentialité" }

export default function ConfidentialitePage() {
  return (
    <div className="space-y-4">
      <h1>Politique de confidentialité</h1>
      <p className="text-sm text-muted-foreground">Dernière mise à jour : avril 2026.</p>

      <h2>1. Responsable du traitement</h2>
      <p>
        SASU PURAMA, 8 Rue de la Chapelle, 25560 Frasne. Délégué à la protection des données : Matiss DORNIER
        (matiss.frasne@gmail.com).
      </p>

      <h2>2. Données collectées</h2>
      <ul>
        <li>Email, nom d&apos;affichage, locale, fuseau horaire.</li>
        <li>Pulse Checks (stress, énergie, contexte) — données auto-déclarées.</li>
        <li>Captures (texte, vocal, image) que tu choisis d&apos;enregistrer.</li>
        <li>Profil Twin (préférences, habitudes) — généré par toi-même.</li>
        <li>Données de paiement (gérées exclusivement par Stripe ; nous ne stockons jamais ton numéro de
          carte).</li>
      </ul>

      <h2>3. Finalités</h2>
      <p>
        Personnaliser tes protocoles de régulation, suivre tes scores, te proposer des actions adaptées à ton
        état, gérer ton abonnement.
      </p>

      <h2>4. Hébergement & sécurité</h2>
      <p>
        Données hébergées en Europe (Hostinger, France). Communications chiffrées (TLS). Politiques RLS
        Postgres : tu es la seule personne à pouvoir lire tes données privées.
      </p>

      <h2>5. Sous-traitants</h2>
      <ul>
        <li>Anthropic (Claude) — assistance IA, sans rétention longue.</li>
        <li>OpenAI (Whisper) — transcription audio.</li>
        <li>Stripe — paiements.</li>
        <li>Resend — emails transactionnels.</li>
        <li>Vercel — frontend.</li>
        <li>Sentry, PostHog — monitoring (anonymisé).</li>
      </ul>

      <h2>6. Tes droits</h2>
      <p>
        Tu peux à tout moment exporter toutes tes données au format JSON ou supprimer définitivement ton
        compte depuis Réglages → Données. Tu peux aussi nous écrire à matiss.frasne@gmail.com.
      </p>

      <h2>7. Conservation</h2>
      <p>
        Données conservées tant que ton compte est actif. À la suppression, toutes tes données privées sont
        effacées sous 30 jours, sauf obligations légales (factures : 10 ans).
      </p>
    </div>
  )
}
