import Foundation
import WatchConnectivity

@MainActor
final class WatchConnectivityManager: NSObject, ObservableObject, WCSessionDelegate {
    static let shared = WatchConnectivityManager()

    @Published var accessToken: String?
    @Published var streakDays: Int = 0

    private let session = WCSession.default

    func activate() {
        guard WCSession.isSupported() else { return }
        session.delegate = self
        session.activate()
        // Restore from App Group if previously synced.
        if let token = sharedDefaults?.string(forKey: "supabase_access_token") {
            accessToken = token
        }
        streakDays = sharedDefaults?.integer(forKey: "streak_days") ?? 0
    }

    /// Send a pulse-check request to the phone, which then writes to Supabase.
    /// Watch does not hold full Supabase SDK to keep the bundle small and tokens phone-side.
    func sendPulse(stress: Int, energy: Int, completion: @escaping (Bool) -> Void) {
        guard session.isReachable else {
            completion(false)
            return
        }
        let payload: [String: Any] = ["type": "pulse_check", "stress": stress, "energy": energy]
        session.sendMessage(payload, replyHandler: { reply in
            let ok = (reply["ok"] as? Bool) ?? false
            completion(ok)
        }, errorHandler: { _ in completion(false) })
    }

    private var sharedDefaults: UserDefaults? {
        UserDefaults(suiteName: "group.dev.purama.prana")
    }

    // MARK: - WCSessionDelegate

    nonisolated func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {}

    nonisolated func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String : Any]) {
        Task { @MainActor in
            if let token = applicationContext["supabase_access_token"] as? String {
                self.accessToken = token
                self.sharedDefaults?.set(token, forKey: "supabase_access_token")
            }
            if let streak = applicationContext["streak_days"] as? Int {
                self.streakDays = streak
                self.sharedDefaults?.set(streak, forKey: "streak_days")
            }
        }
    }
}
