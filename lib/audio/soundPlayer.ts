/**
 * Piwowar (Brewcraft) — Workshop-Proof PCM Audio Alerts Player
 * High-penetration acoustic alerts (Kettle Gong, Workshop Bell, Hop Chime)
 * PlaysInSilentModeIOS via native AVFoundation to ensure alarms sound over boiling pots even if muted.
 */

import { NativeModules, Platform } from 'react-native';

export type BrewSoundType = 'gong' | 'bell' | 'chime';

let soundEnabled = true;

/**
 * Enables or disables audio alerts in brew day and calculators.
 */
export function setBrewSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
}

/**
 * Checks whether audio alerts are currently enabled.
 */
export function isBrewSoundEnabled(): boolean {
  return soundEnabled;
}

/**
 * Plays a high-clarity workshop PCM sound alert.
 */
export async function playBrewAlert(type: BrewSoundType): Promise<void> {
  if (!soundEnabled) return;

  try {
    const { PiwowarAudioPlayer } = NativeModules;
    if (Platform.OS === 'ios' && PiwowarAudioPlayer && typeof PiwowarAudioPlayer.playAlert === 'function') {
      PiwowarAudioPlayer.playAlert(type);
      return;
    }

    // Web / fallback: HTML5 Audio if available in runtime
    if (typeof Audio !== 'undefined' && typeof window !== 'undefined') {
      const soundFile =
        type === 'bell'
          ? '/sounds/workshop_bell.wav'
          : type === 'chime'
          ? '/sounds/hop_chime.wav'
          : '/sounds/kettle_gong.wav';
      const audio = new (window as any).Audio(soundFile);
      audio.play().catch(() => {});
    }
  } catch (err) {
    // In headless / test environments, audio playback gracefully no-ops
  }
}

export const playKettleGong = () => playBrewAlert('gong');
export const playWorkshopBell = () => playBrewAlert('bell');
export const playHopChime = () => playBrewAlert('chime');
