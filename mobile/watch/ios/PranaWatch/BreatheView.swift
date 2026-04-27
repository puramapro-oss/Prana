import SwiftUI

struct BreatheView: View {
    @State private var phase: Phase = .idle
    @State private var stepIndex = 0
    @State private var cycle = 0
    @State private var timer: Timer?

    @EnvironmentObject var healthKit: HealthKitManager

    enum Phase { case idle, running, done }

    private let steps: [(label: String, duration: Int, scale: CGFloat)] = [
        ("Inspire 4s", 4, 1.6),
        ("Retiens 7s", 7, 1.6),
        ("Expire 8s", 8, 1.0),
    ]
    private let targetCycles = 4
    private let protocolName = "478-breath"

    var body: some View {
        VStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(.pink.opacity(0.25))
                    .frame(width: 110, height: 110)
                    .scaleEffect(phase == .running ? steps[stepIndex].scale : 1)
                    .animation(.easeInOut(duration: Double(steps[stepIndex].duration)), value: stepIndex)
                if phase == .running {
                    VStack {
                        Text(steps[stepIndex].label)
                            .font(.system(size: 12))
                        Text("Cycle \(cycle + 1)/\(targetCycles)")
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                } else if phase == .done {
                    Text("✓").font(.system(size: 32))
                } else {
                    Text("4·7·8").font(.system(size: 18, weight: .semibold))
                }
            }

            Button {
                if phase == .running {
                    stop()
                } else if phase == .done {
                    phase = .idle
                    stepIndex = 0
                    cycle = 0
                } else {
                    start()
                }
            } label: {
                Text(phase == .running ? "Stop" : phase == .done ? "Recommencer" : "Démarrer")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .tint(phase == .running ? .red : .pink)
        }
        .padding(.horizontal, 8)
        .onDisappear { stop() }
    }

    private func start() {
        phase = .running
        stepIndex = 0
        cycle = 0
        scheduleNext()
    }

    private func stop() {
        timer?.invalidate()
        timer = nil
        phase = .idle
    }

    private func scheduleNext() {
        let step = steps[stepIndex]
        timer = Timer.scheduledTimer(withTimeInterval: TimeInterval(step.duration), repeats: false) { _ in
            WKInterfaceDevice.current().play(.click)
            if stepIndex >= steps.count - 1 {
                stepIndex = 0
                cycle += 1
                if cycle >= targetCycles {
                    phase = .done
                    WKInterfaceDevice.current().play(.success)
                    Task { await healthKit.recordMindfulMinutes(durationSec: targetCycles * 19, source: protocolName) }
                    return
                }
            } else {
                stepIndex += 1
            }
            scheduleNext()
        }
    }
}
