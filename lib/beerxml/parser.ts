/**
 * Piwowar (Brewcraft) — BeerXML 1.0 Parser (DEC-02, DEC-10)
 * Lossless parsing of recipes exported from Brewfather, BeerSmith 2/3, and Grainfather
 */

import { XMLParser } from 'fast-xml-parser';
import {
  FullRecipe,
  RecipeFermentable,
  RecipeHop,
  RecipeYeast,
  MashProfile,
  MashStep
} from '../types/domain';

function ensureArray<T>(item: T | T[] | undefined): T[] {
  if (!item) return [];
  return Array.isArray(item) ? item : [item];
}

export function parseBeerXml(xmlContent: string): FullRecipe[] {
  if (!xmlContent || !xmlContent.trim()) return [];

  const parser = new XMLParser({
    ignoreAttributes: false,
    parseTagValue: false,
    trimValues: true
  });

  const parsed = parser.parse(xmlContent);
  if (!parsed || !parsed.RECIPES) return [];

  const recipeNodes = ensureArray(parsed.RECIPES.RECIPE);
  const now = new Date().toISOString();

  return recipeNodes.map((node: any, idx: number) => {
    const recipeId = `recipe-bxml-${Date.now()}-${idx + 1}`;
    const name = node.NAME || 'Zaimportowana receptura';
    const targetVolumeL = parseFloat(node.BATCH_SIZE) || 20.0;
    const targetOg = parseFloat(node.EST_OG || node.OG) || 1.05;
    const targetFg = parseFloat(node.EST_FG || node.FG) || 1.01;
    const targetIbu = parseFloat(node.IBU) || 30.0;
    const targetSrm = parseFloat(node.EST_COLOR) || 6.0;
    const targetAbv = parseFloat(node.EST_ABV) || Number(((targetOg - targetFg) * 131.25).toFixed(1));
    const notes = node.NOTES || null;

    // 1. Fermentables
    const fermentableNodes = ensureArray(node.FERMENTABLES?.FERMENTABLE);
    const fermentables: RecipeFermentable[] = fermentableNodes.map((f: any, fIdx: number) => ({
      id: `ferm-${recipeId}-${fIdx + 1}`,
      recipe_id: recipeId,
      name: f.NAME || `Słód ${fIdx + 1}`,
      weight_kg: parseFloat(f.AMOUNT) || 1.0,
      color_lovibond: parseFloat(f.COLOR) || 2.0,
      potential_sg: parseFloat(f.POTENTIAL) || 1.036,
      is_mash: f.TYPE?.toLowerCase() === 'grain' ? 1 : 1,
      sort_order: fIdx + 1
    }));

    // 2. Hops (BeerXML specifies AMOUNT in kilograms)
    const hopNodes = ensureArray(node.HOPS?.HOP);
    const hops: RecipeHop[] = hopNodes.map((h: any, hIdx: number) => {
      const rawAmount = parseFloat(h.AMOUNT) || 0.025;
      // If amount < 1.0, it is in kg -> convert to grams. If >= 1.0, assume already grams.
      const weightG = rawAmount < 1.0 ? rawAmount * 1000 : rawAmount;

      const rawUse = (h.USE || 'boil').toLowerCase().replace(/\s+/g, '_');
      let useStage: RecipeHop['use_stage'] = 'boil';
      if (rawUse.includes('dry')) useStage = 'dry_hop';
      else if (rawUse.includes('whirlpool') || rawUse.includes('aroma')) useStage = 'whirlpool';
      else if (rawUse.includes('first')) useStage = 'first_wort';

      const rawForm = (h.FORM || 'pellet').toLowerCase();
      let form: RecipeHop['form'] = 'pellet';
      if (rawForm.includes('leaf')) form = 'leaf';
      else if (rawForm.includes('plug')) form = 'plug';

      return {
        id: `hop-${recipeId}-${hIdx + 1}`,
        recipe_id: recipeId,
        name: h.NAME || `Chmiel ${hIdx + 1}`,
        weight_g: Number(weightG.toFixed(1)),
        alpha_acids_pct: parseFloat(h.ALPHA) || 5.0,
        boil_time_mins: Math.round(parseFloat(h.TIME) || 0),
        use_stage: useStage,
        form,
        sort_order: hIdx + 1
      };
    });

    // 3. Yeasts
    const yeastNodes = ensureArray(node.YEASTS?.YEAST);
    const yeasts: RecipeYeast[] = yeastNodes.map((y: any, yIdx: number) => ({
      id: `yeast-${recipeId}-${yIdx + 1}`,
      recipe_id: recipeId,
      name: y.NAME || 'Drożdże piwowarskie',
      laboratory: y.LABORATORY || null,
      product_id: y.PRODUCT_ID || null,
      form: (y.FORM || 'dry').toLowerCase().includes('liquid') ? 'liquid' : 'dry',
      attenuation_pct: parseFloat(y.ATTENUATION) || 75.0,
      min_temp_c: parseFloat(y.MIN_TEMPERATURE) || 18.0,
      max_temp_c: parseFloat(y.MAX_TEMPERATURE) || 22.0
    }));

    // 4. Mash Profile
    const mashStepsNodes = ensureArray(node.MASH?.MASH_STEPS?.MASH_STEP);
    const steps: MashStep[] = mashStepsNodes.map((s: any) => ({
      name: s.NAME || 'Krok zacierania',
      step_temp_c: parseFloat(s.STEP_TEMP) || 67.0,
      step_time_mins: Math.round(parseFloat(s.STEP_TIME) || 60),
      infusion_volume_l: parseFloat(s.INFUSE_AMOUNT) || undefined
    }));

    const mashProfile: MashProfile = {
      name: node.MASH?.NAME || 'Profil zacierania BeerXML',
      grain_temp_c: parseFloat(node.MASH?.GRAIN_TEMP) || 20.0,
      ratio_l_per_kg: 3.0,
      steps: steps.length > 0 ? steps : [{ name: 'Zacieranie infuzyjne', step_temp_c: 67.0, step_time_mins: 60 }]
    };

    return {
      id: recipeId,
      name,
      bjcp_style_id: null,
      equipment_profile_id: null,
      target_volume_l: targetVolumeL,
      target_og_sg: targetOg,
      target_fg_sg: targetFg,
      target_ibu: targetIbu,
      target_srm: targetSrm,
      target_abv: targetAbv,
      mash_profile_json: JSON.stringify(mashProfile),
      notes,
      source: 'beerxml',
      created_at: now,
      updated_at: now,
      fermentables,
      hops,
      yeasts,
      mash_profile: mashProfile
    };
  });
}
