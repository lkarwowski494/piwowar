//
//  WatchSessionManager.swift
//  Piwowar (Brewcraft) — watchOS WatchConnectivity Manager
//

import Foundation
import WatchConnectivity
import WatchKit

public class WatchSessionManager: NSObject, ObservableObject, WCSessionDelegate {
    public static let shared = WatchSessionManager()

    @Published public var recipeName: String = "Brak aktywnej warki"
    @Published public var stepName: String = "Oczekiwanie"
    @Published public var secondsRemaining: Int = 0
    @Published public var isRunning: Bool = false
    @Published public var tiltSg: Double? = nil
    @Published public var tiltTempC: Double? = nil

    private override init() {
        super.init()
        if WCSession.isSupported() {
            let session = WCSession.default
            session.delegate = self
            session.activate()
        }
    }

    public func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {}

    public func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String : Any]) {
        DispatchQueue.main.async {
            if let name = applicationContext["recipeName"] as? String {
                self.recipeName = name
            }
            if let step = applicationContext["stepName"] as? String {
                self.stepName = step
            }
            if let sec = applicationContext["secondsRemaining"] as? Int {
                self.secondsRemaining = sec
            }
            if let running = applicationContext["isRunning"] as? Bool {
                self.isRunning = running
            }
            if let sg = applicationContext["tiltSg"] as? Double {
                self.tiltSg = sg
            }
            if let temp = applicationContext["tiltTempC"] as? Double {
                self.tiltTempC = temp
            }

            // Trigger Taptic notification on hop addition or step change
            if let alert = applicationContext["triggerTaptic"] as? Bool, alert {
                WKInterfaceDevice.current().play(.notification)
            }
        }
    }

    public func togglePlayPause() {
        guard WCSession.default.isReachable else { return }
        WCSession.default.sendMessage(["action": "togglePlayPause"], replyHandler: nil)
        WKInterfaceDevice.current().play(.click)
    }

    public func skipToNextStep() {
        guard WCSession.default.isReachable else { return }
        WCSession.default.sendMessage(["action": "nextStep"], replyHandler: nil)
        WKInterfaceDevice.current().play(.directionUp)
    }
}
