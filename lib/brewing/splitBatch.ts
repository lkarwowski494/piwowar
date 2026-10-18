/**
 * Piwowar (Brewcraft) — Split-Batch Engine
 * Splits a single brew-day batch into multiple divergent fermentation parts (Z-029).
 */

import { FullRecipe, RecipeHop, RecipeYeast, Batch } from '../types/domain';
import { scaleRecipeVolume } from './recipeScaling';

export interface SplitBatchVariation {
  suffix: string; // e.g. "Part A - US-05"
  volumeRatio: number; // e.g. 0.5 (50% of batch)
  yeast?: RecipeYeast;
  additionalDryHops?: RecipeHop[];
  notes?: string;
}

export interface SplitBatchResult {
  childBatches: Array<{
    name: string;
    targetVolumeL: number;
    recipe: FullRecipe;
    partIndex: number;
    totalParts: number;
  }>;
}

/**
 * Splits a full recipe into divergent sub-recipes for independent fermentation vessels.
 */
export function createSplitBatchRecipes(
  baseRecipe: FullRecipe,
  variations: SplitBatchVariation[]
): SplitBatchResult {
  if (!variations || variations.length === 0) {
    return {
      childBatches: [
        {
          name: baseRecipe.name,
          targetVolumeL: baseRecipe.target_volume_l,
          recipe: baseRecipe,
          partIndex: 1,
          totalParts: 1
        }
      ]
    };
  }

  // Normalize ratios so they sum to 1.0
  const totalRatio = variations.reduce((sum, v) => sum + (v.volumeRatio > 0 ? v.volumeRatio : 1), 0);

  const childBatches = variations.map((variation, index) => {
    const normalizedRatio = (variation.volumeRatio > 0 ? variation.volumeRatio : 1) / totalRatio;
    const childVolume = Number((baseRecipe.target_volume_l * normalizedRatio).toFixed(1));

    // Scale recipe ingredients proportionally
    const scaled = scaleRecipeVolume(baseRecipe, childVolume);

    // Apply custom yeast override if specified
    const yeasts = variation.yeast ? [variation.yeast] : [...scaled.yeasts];

    // Append custom dry-hop additions if specified
    const hops = [...scaled.hops];
    if (variation.additionalDryHops && variation.additionalDryHops.length > 0) {
      hops.push(...variation.additionalDryHops);
    }

    const childRecipe: FullRecipe = {
      ...scaled,
      id: `${baseRecipe.id}-split-${index + 1}`,
      name: `${baseRecipe.name} — ${variation.suffix || `Część ${index + 1}`}`,
      target_volume_l: childVolume,
      yeasts,
      hops,
      notes: [baseRecipe.notes, variation.notes].filter(Boolean).join('\n---\n')
    };

    return {
      name: childRecipe.name,
      targetVolumeL: childVolume,
      recipe: childRecipe,
      partIndex: index + 1,
      totalParts: variations.length
    };
  });

  return { childBatches };
}
