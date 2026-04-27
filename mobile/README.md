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

10 flows cover auth surface, pulse, protocol player, regulate filters, score, settings, deep links, responsive, back nav, error state. `_login-helper.yaml` is a stub — replace with a real auth sequence (or pre-inject session) for CI.

## Routes

- `/(auth)/login` — magic link + Google OAuth via expo-web-browser
- `/(auth)/signup` — magic link signup, 7-day Pro trial server-side
- `/(tabs)/today` — pulse check + suggestion + magic buttons CTA
- `/(tabs)/regulate` — 12 protocols list with category filters
- `/(tabs)/score` — 7-day streak + Calm/Energy/Focus stats + sparkline
- `/(tabs)/settings` — account info, billing/safety/notifications/data deep-link to web, logout
- `/protocol/[slug]` — animated breathing circle player (Reanimated 4)
- `/+not-found`

## What's NOT yet wired (post-bootstrap work)

1. **Magic Buttons modal** — needs `/api/agent/magic-button` integration. Currently only the regulate list is reachable.
2. **LifeOS Capture (voice)** — `expo-av` recorder + Whisper upload. Web flow already works; native port pending.
3. **Push notifications** — `expo-notifications` registration + APNs/FCM tokens persisted to `push_tokens` table.
4. **HealthKit / Health Connect** — read steps/HRV/sleep, write Mindful Minutes after each protocol.
5. **Real `_login-helper.yaml`** — Maestro CI auth sequence (or session injection).
6. **Real EAS projectId** — replace `00000000-…` in `app.json` after `eas init`.
7. **Real APPLE_TEAM_ID + ascAppId** in `eas.json`.
8. **Icons** — `assets/icon.png`, `splash-icon.png`, `adaptive-icon.png` (Pollinations + sharp).

## Apple Watch / Wear OS

See `watch/README.md` for the watchOS SwiftUI + Wear OS Compose targets bootstrapped here.
