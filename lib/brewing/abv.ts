/**
 * Piwowar (Brewcraft) — Alcohol By Volume (ABV) & Attenuation
 * Tier 1 ASBC Standard and Hall (1995) advanced equations
 */

import { sgToPlato } from './gravity';

/**
 * Calculates Alcohol By Volume (% ABV)
 *
 * @param og Original Gravity (e.g. 1.050)
 * @param fg Final Gravity (e.g. 1.010)
 * @param method 'standard' ((OG - FG) * 131.25) or 'hall' (Michael Hall 1995 advanced formula)
 */
export function calculateAbv(
  og: number,
  fg: number,
  method: 'standard' | 'hall' = 'standard'
): number {
  if (og <= fg || og <= 1.0) return 0.0;

  if (method === 'hall') {
    // Michael L. Hall 1995 formula for high-gravity brews
    // ABW = 76.08 * (OG - FG) / (1.775 - OG)
    // ABV = ABW / 0.794 (density of ethanol)
    const abw = (76.08 * (og - fg)) / (1.775 - og);
    const abv = abw / 0.794;
    return Number(abv.toFixed(2));
  }

  // Standard ASBC formula
  const abv = (og - fg) * 131.25;
  return Number(abv.toFixed(2));
}

/**
 * Calculates Apparent Attenuation (% AA)
 */
export function calculateApparentAttenuation(og: number, fg: number): number {
  if (og <= 1.0 || fg >= og) return 0.0;
  const aa = ((og - fg) / (og - 1.0)) * 100;
  return Number(aa.toFixed(1));
}

/**
 * Calculates Real Extract (°Plato) using Balling's relation
 */
export function calculateRealExtract(og: number, fg: number): number {
  const pInitial = sgToPlato(og);
  const pFinal = sgToPlato(fg);
  const re = 0.1808 * pInitial + 0.8192 * pFinal;
  return Number(re.toFixed(2));
}
