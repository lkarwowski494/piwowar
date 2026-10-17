/**
 * Piwowar (Brewcraft) — Strike Water Temperature & Volume
 * Tier 1 John Palmer (How to Brew) thermodynamic formula
 */

/**
 * Calculates initial strike water temperature required to achieve target mash rest temperature.
 *
 * @param targetMashTempC Target temperature of first mash step (e.g. 67.0°C)
 * @param grainTempC Ambient temperature of dry grain (default: 20.0°C)
 * @param waterToGrainRatioLPerKg Ratio of water volume to grain mass (default: 3.0 L/kg)
 */
export function calculateStrikeWaterTemp(
  targetMashTempC: number,
  grainTempC: number = 20.0,
  waterToGrainRatioLPerKg: number = 3.0
): number {
  if (waterToGrainRatioLPerKg <= 0) return targetMashTempC;

  // Formula: T_strike = (0.41 / R) * (T_target - T_grain) + T_target
  const tStrike = (0.41 / waterToGrainRatioLPerKg) * (targetMashTempC - grainTempC) + targetMashTempC;
  return Number(tStrike.toFixed(1));
}

/**
 * Calculates initial strike water volume in Liters based on total grain weight and ratio.
 */
export function calculateMashWaterVolume(
  grainWeightKg: number,
  waterToGrainRatioLPerKg: number = 3.0
): number {
  return Number((grainWeightKg * waterToGrainRatioLPerKg).toFixed(1));
}
