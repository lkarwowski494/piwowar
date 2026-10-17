/**
 * Piwowar (Brewcraft) — Priming Sugar & Bottle Bomb Blocker
 * Tier 1 ASBC / deClerck CO2 solubility and bottle burst protection (ZP-08)
 */

export type PrimingSugarType = 'sucrose' | 'dextrose' | 'dme' | 'honey';

export interface PrimingResult {
  grams: number;
  gramsPerLiter: number;
  gramsPerHalfLiterBottle: number;
  residualVCO2: number;
}

export interface BottleBombRisk {
  isBlocked: boolean;
  severity: 'safe' | 'warning' | 'danger';
  message: string;
}

/**
 * Calculates dissolved residual CO2 (in volumes) based on maximum fermentation temperature.
 * Formula based on ASBC Henry's Law solubility curve.
 */
export function calculateResidualCO2(beerTempC: number): number {
  const tf = beerTempC * 1.8 + 32;
  const vResidual = 3.0378 - 0.050062 * tf + 0.00026555 * Math.pow(tf, 2);
  return Number(Math.max(0.5, vResidual).toFixed(2));
}

/**
 * Calculates the exact weight of priming sugar required for bottle conditioning.
 *
 * @param beerVolumeL Volume of beer to bottle in Liters
 * @param beerTempC Maximum temperature beer reached after active fermentation
 * @param targetVCO2 Target carbonation level in volumes of CO2 (e.g. 2.4 for Pale Ale, 3.0 for Weizen)
 * @param sugarType 'sucrose' (white/cane sugar), 'dextrose' (corn sugar), 'dme' (dry malt extract), 'honey'
 */
export function calculatePrimingSugar(
  beerVolumeL: number,
  beerTempC: number,
  targetVCO2: number,
  sugarType: PrimingSugarType = 'sucrose'
): PrimingResult {
  if (beerVolumeL <= 0 || targetVCO2 <= 0) {
    return { grams: 0, gramsPerLiter: 0, gramsPerHalfLiterBottle: 0, residualVCO2: 0 };
  }

  const residualVCO2 = calculateResidualCO2(beerTempC);
  const deltaVCO2 = Math.max(0, targetVCO2 - residualVCO2);

  // Baseline sucrose: ~3.95g per liter per volume of CO2
  let grams = deltaVCO2 * 3.95 * beerVolumeL;

  switch (sugarType) {
    case 'dextrose':
      grams *= 1.09;
      break;
    case 'dme':
      grams *= 1.3;
      break;
    case 'honey':
      grams *= 1.25;
      break;
    case 'sucrose':
    default:
      break;
  }

  const roundedGrams = Number(grams.toFixed(1));
  const gramsPerLiter = Number((roundedGrams / beerVolumeL).toFixed(2));
  const gramsPerHalfLiterBottle = Number((gramsPerLiter * 0.5).toFixed(2));

  return {
    grams: roundedGrams,
    gramsPerLiter,
    gramsPerHalfLiterBottle,
    residualVCO2
  };
}

/**
 * Bottle Bomb Blocker (BR-BOT-002)
 * Detects unfermented sugars or excessive pressure before bottling to prevent explosive glass rupture.
 */
export function checkBottleBombRisk(
  currentFgPlato: number,
  expectedFgPlato: number,
  targetVCO2: number
): BottleBombRisk {
  // 1. Critical risk: Unfinished fermentation (residual unfermented extract)
  const extractDiff = currentFgPlato - expectedFgPlato;
  if (extractDiff >= 2.0 && currentFgPlato >= 3.5) {
    return {
      isBlocked: true,
      severity: 'danger',
      message: `STOP! NIE ROZLEWAJ! Piwo nie zakończyło fermentacji (${currentFgPlato.toFixed(1)}°P zamiast oczekiwanych ${expectedFgPlato.toFixed(1)}°P). Rozlew w tym stanie grozi natychmiastowym rozerwaniem butelek i obrażeniami ciała!`
    };
  }

  // 2. High pressure risk: Target carbonation exceeds standard bottle limits (> 3.2 vol)
  if (targetVCO2 > 3.2) {
    return {
      isBlocked: false,
      severity: 'warning',
      message: `Uwaga! Planowane nagazowanie (${targetVCO2.toFixed(1)} vol CO2) przekracza wytrzymałość standardowych butelek 0.5L z kapslem (max 3.0 vol). Użyj grubościennych butelek szampańskich lub belgijskich z korkiem i koszyczkiem drucianym.`
    };
  }

  return {
    isBlocked: false,
    severity: 'safe',
    message: 'Parametry fermentacji i nagazowania są w bezpiecznym zakresie fizykochemicznym.'
  };
}
