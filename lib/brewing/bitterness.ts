/**
 * Piwowar (Brewcraft) — Bitterness & IBU Engine
 * Supports Glenn Tinseth (1997), Jackie Rager (1990), and Mark Garetz (1994) models (Z-008, Z-009).
 */

import { RecipeHop } from '../types/domain';

export type IbuFormula = 'tinseth' | 'rager' | 'garetz';

/**
 * Calculates IBU for an individual hop addition using Glenn Tinseth's model.
 */
export function calculateHopIbuTinseth(
  batchVolL: number,
  boilGravity: number,
  hopsWeightG: number,
  alphaPct: number,
  boilMins: number,
  form: 'pellet' | 'plug' | 'leaf' = 'pellet'
): number {
  if (
    !batchVolL ||
    !hopsWeightG ||
    !alphaPct ||
    isNaN(batchVolL) ||
    isNaN(hopsWeightG) ||
    isNaN(alphaPct) ||
    batchVolL <= 0 ||
    hopsWeightG <= 0 ||
    alphaPct <= 0 ||
    boilMins <= 0
  ) {
    return 0.0;
  }

  const bFactor = 1.65 * Math.pow(0.000125, boilGravity - 1.0);
  const tFactor = (1 - Math.exp(-0.04 * boilMins)) / 4.15;
  const cForm = form === 'pellet' ? 1.03 : 1.0;
  const utilization = bFactor * tFactor * cForm;

  const alphaMg = hopsWeightG * 10 * alphaPct;
  const ibu = (alphaMg * utilization) / batchVolL;

  return Number(ibu.toFixed(1));
}

/**
 * Calculates IBU for an individual hop addition using Jackie Rager's model.
 * Popular for historic homebrewing recipes.
 */
export function calculateHopIbuRager(
  batchVolL: number,
  boilGravity: number,
  hopsWeightG: number,
  alphaPct: number,
  boilMins: number,
  form: 'pellet' | 'plug' | 'leaf' = 'pellet'
): number {
  if (
    !batchVolL ||
    !hopsWeightG ||
    !alphaPct ||
    isNaN(batchVolL) ||
    isNaN(hopsWeightG) ||
    isNaN(alphaPct) ||
    batchVolL <= 0 ||
    hopsWeightG <= 0 ||
    alphaPct <= 0 ||
    boilMins <= 0
  ) {
    return 0.0;
  }

  const tanhArg = (boilMins - 31.32) / 18.27;
  const baseUtilPct = 18.11 + 13.86 * Math.tanh(tanhArg);
  const formFactor = form === 'pellet' ? 1.05 : 1.0;
  const utilization = Math.max(0, (baseUtilPct / 100) * formFactor);

  const gravityAdjustment = boilGravity > 1.050 ? (boilGravity - 1.050) / 0.2 : 0;
  const alphaMg = hopsWeightG * 10 * alphaPct;
  const ibu = (alphaMg * utilization) / (batchVolL * (1 + gravityAdjustment));

  return Number(ibu.toFixed(1));
}

/**
 * Calculates IBU for an individual hop addition using Mark Garetz's model.
 * Factors in hop concentration and gravity factor.
 */
export function calculateHopIbuGaretz(
  batchVolL: number,
  boilGravity: number,
  hopsWeightG: number,
  alphaPct: number,
  boilMins: number,
  form: 'pellet' | 'plug' | 'leaf' = 'pellet'
): number {
  if (
    !batchVolL ||
    !hopsWeightG ||
    !alphaPct ||
    isNaN(batchVolL) ||
    isNaN(hopsWeightG) ||
    isNaN(alphaPct) ||
    batchVolL <= 0 ||
    hopsWeightG <= 0 ||
    alphaPct <= 0 ||
    boilMins <= 0
  ) {
    return 0.0;
  }

  const gf = boilGravity > 1.050 ? (boilGravity - 1.050) / 0.2 + 1.0 : 1.0;
  const hf = (hopsWeightG * alphaPct * 10) / batchVolL * 0.003 + 1.0;
  const combinedFactor = gf * hf;

  const tanhArg = (boilMins - 21.86) / 24.71;
  const baseUtil = Math.max(0, 7.2994 + 15.074 * Math.tanh(tanhArg));
  const formFactor = form === 'pellet' ? 1.05 : 1.0;
  const utilization = (baseUtil / (combinedFactor * 100)) * formFactor;

  const alphaMg = hopsWeightG * 10 * alphaPct;
  const ibu = (alphaMg * utilization) / batchVolL;

  return Number(ibu.toFixed(1));
}

/**
 * Calculates IBU using selected formula.
 */
export function calculateHopIbuByFormula(
  formula: IbuFormula,
  batchVolL: number,
  boilGravity: number,
  hopsWeightG: number,
  alphaPct: number,
  boilMins: number,
  form: 'pellet' | 'plug' | 'leaf' = 'pellet'
): number {
  switch (formula) {
    case 'rager':
      return calculateHopIbuRager(batchVolL, boilGravity, hopsWeightG, alphaPct, boilMins, form);
    case 'garetz':
      return calculateHopIbuGaretz(batchVolL, boilGravity, hopsWeightG, alphaPct, boilMins, form);
    case 'tinseth':
    default:
      return calculateHopIbuTinseth(batchVolL, boilGravity, hopsWeightG, alphaPct, boilMins, form);
  }
}

/**
 * Calculates total IBU for a recipe from an array of hop additions.
 * Skips 'dry_hop' additions which do not impart isomerized alpha acids.
 */
export function calculateRecipeIbu(
  batchVolL: number,
  boilGravity: number,
  hops: Array<Pick<RecipeHop, 'weight_g' | 'alpha_acids_pct' | 'boil_time_mins' | 'form' | 'use_stage'>>,
  formula: IbuFormula = 'tinseth'
): number {
  if (!hops || hops.length === 0 || batchVolL <= 0) return 0.0;

  let totalIbu = 0.0;
  for (const hop of hops) {
    if (hop.use_stage === 'dry_hop') continue;
    const additionIbu = calculateHopIbuByFormula(
      formula,
      batchVolL,
      boilGravity,
      hop.weight_g,
      hop.alpha_acids_pct,
      hop.boil_time_mins,
      hop.form
    );
    totalIbu += additionIbu;
  }

  return Number(totalIbu.toFixed(1));
}
