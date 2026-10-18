/**
 * Piwowar (Brewcraft) — Yeast Starter Calculator
 * Implements White/Zainasheff and Kai Troester stir plate growth models (Z-019).
 */

export type AerationMethod = 'stir_plate' | 'shaken' | 'still';

export interface YeastStarterParams {
  initialCellsBillion: number; // e.g. 100 billion from a liquid yeast pack
  targetCellsBillion: number; // e.g. 220 billion for an Oktoberfest lager
  starterVolumeL?: number; // optional pre-set volume, or calculated from target
  starterGravitySg?: number; // standard 1.037 (9°P)
  aerationMethod?: AerationMethod; // default 'stir_plate'
}

export interface YeastStarterResult {
  starterVolumeL: number;
  dmeGrams: number;
  resultingCellsBillion: number;
  growthFactor: number;
  isTargetMet: boolean;
  cellsShortBillion: number;
}

/**
 * Calculates yeast starter parameters, required DME weight, and resulting cell counts.
 */
export function calculateYeastStarter(params: YeastStarterParams): YeastStarterResult {
  const initialCells = Math.max(1, params.initialCellsBillion || 100);
  const targetCells = Math.max(initialCells, params.targetCellsBillion || initialCells);
  const sg = params.starterGravitySg && params.starterGravitySg >= 1.020 ? params.starterGravitySg : 1.037;
  const method = params.aerationMethod || 'stir_plate';

  // Standard ratio: 100g DME per 1 Liter of water produces ~1.037 wort
  const dmeGramsPerLiter = 100.0 * ((sg - 1.0) / 0.037);

  // Aeration efficiency multiplier relative to continuous stir plate
  const methodMultiplier = method === 'stir_plate' ? 1.0 : method === 'shaken' ? 0.75 : 0.5;

  let volumeL = params.starterVolumeL ?? 0;

  if (volumeL <= 0) {
    // Automatically estimate volume needed to achieve target cells
    const neededGain = targetCells - initialCells;
    if (neededGain <= 0) {
      volumeL = 1.0;
    } else {
      // Approximate 80-120 billion cells gain per Liter on stir plate at standard pitch
      const estimatedGainPerLiter = 90.0 * methodMultiplier;
      volumeL = Math.max(0.5, Number((neededGain / estimatedGainPerLiter).toFixed(2)));
    }
  }

  const dmeGrams = Math.round(volumeL * dmeGramsPerLiter);
  const inocRate = initialCells / volumeL; // billions per liter

  // Troester empirical yield: grams of extract * yield factor (billion cells per gram extract)
  // Base yield factor: ~1.4 for stir plate, adjusted for inoculation rate
  const troesterYield = Math.max(0.35, 1.4 - 0.003 * Math.min(inocRate, 300));
  const cellGainBillion = Math.round(dmeGrams * troesterYield * methodMultiplier * 10) / 10;
  const resultingCells = Math.round((initialCells + cellGainBillion) * 10) / 10;

  const growthFactor = Number((resultingCells / initialCells).toFixed(2));
  const isTargetMet = resultingCells >= targetCells;
  const cellsShort = Math.max(0, Math.round((targetCells - resultingCells) * 10) / 10);

  return {
    starterVolumeL: Number(volumeL.toFixed(2)),
    dmeGrams,
    resultingCellsBillion: resultingCells,
    growthFactor,
    isTargetMet,
    cellsShortBillion: cellsShort
  };
}
