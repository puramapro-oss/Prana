import SwiftUI

struct RootView: View {
    @EnvironmentObject var connectivity: WatchConnectivityManager

    var body: some View {
        if connectivity.accessToken == nil {
            // Phone hasn't sent a session token yet — show a simple gate.
            UnauthenticatedView()
        } else {
            TabView {
                TodayView().tag(0)
                BreatheView().tag(1)
                StreakView().tag(2)
            }
            .tabViewStyle(.page)
        }
    }
}

struct UnauthenticatedView: View {
    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: "wind")
                .font(.system(size: 32))
                .foregroundStyle(.tint)
            Text("Connecte-toi sur ton iPhone")
                .font(.system(size: 14))
                .multilineTextAlignment(.center)
                .foregroundStyle(.secondary)
        }
        .padding()
    }
}
