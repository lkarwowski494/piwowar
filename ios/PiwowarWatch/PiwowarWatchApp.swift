//
//  PiwowarWatchApp.swift
//  Piwowar (Brewcraft) — watchOS Application Entry Point
//

import SwiftUI

@main
struct PiwowarWatchApp: App {
    var body: some Scene {
        WindowGroup {
            TabView {
                WatchBrewTimerView()
                    .tabItem {
                        Image(systemName: "timer")
                        Text("Stoper")
                    }

                WatchTiltView()
                    .tabItem {
                        Image(systemName: "sensor.tag.radiowaves.forward.fill")
                        Text("Tilt BLE")
                    }
            }
        }
    }
}
