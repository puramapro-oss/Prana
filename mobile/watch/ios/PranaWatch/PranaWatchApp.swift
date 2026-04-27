import SwiftUI

@main
struct PranaWatchApp: App {
    @StateObject private var connectivity = WatchConnectivityManager.shared
    @StateObject private var healthKit = HealthKitManager.shared

    init() {
        // Activate WatchConnectivity early so the phone can deliver tokens before UI renders.
        WatchConnectivityManager.shared.activate()
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(connectivity)
                .environmentObject(healthKit)
                .preferredColorScheme(.dark)
                .task {
                    await healthKit.requestAuthorization()
                }
        }
    }
}
