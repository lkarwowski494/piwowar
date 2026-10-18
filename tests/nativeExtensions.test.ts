/**
 * Piwowar (Brewcraft) — Native Apple Extensions Test Suite
 * Verifies Live Activities state coordination and Apple Watch WatchConnectivity payload sync
 */

import {
  startBrewLiveActivity,
  updateBrewLiveActivity,
  endBrewLiveActivity,
  isLiveActivityActive
} from '../lib/native/liveActivities';

import {
  syncBrewSessionToWatch,
  triggerWatchTapticAlert,
  getLastSyncedWatchPayload
} from '../lib/native/watchConnectivity';

describe('Native Apple Extensions Suite (ActivityKit & watchOS)', () => {
  describe('Live Activities Coordinator', () => {
    beforeEach(async () => {
      await endBrewLiveActivity();
    });

    it('starts, updates, and ends a Live Activity session', async () => {
      expect(isLiveActivityActive()).toBe(false);

      const activityId = await startBrewLiveActivity({
        recipeName: 'AIPA Citra Mosaic',
        batchVolumeL: 20.0,
        stageName: 'Gotowanie',
        stepName: 'Gotowanie brzeczki (60 min)',
        durationSeconds: 3600,
        isRunning: true,
        nextHopName: 'Citra',
        nextHopWeightG: 30
      });

      expect(activityId).toBeTruthy();
      expect(isLiveActivityActive()).toBe(true);

      const updated = await updateBrewLiveActivity({
        stepName: 'Chmielenie 15 min',
        secondsRemaining: 900,
        isRunning: true,
        nextHopName: 'Mosaic',
        nextHopWeightG: 50
      });
      expect(updated).toBe(true);

      const ended = await endBrewLiveActivity();
      expect(ended).toBe(true);
      expect(isLiveActivityActive()).toBe(false);
    });
  });

  describe('Apple Watch WatchConnectivity Coordinator', () => {
    it('synchronizes timer and Tilt BLE data to watch payload', async () => {
      const payload = {
        recipeName: 'Grodziskie Tradycyjne',
        stepName: 'Przerwa maltozowa (65°C)',
        secondsRemaining: 1800,
        isRunning: true,
        tiltSg: 1.032,
        tiltTempC: 19.5
      };

      const success = await syncBrewSessionToWatch(payload);
      expect(success).toBe(true);

      const synced = getLastSyncedWatchPayload();
      expect(synced).toEqual(payload);
    });

    it('sets triggerTaptic flag when dispatching wrist vibration alert', async () => {
      await syncBrewSessionToWatch({
        recipeName: 'Stout Owsiany',
        stepName: 'Chmielenie',
        secondsRemaining: 60,
        isRunning: true
      });

      const tapticSuccess = await triggerWatchTapticAlert();
      expect(tapticSuccess).toBe(true);

      const synced = getLastSyncedWatchPayload();
      expect(synced?.triggerTaptic).toBe(true);
    });
  });
});
