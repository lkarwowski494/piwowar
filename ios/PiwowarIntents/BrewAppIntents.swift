//
//  BrewAppIntents.swift
//  Piwowar (Brewcraft) — AppIntents for Siri & Action Button
//  Created for iOS 16.0+ / 17.0+
//

import AppIntents
import Foundation

@available(iOS 16.0, *)
public struct CheckBrewTimerIntent: AppIntent {
    public static var title: LocalizedStringResource = "Sprawdź stoper warzenia"
    public static var description = IntentDescription("Odpytuje o aktualny etap i czas do najbliższego chmielenia")

    public static var openAppWhenRun: Bool = false

    public init() {}

    public func perform() async throws -> some ProvidesDialog {
        // Reads the shared defaults or session state
        let sharedDefaults = UserDefaults(suiteName: "group.com.apps4craft.piwowar")
        let recipe = sharedDefaults?.string(forKey: "currentRecipeName") ?? "Warka w toku"
        let step = sharedDefaults?.string(forKey: "currentStepName") ?? "Gotowanie brzeczki"
        let secRemaining = sharedDefaults?.integer(forKey: "secondsRemaining") ?? 0
        let nextHop = sharedDefaults?.string(forKey: "nextHopName")

        let minutes = secRemaining / 60

        let responseText: String
        if let hop = nextHop, !hop.isEmpty {
            responseText = "W warce \(recipe) trwa \(step). Do wrzucenia chmielu \(hop) pozostało \(minutes) minut."
        } else {
            responseText = "W warce \(recipe) trwa \(step). Pozostało \(minutes) minut."
        }

        return .result(dialog: IntentDialog(stringLiteral: responseText))
    }
}

@available(iOS 16.0, *)
public struct ToggleBrewTimerIntent: AppIntent {
    public static var title: LocalizedStringResource = "Przełącz stoper warki (Action Button)"
    public static var description = IntentDescription("Pauzuje lub wznawia aktywny stoper zacierania lub gotowania")

    public static var openAppWhenRun: Bool = false

    public init() {}

    public func perform() async throws -> some ProvidesDialog {
        let sharedDefaults = UserDefaults(suiteName: "group.com.apps4craft.piwowar")
        let isRunning = sharedDefaults?.bool(forKey: "isRunning") ?? false
        let nextState = !isRunning
        sharedDefaults?.set(nextState, forKey: "isRunning")

        let statusText = nextState ? "Stoper warki wznowiony." : "Stoper warki wstrzymany."
        return .result(dialog: IntentDialog(stringLiteral: statusText))
    }
}

@available(iOS 16.0, *)
public struct PiwowarShortcuts: AppShortcutsProvider {
    public static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: CheckBrewTimerIntent(),
            phrases: [
                "Ile do chmielenia w \(.applicationName)?",
                "Sprawdź stoper w \(.applicationName)",
                "Jaki jest etap warki w \(.applicationName)?"
            ],
            shortTitle: "Sprawdź stoper warki",
            systemImageName: "timer"
        )
    }
}
