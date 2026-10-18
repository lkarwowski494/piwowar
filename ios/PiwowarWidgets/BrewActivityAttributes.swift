//
//  BrewActivityAttributes.swift
//  Piwowar (Brewcraft) — ActivityKit Live Activities
//  Created for iOS 16.1+ Lock Screen and Dynamic Island
//

import ActivityKit
import Foundation

public struct BrewActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        public var stageName: String
        public var stepName: String
        public var targetTimestamp: Date
        public var secondsRemaining: Int
        public var isRunning: Bool
        public var nextHopName: String?
        public var nextHopWeightG: Double?
        public var nextHopSecondsRemaining: Int?
        public var currentTempC: Double?

        public init(
            stageName: String,
            stepName: String,
            targetTimestamp: Date,
            secondsRemaining: Int,
            isRunning: Bool,
            nextHopName: String? = nil,
            nextHopWeightG: Double? = nil,
            nextHopSecondsRemaining: Int? = nil,
            currentTempC: Double? = nil
        ) {
            self.stageName = stageName
            self.stepName = stepName
            self.targetTimestamp = targetTimestamp
            self.secondsRemaining = secondsRemaining
            self.isRunning = isRunning
            self.nextHopName = nextHopName
            self.nextHopWeightG = nextHopWeightG
            self.nextHopSecondsRemaining = nextHopSecondsRemaining
            self.currentTempC = currentTempC
        }
    }

    public var recipeName: String
    public var batchVolumeL: Double

    public init(recipeName: String, batchVolumeL: Double) {
        self.recipeName = recipeName
        self.batchVolumeL = batchVolumeL
    }
}
