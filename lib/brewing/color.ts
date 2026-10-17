/**
 * Piwowar (Brewcraft) — Beer Color Engine
 * Tier 2 Dan Morey (1998) SRM & EBC models and realistic craft color mapping
 */

export interface ColorResult {
  mcu: number;
  srm: number;
  ebc: number;
  hexColor: string;
}

/**
 * Calculates Malt Color Units (MCU) from grain bill and batch volume.
 *
 * @param fermentables Array of grains with weight in kg and color in Lovibond
 * @param volumeL Target batch volume in Liters
 */
export function calculateMcu(
  fermentables: Array<{ weight_kg: number; color_lovibond: number }>,
  volumeL: number
): number {
  if (!fermentables || fermentables.length === 0 || volumeL <= 0) return 0.0;

  // MCU = sum(weight_lb * color_lovibond) / volume_gal
  const volumeGal = volumeL * 0.264172;
  let totalGrainProduct = 0;

  for (const f of fermentables) {
    const weightLb = f.weight_kg * 2.20462;
    totalGrainProduct += weightLb * f.color_lovibond;
  }

  const mcu = totalGrainProduct / volumeGal;
  return Number(mcu.toFixed(2));
}

/**
 * Calculates Standard Reference Method (SRM) from MCU using Morey's equation:
 * SRM = 1.4922 * (MCU ^ 0.6859)
 */
export function calculateSrmFromMcu(mcu: number): number {
  if (mcu <= 0) return 0.0;
  const srm = 1.4922 * Math.pow(mcu, 0.6859);
  return Number(srm.toFixed(1));
}

/**
 * Converts SRM to European Brewery Convention (EBC):
 * EBC = SRM * 1.97
 */
export function calculateEbcFromSrm(srm: number): number {
  return Number((srm * 1.97).toFixed(1));
}

/**
 * Maps SRM color index to a realistic physical hex code
 */
export function srmToHex(srm: number): string {
  if (srm <= 2) return '#F8F753'; // Pale Straw
  if (srm <= 3) return '#F6F512'; // Straw
  if (srm <= 4) return '#ECE61A'; // Pale Gold
  if (srm <= 6) return '#D5BC26'; // Deep Gold
  if (srm <= 8) return '#BF923B'; // Pale Amber
  if (srm <= 10) return '#BF813A'; // Medium Amber
  if (srm <= 13) return '#BC6733'; // Deep Amber
  if (srm <= 17) return '#8D4C32'; // Amber-Brown (Copper)
  if (srm <= 20) return '#5D341A'; // Brown
  if (srm <= 24) return '#4E2A0E'; // Dark Brown
  if (srm <= 30) return '#3B1F0B'; // Ruby Black
  if (srm <= 35) return '#261716'; // Deep Black
  return '#1A1110'; // Imperial Stout Black
}

/**
 * Calculates full color parameters for a grain bill
 */
export function calculateRecipeColor(
  fermentables: Array<{ weight_kg: number; color_lovibond: number }>,
  volumeL: number
): ColorResult {
  const mcu = calculateMcu(fermentables, volumeL);
  const srm = calculateSrmFromMcu(mcu);
  const ebc = calculateEbcFromSrm(srm);
  const hexColor = srmToHex(srm);

  return { mcu, srm, ebc, hexColor };
}
