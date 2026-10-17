/**
 * Piwowar (Brewcraft) — Hydrometer Temperature Correction
 * Tier 1 NIST / Palmer hydrometer calibration polynomial
 */

/**
 * Calculates corrected Specific Gravity based on sample temperature and hydrometer calibration temperature.
 * Default calibration temperature is 20°C (68°F).
 */
export function correctHydrometerTemp(
  measuredSg: number,
  tempC: number,
  calibC: number = 20.0
): number {
  const tf = tempC * 1.8 + 32;
  const tcal = calibC * 1.8 + 32;

  const poly = (t: number) =>
    1.313454 -
    0.132674 * t +
    0.002057793 * Math.pow(t, 2) -
    0.000002627634 * Math.pow(t, 3);

  const deltaPoints = poly(tf) - poly(tcal);
  const corrected = measuredSg + deltaPoints / 1000;
  return Number(corrected.toFixed(4));
}
