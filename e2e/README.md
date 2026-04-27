# PRANA — Tests E2E (Playwright)

5 specs, 3 viewports (mobile Pixel 7, tablet iPad, desktop 1440×900).

## Couverture

- `01-marketing.spec.ts` — landing/pricing/manifesto/safety + sitemap/robots/og
- `02-auth-redirect.spec.ts` — middleware redirige routes app → /login
- `03-api-auth.spec.ts` — toutes les routes API mutantes 401 sans auth + crons 403 sans Bearer + Stripe webhook 400 sans signature
- `04-referral-cookie.spec.ts` — `/ref/[code]` plante cookie + redirige `/signup`
- `05-security-headers.spec.ts` — CSP, HSTS, X-Frame-Options, X-Content-Type-Options, no x-powered-by

## Stratégie auth

**Mock par défaut** : 90% des tests valident les redirections middleware et les 401 sans jamais authentifier — pas besoin d'un vrai utilisateur.

**Tests "auth réelle"** : pas en CI (eviter coûts Stripe/Resend test mode + flakiness OAuth). Smoke prod manuel post-deploy.

## Run local

```bash
npm run build
PORT=3001 npx playwright test
```

## Run contre prod (smoke)

```bash
PLAYWRIGHT_BASE_URL=https://prana.purama.dev npx playwright test e2e/01-marketing.spec.ts e2e/05-security-headers.spec.ts
```
