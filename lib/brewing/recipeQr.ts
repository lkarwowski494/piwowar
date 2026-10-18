/**
 * Piwowar (Brewcraft) — Peer-to-Peer Recipe Sharing via QR Code
 * Encodes and decodes full recipes into compact offline payloads (Z-049).
 */

import { FullRecipe, RecipeFermentable, RecipeHop, RecipeYeast } from '../types/domain';

export interface CompactRecipePayload {
  v: number; // Schema version: 1
  n: string; // Name
  vol: number; // Target volume (L)
  og: number;
  fg: number;
  ibu: number;
  srm: number;
  abv: number;
  f: Array<{ n: string; w: number; c: number }>; // Fermentables
  h: Array<{ n: string; w: number; a: number; t: number; s: string; f?: string }>; // Hops
  y: Array<{ n: string; att: number }>; // Yeasts
  notes?: string;
}

/**
 * Encodes a FullRecipe into a compact URI-safe payload for QR code generation.
 */
export function encodeRecipeToQrPayload(recipe: FullRecipe): string {
  const compact: CompactRecipePayload = {
    v: 1,
    n: recipe.name,
    vol: recipe.target_volume_l,
    og: recipe.target_og_sg,
    fg: recipe.target_fg_sg,
    ibu: recipe.target_ibu,
    srm: recipe.target_srm,
    abv: recipe.target_abv,
    f: (recipe.fermentables || []).map(f => ({
      n: f.name,
      w: f.weight_kg,
      c: f.color_lovibond
    })),
    h: (recipe.hops || []).map(h => ({
      n: h.name,
      w: h.weight_g,
      a: h.alpha_acids_pct,
      t: h.boil_time_mins,
      s: h.use_stage,
      f: h.form
    })),
    y: (recipe.yeasts || []).map(y => ({
      n: y.name,
      att: y.attenuation_pct
    })),
    notes: recipe.notes || undefined
  };

  const jsonStr = JSON.stringify(compact);
  // Base64 encoding in browser / react-native
  let base64 = '';
  if (typeof btoa !== 'undefined') {
    base64 = btoa(unescape(encodeURIComponent(jsonStr)));
  } else {
    base64 = Buffer.from(jsonStr, 'utf8').toString('base64');
  }

  return `piwowar://recipe?d=${encodeURIComponent(base64)}`;
}

/**
 * Decodes a scanned QR payload or URL back into a FullRecipe object.
 */
export function decodeRecipeFromQrPayload(payloadOrUrl: string): FullRecipe | null {
  if (!payloadOrUrl) return null;

  try {
    let base64 = payloadOrUrl.trim();
    if (base64.includes('d=')) {
      const match = base64.match(/d=([^&]+)/);
      if (match && match[1]) {
        base64 = decodeURIComponent(match[1]);
      }
    }

    let jsonStr = '';
    if (typeof atob !== 'undefined') {
      jsonStr = decodeURIComponent(escape(atob(base64)));
    } else {
      jsonStr = Buffer.from(base64, 'base64').toString('utf8');
    }

    const parsed: CompactRecipePayload = JSON.parse(jsonStr);
    if (!parsed || !parsed.n || !parsed.vol) return null;

    const recipeId = `qr-${Date.now()}`;
    const now = new Date().toISOString();

    const fermentables: RecipeFermentable[] = (parsed.f || []).map((f, idx) => ({
      id: `${recipeId}-f-${idx}`,
      recipe_id: recipeId,
      name: f.n,
      weight_kg: f.w,
      color_lovibond: f.c,
      potential_sg: 1.036,
      is_mash: 1,
      sort_order: idx
    }));

    const hops: RecipeHop[] = (parsed.h || []).map((h, idx) => ({
      id: `${recipeId}-h-${idx}`,
      recipe_id: recipeId,
      name: h.n,
      weight_g: h.w,
      alpha_acids_pct: h.a,
      boil_time_mins: h.t,
      use_stage: (h.s as any) || 'boil',
      form: (h.f as any) || 'pellet',
      sort_order: idx
    }));

    const yeasts: RecipeYeast[] = (parsed.y || []).map((y, idx) => ({
      id: `${recipeId}-y-${idx}`,
      recipe_id: recipeId,
      name: y.n,
      form: 'dry',
      attenuation_pct: y.att,
      min_temp_c: 18.0,
      max_temp_c: 22.0
    }));

    return {
      id: recipeId,
      name: parsed.n,
      target_volume_l: parsed.vol,
      target_og_sg: parsed.og,
      target_fg_sg: parsed.fg,
      target_ibu: parsed.ibu,
      target_srm: parsed.srm,
      target_abv: parsed.abv,
      mash_profile_json: '[]',
      notes: parsed.notes || 'Zaimportowano z kodu QR (P2P)',
      source: 'manual',
      created_at: now,
      updated_at: now,
      fermentables,
      hops,
      yeasts
    };
  } catch (err) {
    return null;
  }
}
