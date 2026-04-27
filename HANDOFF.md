# PRANA — HANDOFF (2026-04-27)

## État courant

- **Web prod** : `https://prana.purama.dev` v=2397f05, `/api/status` ok=true (supabase + auth + anthropic + stripe).
- **E2E** : `PLAYWRIGHT_BASE_URL=https://prana.purama.dev npx playwright test` → **195 / 195** sur mobile-Pixel-7 + tablet-iPad + desktop-1440.
- **Mobile Expo + Watch** : code-side bootstrap déjà commité (commit `41e8509` + `c253f77` + `0755595` + `8ce335a` + `ff2d6eb`). Étapes manuelles documentées dans `mobile/.env.example` + `mobile/README.md` (eas init, APPLE_TEAM_ID, etc.).
- **Healthcheck horaire** : `.github/workflows/healthcheck.yml` ping `/api/status` toutes les heures + au push. Échoue si l'un des 4 sub-checks ≠ ok.

## Ce qui a été corrigé en prod cette session

| # | Symptôme | Cause | Fix |
|---|---|---|---|
| 1 | `auth.purama.dev/auth/v1/*` → 503 Kong | container `supabase-auth` Exited (1) hier 19:42Z | `docker restart supabase-auth` |
| 2 | gotrue → 500 "Database error finding users" | gotrue v2.186 bug : Scan NULL → string non supporté pour `confirmation_token` etc. | `UPDATE auth.users SET … COALESCE(NULL, '')` sur 8 colonnes |
| 3 | gotrue → 500 "Database error creating new user" | trigger `kaia.handle_new_auth_user` ref'd 3 colonnes droppées + bare `gen_random_bytes()` sans schéma | ajouté les 3 colonnes en boolean default true + `ALTER FUNCTION kaia.handle_new_auth_user() SET search_path = kaia, extensions, pg_catalog` |
| 4 | Stripe live key invalid (rotated) | clé dans `.env.secrets` périmée — la vraie est sur le VPS dans `/opt/supabase/docker/.env` | clé récupérée + reposée dans Vercel |
| 5 | `STRIPE_WEBHOOK_SECRET = "placeholder-…"` | jamais wiré | créé webhook PRANA `we_1TQpUf4Y…` → `whsec_d8n6nip2…` |
| 6 | `stripePriceMonthlyId/Yearly` vides dans `PLANS` | jamais peuplés | créé 3 products + 6 prices Stripe live + lus depuis `STRIPE_PRICE_<PLAN>_<CYCLE>` |
| 7 | Stripe checkout → 500 "Not a valid URL" | `NEXT_PUBLIC_APP_URL` (et 22 autres) avait `\n` traînant dans Vercel env | cleanup batch via `printf "%s"` (pas `\n`) |
| 8 | `/api/status` masquait les vraies pannes | check était env-presence-only et PostgREST-only | maintenant probe `/auth/v1/admin/users` + Stripe `/v1/account` (read+write paths) |

## Stripe live — config actuelle

```
acct_1Ss52P4Y1unNvKtX (live)

products    : prod_UPentiUJOpjW1M (Starter), prod_UPen6dXS482CR0 (Pro), prod_UPenooZQUzzxrS (Ultime)
prices      : 6 (3 plans × monthly/yearly), tous EUR, métadonnée { app: "prana", plan, cycle }
webhook     : we_1TQpUf4Y1unNvKtXKmDGgfU7 → https://prana.purama.dev/api/stripe/webhook (7 events)
trial       : 7 jours sur subscription_data.trial_period_days
```

## Commits livrés cette session

```
3ebc612 test(e2e): full-journey + stripe specs + auth bootstrap helper + /api/status hardening
b32623d fix(stripe): wire price IDs to env vars (STRIPE_PRICE_<PLAN>_<CYCLE>)
54117cf fix(status,e2e): probe gotrue→DB write path, not just Kong route
ff2d6eb ops(scripts): heal-auth-pool.sh — one-shot fix for gotrue↔postgres pool
1ee83ce debug(stripe): surface error detail when STRIPE_DEBUG=1   (reverté 2397f05)
f69cf31 redeploy: pick up cleaned env vars (no trailing newlines)
2397f05 fix(e2e+stripe): 65/65 green — pulse-check schema + dialog scope + textbox value + non-silent catch
```

## Reste manuel (Tissma)

Aucun pour PRANA web. Les seuls items "manuels" qui restent sont les comptes externes pour mobile :
- `eas init` (écrit projectId dans `mobile/app.json`)
- `APPLE_TEAM_ID` + `APPLE_ASC_APP_ID` après premier build App Store Connect
- `google-service-account.json` à la racine de `mobile/`
- (optionnel) Sentry projet `prana` sur sentry.io + `vercel env add NEXT_PUBLIC_SENTRY_DSN`

## Pour la prochaine app

Les 7 patterns récurrents trouvés ici cassent SILENCIEUSEMENT en prod. À mettre dans la checklist du prochain bootstrap :

1. **`/api/status` doit probe les writes**. Pas juste la latence d'un SELECT — appelle `/auth/v1/admin/users` (auth.users read) + Stripe `/v1/account` (clé valide). Sinon une clé révoquée ou une connexion-pool morte stay green.
2. **`vercel env add` toujours via `printf "%s" "$VAL"`**, **jamais** `printf "%s\n"` ni `echo`. Sinon trailing `\n` casse n'importe quelle URL passée à un client tiers (Stripe success_url notamment).
3. **`catch {}` interdit dans les API routes**. Toujours `catch (err) { console.error(...) }` — sinon Vercel runtime logs n'ont rien à montrer le jour où ça pète.
4. **gotrue v2.186 + Postgres** : si tu vois une erreur "converting NULL to string is unsupported", c'est `auth.users.confirmation_token` (et 7 autres tokens) NULL. Backfill avec `COALESCE(col, '')`.
5. **Triggers cross-schemas sur `auth.users`** : sur prod self-hosted, **toutes** les apps ont un AFTER INSERT trigger sur `auth.users`. Si une seule app a un trigger cassé (col droppée, search_path manquant), **toutes les inscriptions** dans **toutes les apps** échouent. Mettre toujours `SET search_path = <app>, extensions, pg_catalog` dans les SECURITY DEFINER functions.
6. **Magic-link admin.generateLink ≠ /auth/callback?code=**. Le link admin émet un implicit grant (`#access_token` dans le fragment) que `/auth/callback` (PKCE) refuse. Pour l'auth E2E, passer par `signInWithPassword` + injection cookie SSR `sb-<projectRef>-auth-token` directement.
7. **Cookie SSR Supabase** : nom = `sb-<premier-label-du-host>-auth-token`. Pour `https://auth.purama.dev` → `sb-auth-auth-token`. Valeur = `base64-` + base64(JSON({access_token, refresh_token, user, …})). Domaine = host de l'app, pas du Supabase.

## Liens

- prod : https://prana.purama.dev
- repo : https://github.com/puramapro-oss/prana
- Vercel : `team_dGuJ4PqnSU1uaAHa26kkmKKk` / `prj_ytbvbthKSblx5mrRdOZm6n7i9d2i`
- Supabase auth : `https://auth.purama.dev` (self-hosted, VPS `72.62.191.111`)
- Stripe : `acct_1Ss52P4Y1unNvKtX` (live)
