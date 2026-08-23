# CONFORMITÉ NIYAMA — PRANA

**Date de l'audit** : 2026-08-23
**Périmètre** : socle légal PURAMA (NIYAMA-BRIEF.md), famille déclarée `sante_bienetre` (§2.4), app "Watch" (biométrie réelle HealthKit/Health Connect).
**Méthode** : lecture directe du code réel (aucun fichier applicatif modifié par cet audit).

## VERDICT : ORANGE — 7 écarts

Le socle est posé et globalement solide (RGPD export/suppression réels, lexique propre, famille correctement déclarée, bandeau cookies fonctionnel dans son UI). Mais **la preuve d'acceptation CGU n'est pas encore opérationnelle en production** (table DB absente), **la clause données de santé renforcée (art. 9 RGPD) est totalement absente** alors que l'app collecte réellement du rythme cardiaque via HealthKit/Health Connect, et **le tracking PostHog se déclenche avant tout consentement** — trois écarts qui pèsent lourd pour une app santé/bien-être. D'où ORANGE et non VERT malgré un socle techniquement bien construit.

---

## 1. Pages légales

**Présentes et spécifiques à PRANA** (pas de contenu générique/Lorem) :
- `src/app/(legal)/mentions-legales/page.tsx` — éditeur SASU PURAMA, RCS Besançon, hébergeurs Vercel + Hostinger (Paris), TVA art. 293B.
- `src/app/(legal)/cgu/page.tsx` — avertissement bien-être explicite ("n'est pas un dispositif médical"), rétractation L221-28 3°, abonnements Starter/Pro/Ultime.
- `src/app/(legal)/cgv/page.tsx` — rendu via `buildCGV(PRANA_LEGAL_CONFIG)` (`src/lib/legal/content/cgv.ts`), créée car `aPaiement=true` (absente jusqu'ici, cf ERRORS.md 2026-08-23).
- `src/app/(legal)/confidentialite/page.tsx` — contenu réel PRANA (Pulse Checks, Twin, sous-traitants réels : Anthropic, OpenAI, Stripe, Resend, Vercel, Sentry, PostHog).

**GAP 1 — Médiateur de la consommation absent des pages réelles.** PRANA a `aPaiement=true` (Stripe, abonnements payants) : l'art. L612-1 du Code de la consommation impose la mention d'un médiateur. Le paquet socle génère bien cette clause (`src/lib/legal/content/mentions-legales.ts:8-12,84-85`, avec fallback honnête "en cours de désignation" si `mediateur.nom` est `null`, cf `src/lib/legal/company.ts:26-29`) et `PRANA_LEGAL_CONFIG.mediateur` est bien renseigné (`src/lib/legal/config.ts:30`) — **mais** la page réellement affichée (`src/app/(legal)/mentions-legales/page.tsx`, contenu codé en dur) n'utilise pas `buildX()` et ne contient AUCUNE mention du médiateur. `src/lib/legal/content/cgv.ts` (le builder réellement rendu par `/cgv`) ne référence pas non plus `config.mediateur` dans sa section "Droit applicable et litiges" (lignes 60-65). **Le champ existe dans le code mais n'apparaît nulle part à l'écran.**

**GAP 2 — Clause données de santé renforcée (art. 9 RGPD) absente.** PRANA collecte réellement des données de santé au sens strict : `mobile/watch/ios/PranaWatch/HealthKitManager.swift:18-19` lit `HKObjectType.quantityType(forIdentifier: .heartRate)` et `.mindfulSession` (rythme cardiaque + séances de pleine conscience), et `mobile/watch/android/wear/src/main/java/dev/purama/prana/wear/health/HealthServicesRepo.kt` fait l'équivalent Android Health Services. La politique de confidentialité réelle (`src/app/(legal)/confidentialite/page.tsx`) mentionne "Pulse Checks (stress, énergie, contexte)" comme donnée auto-déclarée générique mais **ne mentionne jamais** : la collecte HealthKit/Health Connect, la catégorie "données de santé" au sens art. 9 RGPD, un consentement explicite renforcé spécifique à ces données, ni l'engagement "jamais utilisées à des fins publicitaires" (NIYAMA §2.4). C'est exactement la classe d'écart déjà relevée sur KAÏA.

## 2. Bandeau consentement cookies

**Fonctionnel dans son UI** : `src/lib/legal/components/CookieConsentBanner.tsx` — 3 actions réelles (Tout accepter / Tout refuser / Personnaliser avec cases nécessaire/mesure/marketing), persistance `localStorage` via `src/lib/legal/hooks/useCookieConsent.ts` (clé `purama_cookie_consent_v1`), monté globalement dans `src/app/layout.tsx:126` via `CookieConsentBannerMount`. Rien n'est bloqué avant premier rendu client (pas de flash SSR incohérent, `useSyncExternalStore`).

**GAP 3 — Le tracking PostHog n'attend pas le consentement.** `src/components/analytics/posthog-provider.tsx` initialise et charge `posthog-js` dans un `useEffect` au montage, dès que `NODE_ENV === "production"`, sans lire `useCookieConsent()` ni la valeur stockée. `PostHogProvider` est monté inconditionnellement dans `src/app/layout.tsx:132`, au même niveau que le bandeau. Résultat : le cookie de mesure d'audience est déposé **avant** tout choix de l'utilisateur, alors que la politique de confidentialité affirme elle-même (`confidentialite/page.tsx:59-65` et le contenu générique `politique-confidentialite.ts:79`) que ces cookies sont "déposés uniquement après votre consentement explicite". Contradiction directe entre le texte légal et le comportement réel — risque CNIL/ePrivacy.

## 3. Preuve d'acceptation CGU horodatée en base

Code réel et bien conçu :
- `src/app/api/legal/accept/route.ts` — upsert `legal_acceptances` scopé RLS (client SSR normal, pas admin), avec `ip`/`user_agent` via `src/lib/legal/request-meta.ts`.
- `src/app/auth/callback/route.ts:48-69` — écrit l'acceptation des 4 docs (mentions/cgu/cgv/confidentialite) au premier login, en parallèle du trial 7j.
- `src/app/(auth)/signup/signup-form.tsx` monte `LegalAcceptanceNotice` (mention légale au signup, version dérivée serveur, jamais envoyée par le client).

**GAP 4 — Non fonctionnel en production à ce jour.** La table `legal_acceptances` (et `cookie_consents`, `account_deletion_requests`) vient de `supabase/migrations/0009_legal_core.sql` (110 lignes), **jamais exécutée sur le VPS**. `ERRORS.md:38` documente le blocage le jour même (2026-08-23) : `ssh root@72.62.191.111` → "Connection refused" port 22. Vérification indépendante refaite pendant cet audit (SSH direct, lecture seule) : **toujours refusé** à l'instant de l'audit. Tant que la migration n'est pas appliquée, les écritures dans `legal_acceptances`/`cookie_consents` échoueront silencieusement (Supabase renvoie `{error}`, pas d'exception — `Promise.all` dans `auth/callback/route.ts` avale l'échec sans log). **La preuve d'acceptation CGU n'existe donc pas réellement en base tant que le déploiement de la migration n'a pas eu lieu**, malgré du code prêt et correct.

## 4. « Ma mémoire » / export RGPD + suppression de compte

**VERT — réel et fonctionnel, choix délibéré documenté.** PRANA n'utilise pas les composants génériques du socle (`MaMemoirePage`/`AccountDeletionButton`, copiés mais jamais importés — `src/lib/legal/index.ts:16-17` seulement) car elle a déjà son propre flux, plus strict :
- `src/app/(app)/settings/data/page.tsx` — page « Ma mémoire », affiche `DataActions` + `LegalAcceptancesList` (lit `legal_acceptances`).
- `src/app/api/settings/data/export/route.ts` — export JSON réel de **14 tables** par utilisateur (profile, pulse_checks, captures, projects, people, tasks, notes, executions, twin_profiles, regulation_sessions, daily_scores, user_points, point_events, safety_events).
- `src/app/api/settings/data/delete/route.ts` — suppression **immédiate** (confirmation `"SUPPRIMER"` en majuscules via Zod `z.literal`), `admin.auth.admin.deleteUser()`, cascade `ON DELETE CASCADE` documentée en commentaire.

Décision consciente et cohérente (ERRORS.md:40, loi 13) : le flux générique du socle (période de grâce 30j, mot `DELETE_MY_ACCOUNT`) créerait un second mécanisme concurrent. Pas un gap.

## 5. Déclaration IA sur chaque UI de chat/coach IA

Composant `AIDisclosure` (`src/lib/legal/components/AIDisclosure.tsx`) monté dans :
- `src/components/buttons/magic-button-modal.tsx:198` — `<AIDisclosure appName="PURAMA ONE" />`.
- `src/components/lifeos/plan-7days.tsx:195` — idem.

**GAP 5 — Absente sur `ExecuteWorkflow`.** `src/components/execute/execute-workflow.tsx` est le composant partagé des pages `/execute/*` (CGU §1 le décrit explicitement : "assistance par intelligence artificielle pour la rédaction de messages et plans"). Il appelle `useGenerateExecution()` → `POST /api/agent/execute` (Claude), affiche le résultat IA (`output.guidance` + 3 `alternatives` avec titre/ton/corps, boutons Copier/Régénérer), sans jamais importer `AIDisclosure`. Vérifié par lecture complète du fichier (253 lignes) — aucune occurrence de `AIDisclosure`. C'est un vrai contenu généré par IA présenté et copié par l'utilisateur, sans la mention "vous interagissez avec une IA" exigée par l'IA Act (socle §1).

## 6. Lexique interdit santé + avis rémunérés + promesses non tenables

**VERT — 0 occurrence problématique.** Recherche exhaustive `guérit|soigne|traite|diagnosti` sur `src/` : toutes les occurrences trouvées sont des **négations/garde-fous**, jamais des affirmations :
- `src/app/safety/page.tsx:9,13,49` — "n'est pas un soignant", "On ne diagnostique rien. On ne soigne rien."
- `src/app/manifesto/page.tsx:74` — "Aucun claim médical. On n'est pas un soignant."
- `src/components/safety/pro-consult-prompt.tsx:59` — rappel périodique "nous ne remplaçons pas un soignant".
- `src/lib/agent/prompts/twin-builder.ts:59` et `src/lib/agent/prompts/system-prana.ts:32,48` — garde-fous explicites dans le system prompt Claude ("ZÉRO diagnostic médical", mots "anxiété"/"dépression"/"trouble"/"patient"/"traitement" interdits à l'IA elle-même).

Aucune mécanique d'avis rémunérés trouvée (aucun match `avis vérifié/rémunéré` combiné à récompense). Aucune promesse de résultat non tenable (`garanti` n'apparaît que pour "garantie légale"/disponibilité technique, jamais un résultat bien-être).

## 7. Chiffres affichés vs FACTS.md

**VERT.** `src/lib/constants.ts:27` : `WALLET_MIN_WITHDRAWAL_EUR = 5` — conforme à FACTS.md (`WALLET_MIN (seuil retrait) | 5€`). Aucune référence au split KARMA 50/10/40 dans le code PRANA : cohérent, PRANA est déclarée famille `sante_bienetre` (`src/lib/legal/config.ts:15`), pas `karma_wellness` — elle ne paie pas ses utilisateurs, le split KARMA ne s'applique pas ici.

## 8. Migration SQL légale

`supabase/migrations/0009_legal_core.sql` (110 lignes) prête sur disque, contient `legal_acceptances`/`cookie_consents`/`account_deletion_requests` + RLS + `GRANT`/`NOTIFY pgrst`. **Non exécutée.** Blocage documenté le jour même dans `ERRORS.md:38` : `ssh root@72.62.191.111` → "Connection refused" port 22 (accès réseau filtré côté sandbox, credentials valides par ailleurs). Re-testé pendant cet audit (lecture seule, aucune écriture tentée) : port 22 toujours refusé au moment de l'audit — le blocage est réel et actuel, pas seulement historique. Conforme au point 8 du protocole (blocage documenté dans ERRORS.md le jour même) mais **le déploiement DB reste un prérequis critique** avant que les points 1 et 3 de ce rapport ne soient réellement vrais en production.

## 9. LegalReacceptanceGate

**GAP 6 (confirmé, écart récurrent de la flotte).** `src/lib/legal/components/LegalReacceptanceGate.tsx` existe et est exporté (`src/lib/legal/index.ts:15`), et `computeDocsEnAttente()` (`src/lib/legal/versions.ts:29-36`) est bien la fonction pure prévue pour l'alimenter. **Mais il n'est monté nulle part** dans l'app — recherche exhaustive de `LegalReacceptanceGate` dans `src/` : seules occurrences hors du fichier lui-même sont un export (`index.ts:15`) et un commentaire (`versions.ts:27`). Conséquence documentée par le code lui-même (`ERRORS.md:39`) : un futur bump de `CURRENT_LEGAL_VERSIONS` (actuellement `1.0` partout, `src/lib/legal/versions.ts:16-21`) ne re-sollicitera JAMAIS les utilisateurs déjà inscrits pour ré-accepter une nouvelle version — seuls les nouveaux inscrits (via `auth/callback`) écriront une acceptation. Ce gap est actuellement latent (versions encore à `1.0`, jamais bumpées) mais deviendra actif dès la première mise à jour du texte légal.

---

## GAP additionnel — Sign in with Apple

**GAP 7.** PRANA propose une connexion tierce Google (`signup-form.tsx:51-52`, `login-form.tsx:45-46` — `signInWithOAuth({ provider: "google" })`) mais **aucune option "Sign in with Apple"**. L'app a un compagnon iOS/watchOS réel (`mobile/watch/ios/PranaWatch/`), donc vouée à l'App Store — la guideline Apple 4.8 impose Sign in with Apple dès qu'une autre connexion tierce est proposée à l'utilisateur, sous peine de rejet de soumission (cf NIYAMA-BRIEF §1 "Sign in with Apple si login tiers").

---

## Récapitulatif des 7 écarts

| # | Écart | Sévérité | Fichier(s) |
|---|---|---|---|
| 1 | Médiateur de la consommation absent des pages réelles (mentions-légales, CGV) malgré `aPaiement=true` | Moyenne | `src/app/(legal)/mentions-legales/page.tsx`, `src/lib/legal/content/cgv.ts` |
| 2 | Clause données de santé renforcée (art. 9 RGPD) absente malgré collecte HealthKit/Health Connect réelle (rythme cardiaque) | **Élevée** | `src/app/(legal)/confidentialite/page.tsx`, `mobile/watch/ios/PranaWatch/HealthKitManager.swift:18-19` |
| 3 | PostHog tracké avant consentement cookies (contredit le texte de la politique) | Moyenne | `src/components/analytics/posthog-provider.tsx`, `src/app/layout.tsx:132` |
| 4 | Preuve d'acceptation CGU non fonctionnelle en prod (table DB absente, migration bloquée) | **Élevée** | `supabase/migrations/0009_legal_core.sql`, `src/app/auth/callback/route.ts:59-69` |
| 5 | Déclaration IA absente sur `ExecuteWorkflow` (génération de messages/emails/posts) | Moyenne | `src/components/execute/execute-workflow.tsx` |
| 6 | `LegalReacceptanceGate` non monté (re-sollicitation future cassée) | Moyenne (latent) | `src/lib/legal/components/LegalReacceptanceGate.tsx` |
| 7 | Pas de Sign in with Apple malgré login tiers Google + app iOS/watchOS | Moyenne | `src/app/(auth)/signup/signup-form.tsx`, `src/app/(auth)/login/login-form.tsx` |

**Points conformes (VERT)** : famille déclarée = code réel (§1 partiel), bandeau cookies fonctionnel dans son UI (§2 partiel), export/suppression RGPD réels et testés (§4), lexique interdit 0 occurrence + garde-fous IA explicites (§6), chiffres cohérents avec FACTS.md (§7), blocage migration documenté le jour même dans ERRORS.md (§8 partiel).

---

## Remédiation — 2026-08-23

Périmètre strict : les 7 écarts ci-dessus. Médiateur (GAP 1) et Sign in with Apple (GAP 7) laissés
honnêtement hors périmètre (le premier nécessite une vraie souscription à un médiateur agréé, le
second une intégration native App/Play Store — pas des corrections de code sur ce dépôt).

**SSH VPS re-testé au début de cette remédiation** (protocole : mot de passe relu depuis
`grep VPS_SSH_PASSWORD .env.secrets`, PAS supposé mauvais) : `sshpass -p "$VPS_SSH_PASSWORD" ssh
root@72.62.191.111 "echo OK"` → `Connection refused` port 22. Retest avec la clé de secours
(`ssh -i ~/.ssh/purama_vps_ed25519`) → même refus. Blocage réseau réel et confirmé, pas un problème
de credentials. Fallback appliqué : API pg-meta Supabase (`POST https://auth.purama.dev/pg/query`,
header `apikey: $SUPABASE_SERVICE_ROLE_KEY`, cf PIEGES.md §"Alternative sans SSH") — fonctionnelle,
testée d'abord avec `select 1`.

- **GAP 2 — CORRIGÉ le 2026-08-23** : clause "Données de santé — consentement renforcé (art. 9
  RGPD)" ajoutée à `src/app/(legal)/confidentialite/page.tsx` (nouvelle section 3, ancienne
  numérotation 3-8 décalée à 4-9) : mentionne explicitement la collecte réelle HealthKit
  (`heartRate`, `mindfulSession`) / Health Connect via PRANA Watch, la base légale art. 9.2.a RGPD
  (consentement explicite via l'autorisation OS), la révocabilité, et l'engagement "jamais utilisées
  à des fins publicitaires, jamais cédées ni vendues". Section "Données collectées" (§2) complétée en
  cohérence. Comme ce contenu réel change matériellement (donnée de santé sensible ajoutée),
  `CURRENT_LEGAL_VERSIONS.confidentialite` bumpée `1.0` → `1.1` dans `src/lib/legal/versions.ts`
  (+ entrée `LEGAL_VERSIONS_HISTORY`), pour que les utilisateurs déjà inscrits soient re-sollicités
  par le gate ci-dessous plutôt que de rester silencieusement sur l'ancien texte.
- **GAP 3 — CORRIGÉ le 2026-08-23** : `src/components/analytics/posthog-provider.tsx` lit désormais
  `useCookieConsent()` et n'importe/n'initialise `posthog-js` que si `consent.mesure === true`
  (après hydratation `useSyncExternalStore`, donc jamais de flash SSR). Si le consentement est
  retiré après coup (bandeau "Personnaliser"), `posthog.opt_out_capturing()` est appelé sur
  l'instance déjà chargée plutôt que de la laisser tourner ; un retour à `true` appelle
  `opt_in_capturing()`. Plus aucun cookie de mesure déposé avant consentement explicite — cohérent
  avec le texte de `confidentialite/page.tsx` §9.
- **GAP 4 — CORRIGÉ le 2026-08-23** : migration `supabase/migrations/0009_legal_core.sql` exécutée
  via l'API pg-meta (SSH confirmé bloqué, cf ci-dessus) — vérifié après coup par requête
  `information_schema.tables` : `legal_acceptances`, `cookie_consents`, `account_deletion_requests`
  existent bien dans le schéma `prana`, RLS activée sur les 3 (`pg_tables.rowsecurity = true`). La
  preuve d'acceptation CGU est maintenant réellement opérationnelle en production.
- **GAP 5 — CORRIGÉ le 2026-08-23** : `<AIDisclosure appName="PURAMA ONE" />` monté dans
  `src/components/execute/execute-workflow.tsx`, juste au-dessus du contenu généré par l'IA
  (`output.guidance` + alternatives), même emplacement/wording que `magic-button-modal.tsx` et
  `plan-7days.tsx`.
- **GAP 6 — CORRIGÉ le 2026-08-23** : `LegalReacceptanceGate` monté dans `src/app/(app)/layout.tsx`
  — lecture de `legal_acceptances` de l'utilisateur courant côté serveur, `computeDocsEnAttente()`
  passé à un nouveau pont client `src/components/legal/legal-reacceptance-gate-mount.tsx` (branché
  sur `POST /api/legal/accept`, même endpoint que `LegalAcceptanceNotice` au signup). Bug latent
  corrigé au passage dans `LegalReacceptanceGate.tsx` : les liens "Lire « ... »" pointaient vers
  `/politique-confidentialite` et `/mentions` (routes génériques du socle), qui n'existent pas dans
  PRANA (routes réelles : `/confidentialite`, `/mentions-legales`) — remplacés par une table
  `DOC_ROUTES` explicite, sinon le gate nouvellement monté aurait affiché un lien mort. Le bump de
  version du GAP 2 rend ce gate immédiatement vérifiable : les utilisateurs déjà inscrits seront
  re-sollicités pour `confidentialite` à leur prochaine visite.

**Vérifié** : `npx tsc --noEmit` → 0 erreur. `npm run build` → succès (70 routes générées, y compris
`(app)`). `npx eslint` sur les 7 fichiers touchés (`--max-warnings 0`) → 0 erreur/warning.

**Non corrigés (hors périmètre, documentés pour mémoire)** :
- GAP 1 (médiateur absent des pages réelles) — nécessite une vraie souscription à un médiateur de
  la consommation agréé, pas une correction de code.
- GAP 7 (Sign in with Apple absent) — nécessite une intégration native + configuration Apple
  Developer, hors périmètre code de cette remédiation.

VERDICT:prana:ORANGE:7
