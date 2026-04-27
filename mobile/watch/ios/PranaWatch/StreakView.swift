import SwiftUI

struct StreakView: View {
    @EnvironmentObject var connectivity: WatchConnectivityManager

    var body: some View {
        VStack(spacing: 8) {
            Text("Série")
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(.secondary)
            Text("\(connectivity.streakDays)")
                .font(.system(size: 64, weight: .semibold, design: .serif))
                .foregroundStyle(.pink)
            Text(connectivity.streakDays >= 7 ? "Bravo, ça tient." : "Reprends quand tu veux.")
                .font(.caption2)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding()
    }
}
