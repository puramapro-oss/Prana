import SwiftUI

struct TodayView: View {
    @State private var stress: Double = 3
    @State private var energy: Double = 3
    @State private var sending = false
    @State private var feedback: String?

    @EnvironmentObject var connectivity: WatchConnectivityManager

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                Text("Pulse rapide")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(.secondary)

                slider("Stress", value: $stress, lowEmoji: "😌", highEmoji: "😣")
                slider("Énergie", value: $energy, lowEmoji: "😴", highEmoji: "⚡️")

                Button {
                    submit()
                } label: {
                    if sending {
                        ProgressView()
                    } else {
                        Text("Envoyer")
                            .frame(maxWidth: .infinity)
                    }
                }
                .buttonStyle(.borderedProminent)
                .tint(.pink)
                .disabled(sending)

                if let feedback {
                    Text(feedback)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }
            .padding(.horizontal, 4)
        }
    }

    private func slider(_ label: String, value: Binding<Double>, lowEmoji: String, highEmoji: String) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(label).font(.system(size: 12))
                Spacer()
                Text("\(Int(value.wrappedValue))/5")
                    .font(.system(size: 12).monospacedDigit())
                    .foregroundStyle(.secondary)
            }
            HStack(spacing: 4) {
                Text(lowEmoji)
                Slider(value: value, in: 1...5, step: 1)
                    .tint(.pink)
                Text(highEmoji)
            }
        }
    }

    private func submit() {
        sending = true
        feedback = nil
        connectivity.sendPulse(stress: Int(stress), energy: Int(energy)) { ok in
            DispatchQueue.main.async {
                sending = false
                feedback = ok ? "Enregistré ✓" : "Erreur — réessaie"
                WKInterfaceDevice.current().play(ok ? .success : .failure)
            }
        }
    }
}
