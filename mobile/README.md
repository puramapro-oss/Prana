# PRANA — Mobile (Expo / iOS + Android)

Companion app for [prana.purama.dev](https://prana.purama.dev). Same Supabase backend, same data, native UX.

## Stack

- Expo 54 + expo-router 6 (typed routes)
- React Native 0.81 / new architecture / Hermes
- NativeWind v4 (Tailwind classes in RN)
- Supabase JS + SecureStore adapter (auth tokens encrypted, chunked to fit 2 KB SecureStore limit)
- Reanimated 4 (breathing circle, transitions)
- Zustand (UI state), TanStack Query later
- HealthKit (iOS) + Health Connect (Android) — wired in app.json plugins, not yet integrated UI-side

## Quick start

```bash
cd mobile
cp .env.example .env.local           # fill EXPO_PUBLIC_SUPABASE_URL + ANON_KEY
npm i
npx expo start
```

iOS simulator: `i`. Android: `a`. Web preview: `w`.

## Build & submit

```bash
# dev simulator
eas build --profile dev-sim --platform ios

# preview internal (TestFlight / Play Internal)
eas build --profile preview --platform all

# production
eas build --profile production --platform all
eas submit --profile production --platform all
```

GitHub Actions / EAS Workflows under `.eas/workflows/`:
- `build-preview.yml` — builds preview on every push to `main` touching `mobile/**`
- `release.yml` — builds + submits production on tag `mobile-v*`

## Maestro testing

```bash
maestro test .maestro/flows
```

10 flows cover auth surface, pulse, protocol player, regulate filters, score, settings, deep links, responsive, back nav, error state.

`_login-helper.yaml` injects a pre-minted Supabase session via deep link `prana://e2e/session?token=<access>\t<refresh>`. The deep link is only honored when `EXPO_PUBLIC_E2E_BYPASS=1` (dev/preview builds only — production rejects).

CI sequence:
```bash
TOKEN=$(node ../scripts/maestro-mint-token.mjs)
MAESTRO_E2E_TOKEN="$TOKEN" maestro test mobile/.maestro/flows
```

`scripts/maestro-mint-token.mjs` signs in with `MAESTRO_TEST_EMAIL` + `MAESTRO_TEST_PASSWORD` and prints `access_token<TAB>refresh_token` to stdout.

## Routes

- `/(auth)/login` — magic link + Google OAuth via expo-web-browser
- `/(auth)/signup` — magic link signup, 7-day Pro trial server-side
- `/(tabs)/today` — pulse check + suggestion + magic buttons CTA
- `/(tabs)/regulate` — 12 protocols list with category filters
- `/(tabs)/score` — 7-day streak + Calm/Energy/Focus stats + sparkline
- `/(tabs)/settings` — account info, billing/safety/notifications/data deep-link to web, logout
- `/protocol/[slug]` — animated breathing circle player (Reanimated 4)
- `/+not-found`

## What's wired now (v2.0.1)

1. **Magic Buttons modal** ✅ — `/api/agent/magic-button` integration via `apiFetch` helper. 12 buttons grid on Today screen with plan-gated lock icons. Modal supports context input, copy, share, fallback handling.
2. **Maestro CI auth** ✅ — pre-mint token via `scripts/maestro-mint-token.mjs` + deep link injection in dev/preview builds.
3. **Icons** ✅ — auto-generated via `node scripts/generate-icons.mjs` (web + mobile). Re-run with `--skip-existing` to top-up failed Pollinations 429 hits.

## What's NOT yet wired (need manual Tissma steps)

1. **LifeOS Capture (voice)** — `expo-av` recorder + Whisper upload. Web flow already works; native port pending.
2. **Push notifications** — `expo-notifications` registration + APNs/FCM tokens persisted to `push_tokens` table.
3. **HealthKit / Health Connect read** — read steps/HRV/sleep (write Mindful Minutes already structured in watch).
4. **Real EAS projectId** — run `eas init` once → writes into `app.json`.
5. **Real APPLE_TEAM_ID + ascAppId** in `eas.json` after first build to App Store Connect.
6. **GoogleService-account.json** — download from Google Cloud Console, place at `mobile/google-service-account.json`.

See `.env.example` for the exact commands per credential.

## Apple Watch / Wear OS

See `watch/README.md` for the watchOS SwiftUI + Wear OS Compose targets bootstrapped here.
