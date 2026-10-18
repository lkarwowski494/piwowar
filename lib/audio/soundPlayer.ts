/**
 * Piwowar (Brewcraft) — Workshop-Proof PCM Audio Alerts Player
 * High-penetration acoustic alerts (Kettle Gong, Workshop Bell, Hop Chime)
 * PlaysInSilentModeIOS: true to ensure alarms sound over boiling pots even if muted.
 */

import { Audio } from 'expo-av';
import { Platform } from 'react-native';

export type BrewSoundType = 'gong' | 'bell' | 'chime';

let isAudioInitialized = false;
let soundEnabled = true;

// Sound assets mapping
const SOUND_ASSETS: Record<BrewSoundType, any> = {
  gong: require('../../assets/sounds/kettle_gong.wav'),
  bell: require('../../assets/sounds/workshop_bell.wav'),
  chime: require('../../assets/sounds/hop_chime.wav')
};

async function ensureAudioMode(): Promise<boolean> {
  if (Platform.OS === 'web') return true;
  if (isAudioInitialized) return true;

  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true
    });
    isAudioInitialized = true;
    return true;
  } catch (error) {
    // Graceful fallback for non-audio or test environments
    return false;
  }
}

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
    await ensureAudioMode();
    const asset = SOUND_ASSETS[type];
    if (!asset) return;

    const { sound } = await Audio.Sound.createAsync(
      asset,
      { shouldPlay: true, volume: 1.0 }
    );

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
      }
    });
  } catch (err) {
    // In test / headless environments, audio playback gracefully no-ops
  }
}

export const playKettleGong = () => playBrewAlert('gong');
export const playWorkshopBell = () => playBrewAlert('bell');
export const playHopChime = () => playBrewAlert('chime');
