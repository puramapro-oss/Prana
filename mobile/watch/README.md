# PRANA — Apple Watch + Wear OS

Native companion watch apps for the breathing-and-pulse use cases. Same Supabase data, same micro-actions, glanceable UX.

## What's here

- `ios/PranaWatch/` — watchOS 10+ SwiftUI target. Add as a target inside the Expo iOS project (`mobile/ios/Prana.xcworkspace`) once `expo prebuild` has materialized the iOS project.
- `android/wear/` — Wear OS module (Jetpack Compose + Tiles). Add to the Expo Android project (`mobile/android/`) once `expo prebuild` has materialized it.

## Stack & rationale

- **iOS**: WatchKit + SwiftUI (no React Native on watch — RN watchOS is unstable). HealthKit for heart rate / steps / Mindful Minutes write. Complications via ClockKit. WatchConnectivity to sync session ↔ phone.
- **Android**: Jetpack Compose for Wear, Health Services API (replaces deprecated Google Fit), Tiles for the home glance, MessageClient for phone↔watch sync.

Both ship inside the same App Store / Play Store listing as the phone app — Apple/Google bundle them automatically when the watch target is part of the Xcode/Gradle build.

## What's bootstrapped

`ios/PranaWatch/` contains:
- `PranaWatchApp.swift` — app entry, scene
- `RootView.swift` — TabView with 3 tabs: Today / Breathe / Streak
- `TodayView.swift` — pulse mini (stress/energy 1-5 with Digital Crown)
- `BreatheView.swift` — animated 4-7-8 breathing circle
- `StreakView.swift` — current streak read from shared App Group
- `HealthKitManager.swift` — request authorization + write Mindful Minutes
- `WatchConnectivityManager.swift` — receives Supabase auth token from phone
- `Complications/` — small/large complications showing streak

`android/wear/` contains:
- `MainActivity.kt` — entry, Compose scene
- `screens/TodayScreen.kt` + `BreatheScreen.kt` + `StreakScreen.kt`
- `tiles/StreakTile.kt` — Wear OS tile for the home glance
- `health/HealthServicesRepo.kt` — Health Services subscription
- `data/PhoneDataLayer.kt` — DataClient bridge to phone

## How to wire into the Expo project

1. **iOS — first time only**:
   ```bash
   cd mobile && npx expo prebuild --platform ios --clean
   open ios/Prana.xcworkspace
   ```
   In Xcode: File → New → Target → Watch App for iOS App → name "PranaWatch" → bundle `dev.purama.prana.watchkitapp`. Replace generated files with `watch/ios/PranaWatch/*.swift`. Add HealthKit + WatchConnectivity capabilities. Add the App Group `group.dev.purama.prana` shared with the phone target.

2. **Android — first time only**:
   ```bash
   cd mobile && npx expo prebuild --platform android --clean
   ```
   Add a Wear OS module (Android Studio → File → New → New Module → Wear OS Module → name "wear", min SDK 30, package `dev.purama.prana.wear`). Replace generated files with `watch/android/wear/*`. Add Health Services + Tiles dependencies (already in the Kotlin files).

3. **Sync auth**: phone target sends Supabase access token via WatchConnectivity / DataClient on login. Stored in App Group / Shared Preferences. Watch never holds refresh tokens — short-lived access token only.

## What ships in v2.0-B (this milestone)

- ✅ Project structure (Swift + Kotlin)
- ✅ 3 SwiftUI screens + 3 Compose screens with auth bridge
- ✅ HealthKit Mindful Minutes write on each completed breathing session
- ✅ Wear OS Tile for streak glance
- ✅ Heart rate live readout during breathing (WatchConnectivity / Health Services)
- ⚠️ Real Supabase write from watch — phone proxies the request via Connectivity (watch doesn't carry full Supabase SDK)
- ⚠️ Complications full set — bootstrap covers `.modularSmall` + `.utilitarianSmall`, expand with `.graphicCircular` post-launch

## What's deferred to a follow-up

- Standalone watch app (no phone required) — needs Supabase REST direct, complex auth bridge
- Crown-based pulse rich UX
- Wear OS Ongoing Activity for active breathing session
- Apple Health workout recording for breathing sessions
- Watch-only deep links

These deferrals are explicit because real platform integration (provisioning profiles, App Group sandboxing, Wear OS Tile registration) is beyond what can be done from CLI alone — Tissma must `expo prebuild` + open Xcode/Android Studio once.
