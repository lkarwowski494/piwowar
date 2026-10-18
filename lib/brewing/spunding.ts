/**
 * Piwowar (Brewcraft) — Spunding Valve & Pressure Fermentation Calculator
 * Natural CO2 carbonation under pressure in Unitanks / Kegs (Z-052).
 */

import { calculateKegPressure } from './kegging';
import { sgToPlato, platoToSg } from './gravity';

export interface SpundingParams {
  targetVco2: number;        // e.g. 2.5 volumes of CO2
  fermentationTempC: number; // e.g. 12°C for lager, 19°C for ale
  expectedFgSg: number;     // e.g. 1.010 SG
}

export interface SpundingResult {
  spundingPressureBar: number;
  spundingPressurePsi: number;
  sealAtPlatoAboveFg: number;
  sealAtSg: number;
  expectedFgSg: number;
  fermentationTempC: number;
  targetVco2: number;
  instructions: string;
}

/**
 * Calculates the required spunding valve pressure setting and optimal sealing gravity.
 */
export function calculateSpundingPressure(params: SpundingParams): SpundingResult {
  const vco2 = Math.max(1.2, Math.min(4.0, params.targetVco2 || 2.5));
  const tempC = Math.max(0, Math.min(30, params.fermentationTempC ?? 12));
  const expectedFg = Math.max(0.998, Math.min(1.050, params.expectedFgSg || 1.010));

  // Determine equilibrium pressure at fermentation temp to maintain target CO2
  const kegCalc = calculateKegPressure({
    targetVco2: vco2,
    kegTempC: tempC
  });

  const spundingPressureBar = kegCalc.equilibriumBar;
  const spundingPressurePsi = kegCalc.equilibriumPsi;

  // Natural CO2 generation:
  // 1 g of fermented extract produces ~0.49g CO2 (~0.25 volumes of CO2 per Liter)
  // At atmospheric pressure, warm beer holds ~0.8 to 1.1 vol CO2 naturally
  const residualDissolvedVol = 1.013 * Math.exp(-0.035 * tempC);
  const co2DeficitVol = Math.max(0.2, vco2 - residualDissolvedVol);

  // Extract needed to produce deficit: ~0.8°P per 1 volume of CO2
  const sealPlatoDelta = Number((co2DeficitVol * 0.78).toFixed(1));

  const expectedFgPlato = sgToPlato(expectedFg);
  const sealPlato = expectedFgPlato + sealPlatoDelta;
  const sealAtSg = Number(platoToSg(sealPlato).toFixed(3));

  const instructions = `Zamknij zawór spundingowy, gdy brzeczka osiągnie ${sealAtSg} SG (${sealPlato.toFixed(1)}°P), czyli ok. ${sealPlatoDelta}°P przed końcem fermentacji. Ustaw zawór na ${spundingPressureBar} bar (${spundingPressurePsi} PSI).`;

  return {
    spundingPressureBar,
    spundingPressurePsi,
    sealAtPlatoAboveFg: sealPlatoDelta,
    sealAtSg,
    expectedFgSg: expectedFg,
    fermentationTempC: tempC,
    targetVco2: vco2,
    instructions
  };
}
