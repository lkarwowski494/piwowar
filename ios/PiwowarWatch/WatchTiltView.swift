//
//  WatchTiltView.swift
//  Piwowar (Brewcraft) — watchOS Tilt BLE Complication & View
//

import SwiftUI

public struct WatchTiltView: View {
    @ObservedObject var session = WatchSessionManager.shared

    public init() {}

    public var body: some View {
        VStack(spacing: 6) {
            HStack {
                Image(systemName: "sensor.tag.radiowaves.forward.fill")
                    .foregroundColor(Color(hex: "389E58"))
                Text("Tilt BLE")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(Color(hex: "F2F4F8"))
            }

            if let sg = session.tiltSg {
                Text(String(format: "%.3f SG", sg))
                    .font(.system(size: 26, weight: .heavy, design: .monospaced))
                    .foregroundColor(Color(hex: "E58A2B"))
            } else {
                Text("--.--- SG")
                    .font(.system(size: 22, weight: .bold, design: .monospaced))
                    .foregroundColor(Color(hex: "A8B0C2"))
            }

            if let temp = session.tiltTempC {
                Text(String(format: "%.1f °C", temp))
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(Color(hex: "389E58"))
            } else {
                Text("Brak sygnału BLE")
                    .font(.system(size: 11))
                    .foregroundColor(Color(hex: "A8B0C2"))
            }
        }
        .padding()
    }
}
