//
//  WatchBrewTimerView.swift
//  Piwowar (Brewcraft) — watchOS Kitchen-Proof Wrist Timer
//

import SwiftUI

public struct WatchBrewTimerView: View {
    @ObservedObject var session = WatchSessionManager.shared

    public init() {}

    public var body: some View {
        ScrollView {
            VStack(spacing: 8) {
                // Header
                Text(session.recipeName)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(Color(hex: "F2F4F8"))
                    .lineLimit(1)

                Text(session.stepName)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(Color(hex: "A8B0C2"))
                    .lineLimit(1)

                // Giant timer
                Text(formatSeconds(session.secondsRemaining))
                    .font(.system(size: 38, weight: .heavy, design: .monospaced))
                    .foregroundColor(session.isRunning ? Color(hex: "E58A2B") : Color(hex: "EAA824"))
                    .padding(.vertical, 4)

                // Kitchen-Proof Wrist Controls (Min 44pt touch)
                HStack(spacing: 12) {
                    Button(action: {
                        session.togglePlayPause()
                    }) {
                        Image(systemName: session.isRunning ? "pause.fill" : "play.fill")
                            .font(.system(size: 18, weight: .bold))
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(Color(hex: "E58A2B"))

                    Button(action: {
                        session.skipToNextStep()
                    }) {
                        Image(systemName: "forward.fill")
                            .font(.system(size: 18, weight: .bold))
                    }
                    .buttonStyle(.bordered)
                    .tint(Color(hex: "A8B0C2"))
                }
            }
            .padding(.horizontal)
        }
    }

    private func formatSeconds(_ sec: Int) -> String {
        let m = sec / 60
        let s = sec % 60
        return String(format: "%02d:%02d", m, s)
    }
}
