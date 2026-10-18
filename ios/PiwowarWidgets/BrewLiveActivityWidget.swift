//
//  BrewLiveActivityWidget.swift
//  Piwowar (Brewcraft) — Live Activities & Dynamic Island Widget
//  Physical Steel & Wort Amber Aesthetic (WCAG AAA compliant)
//

import ActivityKit
import SwiftUI
import WidgetKit

public struct BrewLiveActivityWidget: Widget {
    public init() {}

    public var body: some WidgetConfiguration {
        ActivityConfiguration(for: BrewActivityAttributes.self) { context in
            // Lock Screen Banner View
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("🍺 \(context.attributes.recipeName)")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(Color(hex: "F2F4F8"))
                        .lineLimit(1)
                    Spacer()
                    Text(context.state.stageName.uppercased())
                        .font(.system(size: 10, weight: .heavy))
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color(hex: "E58A2B"))
                        .foregroundColor(.black)
                        .cornerRadius(4)
                }

                HStack(alignment: .bottom) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(context.state.stepName)
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(Color(hex: "A8B0C2"))

                        if let hop = context.state.nextHopName, let weight = context.state.nextHopWeightG {
                            Text("🌿 Następny chmiel: \(hop) (\(Int(weight))g)")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(Color(hex: "389E58"))
                        }
                    }

                    Spacer()

                    // Countdown timer
                    if context.state.isRunning {
                        Text(timerInterval: Date()...context.state.targetTimestamp, countsDown: true)
                            .font(.system(size: 32, weight: .heavy, design: .monospaced))
                            .foregroundColor(Color(hex: "E58A2B"))
                    } else {
                        Text(formatSeconds(context.state.secondsRemaining))
                            .font(.system(size: 32, weight: .heavy, design: .monospaced))
                            .foregroundColor(Color(hex: "EAA824"))
                    }
                }
            }
            .padding(14)
            .background(Color(hex: "171A21"))
        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded Dynamic Island
                DynamicIslandExpandedRegion(.leading) {
                    VStack(alignment: .leading) {
                        Text("🍺 \(context.attributes.recipeName)")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(Color(hex: "F2F4F8"))
                        Text(context.state.stepName)
                            .font(.system(size: 11))
                            .foregroundColor(Color(hex: "A8B0C2"))
                    }
                }
                DynamicIslandExpandedRegion(.trailing) {
                    VStack(alignment: .trailing) {
                        if context.state.isRunning {
                            Text(timerInterval: Date()...context.state.targetTimestamp, countsDown: true)
                                .font(.system(size: 20, weight: .heavy, design: .monospaced))
                                .foregroundColor(Color(hex: "E58A2B"))
                        } else {
                            Text(formatSeconds(context.state.secondsRemaining))
                                .font(.system(size: 20, weight: .heavy, design: .monospaced))
                                .foregroundColor(Color(hex: "EAA824"))
                        }
                    }
                }
                DynamicIslandExpandedRegion(.bottom) {
                    if let hop = context.state.nextHopName, let weight = context.state.nextHopWeightG {
                        HStack {
                            Image(systemName: "leaf.fill")
                                .foregroundColor(Color(hex: "389E58"))
                            Text("Chmiel: \(hop) (\(Int(weight))g)")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(Color(hex: "F2F4F8"))
                            Spacer()
                        }
                        .padding(.top, 4)
                    }
                }
            } compactLeading: {
                Image(systemName: "flame.fill")
                    .foregroundColor(Color(hex: "E58A2B"))
            } compactTrailing: {
                if context.state.isRunning {
                    Text(timerInterval: Date()...context.state.targetTimestamp, countsDown: true)
                        .font(.system(size: 13, weight: .bold, design: .monospaced))
                        .foregroundColor(Color(hex: "E58A2B"))
                } else {
                    Text(formatSeconds(context.state.secondsRemaining))
                        .font(.system(size: 13, weight: .bold, design: .monospaced))
                        .foregroundColor(Color(hex: "EAA824"))
                }
            } minimal: {
                Image(systemName: "timer")
                    .foregroundColor(Color(hex: "E58A2B"))
            }
        }
    }
}

private func formatSeconds(_ sec: Int) -> String {
    let m = sec / 60
    let s = sec % 60
    return String(format: "%02d:%02d", m, s)
}

extension Color {
    init(hex: String) {
        let scanner = Scanner(string: hex)
        var rgbValue: UInt64 = 0
        scanner.scanHexInt64(&rgbValue)

        let r = Double((rgbValue & 0xFF0000) >> 16) / 255.0
        let g = Double((rgbValue & 0x00FF00) >> 8) / 255.0
        let b = Double(rgbValue & 0x0000FF) / 255.0

        self.init(red: r, green: g, blue: b)
    }
}
