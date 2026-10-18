/**
 * Piwowar (Brewcraft) — Wort Chiller & Water Efficiency Engine
 * Heat exchange thermodynamics for immersion, counterflow, and plate chillers (Z-053).
 */

export type ChillerType = 'immersion' | 'counterflow' | 'plate';

export interface ChillerParams {
  wortVolumeL: number;
  tapWaterTempC: number;
  targetPitchTempC?: number; // default 18°C
  chillerType?: ChillerType; // default 'immersion'
  tapFlowRateLpm?: number;  // Liters per minute, default 6 L/min
  stirringWhirlpool?: boolean; // Whirlpool stirring increases immersion efficiency by ~40%
}

export interface ChillerResult {
  coolingTimeMinutes: number;
  totalWaterUsedL: number;
  waterToWortRatio: number;
  efficiencyScore: number; // 0-100%
  isTapWaterTooWarm: boolean;
  notes: string;
}

/**
 * Calculates cooling duration, water volume, and efficiency of wort chilling.
 */
export function calculateChillerPerformance(params: ChillerParams): ChillerResult {
  const wortVol = Math.max(1, params.wortVolumeL || 20);
  const tapTemp = Math.max(1, Math.min(30, params.tapWaterTempC ?? 14));
  const targetTemp = Math.max(5, Math.min(30, params.targetPitchTempC ?? 18));
  const flowRate = Math.max(1, params.tapFlowRateLpm ?? 6);
  const chiller = params.chillerType || 'immersion';
  const stirring = params.stirringWhirlpool ?? true;

  const isTapWaterTooWarm = tapTemp >= targetTemp;

  // Base thermal exchange efficiency coefficient
  let baseEfficiency = 0.50;
  if (chiller === 'plate') {
    baseEfficiency = 0.88;
  } else if (chiller === 'counterflow') {
    baseEfficiency = 0.75;
  } else {
    // Immersion chiller
    baseEfficiency = stirring ? 0.62 : 0.40;
  }

  // Temperature delta from boiling (100°C) down to target
  const startTemp = 100.0;
  const deltaT = startTemp - targetTemp;

  // Approach temperature (how close tap water is to target)
  const approachTemp = Math.max(0.5, targetTemp - tapTemp);
  const approachPenalty = approachTemp < 3 ? 1.8 : approachTemp < 6 ? 1.3 : 1.0;

  // Estimated total water required: Q = m * c * deltaT / (c * waterDeltaT * eff)
  // Approximate average water temp rise:
  const avgWaterRise = (startTemp - tapTemp) * 0.45 * baseEfficiency;
  const effectiveWaterRise = Math.max(2.0, avgWaterRise);

  const waterNeededL = Math.round((wortVol * deltaT) / effectiveWaterRise * approachPenalty);
  const coolingTimeMins = Number((waterNeededL / flowRate).toFixed(1));
  const waterToWort = Number((waterNeededL / wortVol).toFixed(1));

  const efficiencyScore = Math.min(
    100,
    Math.max(10, Math.round(baseEfficiency * 100 - (approachPenalty - 1.0) * 30))
  );

  let notes = '';
  if (isTapWaterTooWarm) {
    notes = `Temperatura kranówki (${tapTemp}°C) uniemożliwia schłodzenie do ${targetTemp}°C bez wstępnej chłodnicy z lodem (pre-chiller).`;
  } else if (chiller === 'plate') {
    notes = `Chłodnica płytowa: bardzo szybkie schłodzenie w jednym przepływie (czas: ${coolingTimeMins} min).`;
  } else if (stirring) {
    notes = `Chłodnica zanurzeniowa z mieszaniem brzeczki: wysoka oszczędność wody (stosunek ${waterToWort}:1 L/L).`;
  } else {
    notes = `Chłodnica zanurzeniowa bez mieszania: wolna wymiana ciepła. Warto delikatnie mieszać sterylną łyżką.`;
  }

  return {
    coolingTimeMinutes: coolingTimeMins,
    totalWaterUsedL: waterNeededL,
    waterToWortRatio: waterToWort,
    efficiencyScore,
    isTapWaterTooWarm,
    notes
  };
}
