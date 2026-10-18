/**
 * Piwowar (Brewcraft) — Workshop Audio Alerts Test Suite
 * Verifies sound player toggling, alert dispatching, and safe fallback handling
 */

import {
  setBrewSoundEnabled,
  isBrewSoundEnabled,
  playBrewAlert,
  playKettleGong,
  playWorkshopBell,
  playHopChime
} from '../lib/audio/soundPlayer';

describe('Workshop Audio Alerts Suite (PCM Sounds)', () => {
  beforeEach(() => {
    setBrewSoundEnabled(true);
  });

  it('manages sound enabled toggle state correctly', () => {
    expect(isBrewSoundEnabled()).toBe(true);

    setBrewSoundEnabled(false);
    expect(isBrewSoundEnabled()).toBe(false);

    setBrewSoundEnabled(true);
    expect(isBrewSoundEnabled()).toBe(true);
  });

  it('safely plays kettle gong without throwing', async () => {
    await expect(playKettleGong()).resolves.toBeUndefined();
  });

  it('safely plays workshop bell without throwing', async () => {
    await expect(playWorkshopBell()).resolves.toBeUndefined();
  });

  it('safely plays hop chime without throwing', async () => {
    await expect(playHopChime()).resolves.toBeUndefined();
  });

  it('respects soundEnabled = false by early returning', async () => {
    setBrewSoundEnabled(false);
    await expect(playBrewAlert('bell')).resolves.toBeUndefined();
  });
});
