/**
 * Piwowar (Brewcraft) — Hop Stand & Dip Hopping Extraction Engine
 * Models temperature-dependent isomerization and essential oil retention (Z-050).
 */

export type LateHopTechnique = 'whirlpool' | 'hop_stand' | 'dip_hopping';

export interface LateHopParams {
  technique: LateHopTechnique;
  tempC: number; // e.g. 80°C for hop stand, 65°C for dip hop
  durationMins: number; // e.g. 20-30 mins
  hopWeightG: number; // e.g. 100g
  alphaPct: number; // e.g. 13%
  batchVolL: number; // e.g. 20L
  oilContentMlPer100g?: number; // e.g. 2.0 ml/100g (typical for Citra/Mosaic)
}

export interface LateHopResult {
  effectiveUtilizationPct: number;
  addedIbu: number;
  oilRetentionPct: number;
  estimatedOilRetainedMl: number;
  aromaScore: number; // 0 to 100
  recommendation: string;
}

/**
 * Calculates bitterness contribution and aroma oil retention for low-temperature hop additions.
 */
export function calculateHopStandDipHopping(params: LateHopParams): LateHopResult {
  const temp = Math.max(50, Math.min(100, params.tempC || 80));
  const time = Math.max(1, params.durationMins || 20);
  const weight = Math.max(0, params.hopWeightG || 0);
  const alpha = Math.max(0, params.alphaPct || 0);
  const vol = Math.max(1, params.batchVolL || 20);
  const oilContent = params.oilContentMlPer100g ?? 1.8;

  if (weight <= 0 || alpha <= 0) {
    return {
      effectiveUtilizationPct: 0,
      addedIbu: 0,
      oilRetentionPct: 0,
      estimatedOilRetainedMl: 0,
      aromaScore: 0,
      recommendation: 'Brak chmielu do ekstrakcji.'
    };
  }

  // Isomerization efficiency relative to 100°C boiling
  // Empirical curve: exponential decline below 100°C (Palmer/Tinseth research)
  // At 100°C: ~1.0; at 90°C: ~0.50; at 80°C: ~0.15; at 70°C: ~0.04; at 60°C: ~0.01
  let tempFactor = 0;
  if (temp >= 100) {
    tempFactor = 1.0;
  } else if (temp >= 90) {
    tempFactor = 0.50 + (temp - 90) * 0.05;
  } else if (temp >= 80) {
    tempFactor = 0.15 + (temp - 80) * 0.035;
  } else if (temp >= 70) {
    tempFactor = 0.04 + (temp - 70) * 0.011;
  } else {
    tempFactor = Math.max(0.005, (temp - 50) * 0.002);
  }

  // Time factor (saturation after ~30-40 mins)
  const timeFactor = (1 - Math.exp(-0.04 * time)) / 4.15;
  const effectiveUtilization = Number((tempFactor * timeFactor * 1.03 * 100).toFixed(2));

  // IBU = mg/L alpha * utilization
  const alphaMg = weight * 10 * alpha;
  const addedIbu = Number(((alphaMg * (effectiveUtilization / 100)) / vol).toFixed(1));

  // Essential volatile oils retention (inversely related to temperature)
  // At 100°C boil: ~10% retention; at 80°C: ~70%; at 65°C: ~90%
  let oilRetentionPct = 0;
  if (temp >= 95) {
    oilRetentionPct = 15;
  } else if (temp >= 85) {
    oilRetentionPct = 45;
  } else if (temp >= 75) {
    oilRetentionPct = 72;
  } else if (temp >= 65) {
    oilRetentionPct = 88;
  } else {
    oilRetentionPct = 95;
  }

  // Dip hopping extra boost for glycoside breakdown: +5%
  if (params.technique === 'dip_hopping') {
    oilRetentionPct = Math.min(98, oilRetentionPct + 5);
  }

  const totalOilInGrams = (weight / 100.0) * oilContent;
  const retainedOilMl = Number((totalOilInGrams * (oilRetentionPct / 100.0)).toFixed(2));

  // Aroma score based on retention and dosage rate (g/L)
  const rateGramsPerL = weight / vol;
  const aromaScore = Math.min(100, Math.round(rateGramsPerL * 10 * (oilRetentionPct / 100.0)));

  let recommendation = '';
  if (params.technique === 'dip_hopping') {
    recommendation = `Dip hopping w ${temp}°C: maksymalna ekspresja owocowych terpenów przy znikomej goryczce (+${addedIbu} IBU).`;
  } else if (temp <= 75) {
    recommendation = `Hop stand w niskiej temperaturze (${temp}°C): zachowano ${oilRetentionPct}% olejków aromatycznych.`;
  } else {
    recommendation = `Klasyczny whirlpool (${temp}°C): zbalansowana ekstrakcja goryczki (+${addedIbu} IBU) i aromatu.`;
  }

  return {
    effectiveUtilizationPct: effectiveUtilization,
    addedIbu,
    oilRetentionPct,
    estimatedOilRetainedMl: retainedOilMl,
    aromaScore,
    recommendation
  };
}
