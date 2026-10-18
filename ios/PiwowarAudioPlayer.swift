//
//  PiwowarAudioPlayer.swift
//  Piwowar (Brewcraft) — Native AVFoundation PCM Audio Player
//  Guaranteed playback in silent mode without third-party pods.
//

import Foundation
import AVFoundation

@objc(PiwowarAudioPlayer)
public class PiwowarAudioPlayer: NSObject {
    private static var audioPlayer: AVAudioPlayer?

    @objc(playAlert:)
    public static func playAlert(type: String) {
        let soundName: String
        switch type {
        case "bell":
            soundName = "workshop_bell"
        case "chime":
            soundName = "hop_chime"
        default:
            soundName = "kettle_gong"
        }

        guard let soundURL = Bundle.main.url(forResource: soundName, withExtension: "wav") else {
            return
        }

        do {
            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: [.duckOthers])
            try AVAudioSession.sharedInstance().setActive(true)
            audioPlayer = try AVAudioPlayer(contentsOf: soundURL)
            audioPlayer?.prepareToPlay()
            audioPlayer?.play()
        } catch {
            print("[PiwowarAudioPlayer] Error playing alert sound: \(error)")
        }
    }

    @objc
    public static func requiresMainQueueSetup() -> Bool {
        return false
    }
}
