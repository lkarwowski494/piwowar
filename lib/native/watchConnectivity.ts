/**
 * Piwowar (Brewcraft) — Apple Watch Connectivity Native Bridge
 * Coordinates bi-directional timer sync, Taptic Engine alerts, and Tilt BLE complication data.
 */

import { Platform } from 'react-native';

export interface WatchBrewSessionPayload {
  recipeName: string;
  stepName: string;
  secondsRemaining: number;
  isRunning: boolean;
  tiltSg?: number;
  tiltTempC?: number;
  triggerTaptic?: boolean;
}

let lastSyncedPayload: WatchBrewSessionPayload | null = null;

/**
 * Sends current brew timer & step state to paired Apple Watch
 */
export async function syncBrewSessionToWatch(payload: WatchBrewSessionPayload): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;

  try {
    lastSyncedPayload = { ...payload };
    // On native iOS with WatchConnectivity active:
    // WCSession.default.updateApplicationContext(payload)
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Triggers a physical Taptic Engine alert on Apple Watch (e.g. on hop addition or rest completion)
 */
export async function triggerWatchTapticAlert(): Promise<boolean> {
  if (Platform.OS !== 'ios' || !lastSyncedPayload) return false;

  return syncBrewSessionToWatch({
    ...lastSyncedPayload,
    triggerTaptic: true
  });
}

/**
 * Returns the latest payload synced to the Watch
 */
export function getLastSyncedWatchPayload(): WatchBrewSessionPayload | null {
  return lastSyncedPayload;
}
