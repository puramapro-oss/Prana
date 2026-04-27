import SwiftUI
import WidgetKit

/// Watch complication showing the current streak day count.
/// Add to the watchOS target's Widget Extension. Updates on phone push via shared App Group.
struct StreakProvider: TimelineProvider {
    func placeholder(in context: Context) -> StreakEntry {
        StreakEntry(date: Date(), days: 7)
    }

    func getSnapshot(in context: Context, completion: @escaping (StreakEntry) -> Void) {
        completion(StreakEntry(date: Date(), days: currentStreak()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<StreakEntry>) -> Void) {
        let entry = StreakEntry(date: Date(), days: currentStreak())
        let next = Calendar.current.date(byAdding: .hour, value: 1, to: Date()) ?? Date().addingTimeInterval(3600)
        completion(Timeline(entries: [entry], policy: .after(next)))
    }

    private func currentStreak() -> Int {
        UserDefaults(suiteName: "group.dev.purama.prana")?.integer(forKey: "streak_days") ?? 0
    }
}

struct StreakEntry: TimelineEntry {
    let date: Date
    let days: Int
}

struct StreakComplicationView: View {
    var entry: StreakEntry

    var body: some View {
        VStack(spacing: 0) {
            Text("\(entry.days)")
                .font(.system(size: 16, weight: .semibold, design: .serif))
            Text("jrs")
                .font(.system(size: 8))
                .foregroundStyle(.secondary)
        }
    }
}

@main
struct StreakComplication: Widget {
    let kind = "PranaStreak"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: StreakProvider()) { entry in
            StreakComplicationView(entry: entry)
        }
        .configurationDisplayName("Série PRANA")
        .description("Ton nombre de jours d'affilée.")
        .supportedFamilies([.accessoryCircular, .accessoryCorner, .accessoryInline])
    }
}
