import Foundation
import HealthKit

@MainActor
final class HealthKitManager: ObservableObject {
    static let shared = HealthKitManager()

    private let store = HKHealthStore()
    @Published var authorized = false

    private var typesToWrite: Set<HKSampleType> {
        guard let mindful = HKObjectType.categoryType(forIdentifier: .mindfulSession) else { return [] }
        return [mindful]
    }

    private var typesToRead: Set<HKObjectType> {
        var set: Set<HKObjectType> = []
        if let hr = HKObjectType.quantityType(forIdentifier: .heartRate) { set.insert(hr) }
        if let mindful = HKObjectType.categoryType(forIdentifier: .mindfulSession) { set.insert(mindful) }
        return set
    }

    func requestAuthorization() async {
        guard HKHealthStore.isHealthDataAvailable() else { return }
        do {
            try await store.requestAuthorization(toShare: typesToWrite, read: typesToRead)
            authorized = true
        } catch {
            authorized = false
        }
    }

    /// Record a Mindful Session in Apple Health after a completed breathing protocol.
    func recordMindfulMinutes(durationSec: Int, source: String) async {
        guard authorized,
              let mindfulType = HKObjectType.categoryType(forIdentifier: .mindfulSession) else { return }
        let end = Date()
        let start = end.addingTimeInterval(-Double(durationSec))
        let sample = HKCategorySample(
            type: mindfulType,
            value: HKCategoryValue.notApplicable.rawValue,
            start: start,
            end: end,
            metadata: ["source": "PRANA", "protocol": source]
        )
        try? await store.save(sample)
    }
}
