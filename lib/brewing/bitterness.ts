/**
 * Piwowar (Brewcraft) — Bitterness & IBU Engine
 * Tier 2 Glenn Tinseth (1997) formula with form correction
 */

import { RecipeHop } from '../types/domain';

/**
 * Calculates IBU for an individual hop addition using Glenn Tinseth's model.
 *
 * @param batchVolL Final volume of the batch in Liters
 * @param boilGravity Specific Gravity of the wort during boiling (e.g. 1.050)
 * @param hopsWeightG Weight of hop addition in grams
 * @param alphaPct Alpha acids in percent (e.g. 10.0 for 10% AA)
 * @param boilMins Duration of boiling in minutes (0 for dry-hop/whirlpool)
 * @param form Hop form: 'pellet', 'plug', or 'leaf'
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

  // Tinseth Bivalence factor for wort gravity
  const bFactor = 1.65 * Math.pow(0.000125, boilGravity - 1.0);

  // Tinseth Time factor
  const tFactor = (1 - Math.exp(-0.04 * boilMins)) / 4.15;

  // Form adjustment factor: pellets yield ~3% higher utilization than whole leaf
  const cForm = form === 'pellet' ? 1.03 : 1.0;

  const utilization = bFactor * tFactor * cForm;

  // IBU = (mg/L of alpha acids) * utilization
  // mg of alpha = hopsWeightG * 1000 * (alphaPct / 100)
  const alphaMg = hopsWeightG * 10 * alphaPct;
  const ibu = (alphaMg * utilization) / batchVolL;

  return Number(ibu.toFixed(1));
}

/**
 * Calculates total IBU for a recipe from an array of hop additions.
 * Skips 'dry_hop' additions which do not impart isomerized alpha acids.
 */
export function calculateRecipeIbu(
  batchVolL: number,
  boilGravity: number,
  hops: Array<Pick<RecipeHop, 'weight_g' | 'alpha_acids_pct' | 'boil_time_mins' | 'form' | 'use_stage'>>
): number {
  if (!hops || hops.length === 0 || batchVolL <= 0) return 0.0;

  let totalIbu = 0.0;
  for (const hop of hops) {
    if (hop.use_stage === 'dry_hop') continue;
    const additionIbu = calculateHopIbuTinseth(
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
