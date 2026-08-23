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
        <li>Rythme cardiaque et séances de pleine conscience via HealthKit (Apple Watch) ou Health Connect
          (Wear OS), si tu utilises PRANA Watch — donnée de santé au sens de l&apos;art. 9 RGPD, cf §3
          ci-dessous.</li>
        <li>Données de paiement (gérées exclusivement par Stripe ; nous ne stockons jamais ton numéro de
          carte).</li>
      </ul>

      <h2>3. Données de santé — consentement renforcé (art. 9 RGPD)</h2>
      <p>
        Si tu utilises PRANA Watch (Apple Watch ou Wear OS), l&apos;application lit ton rythme cardiaque
        (HealthKit <code>heartRate</code> sur iOS, Health Connect équivalent sur Android) et tes séances de
        pleine conscience (<code>mindfulSession</code>) pour alimenter tes Pulse Checks et protocoles de
        régulation. Ces informations constituent des données concernant la santé au sens de l&apos;article 9
        du RGPD, catégorie particulière de données bénéficiant d&apos;une protection renforcée.
      </p>
      <p>
        Le traitement de ces données repose exclusivement sur ton consentement explicite (art. 9.2.a RGPD),
        recueilli via l&apos;autorisation HealthKit/Health Connect demandée par l&apos;OS au premier
        appairage de la montre. Ce consentement est révocable à tout moment (réglages HealthKit/Health
        Connect de ton téléphone, ou en supprimant ton compte depuis Réglages → Données).
      </p>
      <p>
        Ces données de santé ne sont jamais utilisées à des fins publicitaires, jamais cédées ni vendues à
        des tiers, et jamais partagées avec des annonceurs ou des courtiers de données. Elles ne servent
        qu&apos;à personnaliser tes protocoles de régulation et ton suivi de bien-être au sein de PRANA.
      </p>

      <h2>4. Finalités</h2>
      <p>
        Personnaliser tes protocoles de régulation, suivre tes scores, te proposer des actions adaptées à ton
        état, gérer ton abonnement.
      </p>

      <h2>5. Hébergement & sécurité</h2>
      <p>
        Données hébergées en Europe (Hostinger, France). Communications chiffrées (TLS). Politiques RLS
        Postgres : tu es la seule personne à pouvoir lire tes données privées.
      </p>

      <h2>6. Sous-traitants</h2>
      <ul>
        <li>Anthropic (Claude) — assistance IA, sans rétention longue.</li>
        <li>OpenAI (Whisper) — transcription audio.</li>
        <li>Stripe — paiements.</li>
        <li>Resend — emails transactionnels.</li>
        <li>Vercel — frontend.</li>
        <li>Sentry, PostHog — monitoring (anonymisé).</li>
      </ul>

      <h2>7. Tes droits</h2>
      <p>
        Tu peux à tout moment exporter toutes tes données au format JSON ou supprimer définitivement ton
        compte depuis Réglages → Données. Tu peux aussi nous écrire à matiss.frasne@gmail.com.
      </p>

      <h2>8. Conservation</h2>
      <p>
        Données conservées tant que ton compte est actif. À la suppression, toutes tes données privées sont
        effacées sous 30 jours, sauf obligations légales (factures : 10 ans).
      </p>

      <h2>9. Cookies</h2>
      <p>
        Nous utilisons des cookies strictement nécessaires (authentification, session), déposés sans consentement
        préalable, ainsi que des cookies de mesure d&apos;audience et de personnalisation déposés uniquement après
        ton consentement explicite, recueilli via le bandeau affiché à ta première visite. Tu peux modifier tes
        choix à tout moment en effaçant les données de navigation de ce site dans ton navigateur.
      </p>
    </div>
  )
}
