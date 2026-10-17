/**
 * Piwowar (Brewcraft) — Recipe Scaling Engine (BR-REC-001)
 * Scales fermentables and hops to preserve OG, IBU, and SRM across batch volumes and brewhouse efficiencies.
 */

import { FullRecipe } from '../types/domain';

export function scaleRecipe(
  recipe: FullRecipe,
  newVolumeL: number,
  newEfficiencyPct?: number,
  currentEfficiencyPct: number = 75.0
): FullRecipe {
  if (newVolumeL <= 0 || recipe.target_volume_l <= 0) return { ...recipe };

  const volumeRatio = newVolumeL / recipe.target_volume_l;
  const efficiencyRatio =
    newEfficiencyPct && newEfficiencyPct > 0
      ? currentEfficiencyPct / newEfficiencyPct
      : 1.0;

  const grainRatio = volumeRatio * efficiencyRatio;

  const scaledFermentables = recipe.fermentables.map((f) => ({
    ...f,
    weight_kg: Number((f.weight_kg * grainRatio).toFixed(3))
  }));

  const scaledHops = recipe.hops.map((h) => ({
    ...h,
    weight_g: Number((h.weight_g * volumeRatio).toFixed(1))
  }));

  return {
    ...recipe,
    target_volume_l: newVolumeL,
    fermentables: scaledFermentables,
    hops: scaledHops
  };
}
