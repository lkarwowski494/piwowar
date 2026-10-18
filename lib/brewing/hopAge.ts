/**
 * Piwowar (Brewcraft) — Hop Age & Alpha Acid Degradation Calculator
 * Models storage loss based on ASBC Hop Storage Index (HSI), temperature and packaging (Z-046).
 */

export type StorageTemp = 'freezer' | 'fridge' | 'room' | 'warm';
export type StoragePackaging = 'vacuum_foil' | 'ziploc' | 'open';
export type HopForm = 'pellet' | 'plug' | 'leaf';

export interface HopAgeParams {
  initialAlphaPct: number; // e.g. 12.5% AA at harvest
  monthsInStorage: number; // e.g. 18 months
  storageTemp?: StorageTemp; // default 'fridge'
  packaging?: StoragePackaging; // default 'vacuum_foil'
  form?: HopForm; // default 'pellet'
  hsi?: number; // Hop Storage Index: default ~0.25 (typical for moderate keeping hops like Cascade)
}

export interface HopAgeResult {
  remainingAlphaPct: number;
  totalLossPct: number;
  compensationMultiplier: number;
  adjustedGramsForTargetAlpha: (targetAlphaGrams: number) => number;
}

/**
 * Calculates degraded alpha acid percentage and recipe compensation factor for aged hops.
 */
export function calculateHopAging(params: HopAgeParams): HopAgeResult {
  const initialAlpha = Math.max(0.1, params.initialAlphaPct || 10.0);
  const months = Math.max(0, params.monthsInStorage || 0);

  if (months === 0) {
    return {
      remainingAlphaPct: initialAlpha,
      totalLossPct: 0.0,
      compensationMultiplier: 1.0,
      adjustedGramsForTargetAlpha: (targetGrams: number) => targetGrams
    };
  }

  // Temperature factor
  const tempMultipliers: Record<StorageTemp, number> = {
    freezer: 0.15, // -18°C
    fridge: 0.40,  // +4°C
    room: 1.00,    // +20°C
    warm: 2.10     // +30°C
  };
  const tempFactor = tempMultipliers[params.storageTemp || 'fridge'];

  // Packaging barrier factor
  const packagingMultipliers: Record<StoragePackaging, number> = {
    vacuum_foil: 0.50, // Mylar foil with vacuum / inert gas
    ziploc: 1.00,      // Standard poly bag
    open: 2.20         // Ambient air exposure
  };
  const pkgFactor = packagingMultipliers[params.packaging || 'vacuum_foil'];

  // Form factor (pellets degrade slower than whole leaf cones due to density)
  const formFactor = params.form === 'leaf' ? 1.20 : params.form === 'plug' ? 1.05 : 0.85;

  // Hop Storage Index baseline (standard ~0.25 to 0.45)
  const hsi = params.hsi && params.hsi >= 0.15 ? params.hsi : 0.28;

  // Monthly exponential decay constant
  const k = 0.025 * tempFactor * pkgFactor * formFactor * (hsi / 0.28);
  const remainingFraction = Math.max(0.1, Math.exp(-k * months));

  const remainingAlpha = Number((initialAlpha * remainingFraction).toFixed(2));
  const totalLoss = Number(((1 - remainingFraction) * 100).toFixed(1));
  const multiplier = Number((initialAlpha / remainingAlpha).toFixed(2));

  return {
    remainingAlphaPct: remainingAlpha,
    totalLossPct: totalLoss,
    compensationMultiplier: multiplier,
    adjustedGramsForTargetAlpha: (targetGrams: number) => Number((targetGrams * multiplier).toFixed(1))
  };
}
