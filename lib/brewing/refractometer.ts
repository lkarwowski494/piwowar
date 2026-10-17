/**
 * Piwowar (Brewcraft) — Refractometer Final Gravity Correction
 * DEC-08: Sean Terrill 2011 models with Wort Correction Factor (WCF = 1.04)
 */

import { sgToPlato } from './gravity';

export interface RefractometerResult {
  fgSg: number;
  fgPlato: number;
}

/**
 * Calculates true Final Gravity from refractometer readings in the presence of alcohol.
 *
 * @param origBrix Initial wort gravity measured in °Brix prior to fermentation
 * @param finalBrix Refractometer reading measured in °Brix during or after fermentation
 * @param wcf Wort Correction Factor (default: 1.04)
 * @param model 'linear' (default, Sean Terrill 2011 linear fit) or 'cubic' (Sean Terrill 2011 cubic fit)
 */
export function correctRefractometerFinalGravity(
  origBrix: number,
  finalBrix: number,
  wcf: number = 1.04,
  model: 'linear' | 'cubic' = 'linear'
): RefractometerResult {
  const obCorr = origBrix / wcf;
  const fbCorr = finalBrix / wcf;

  let fg: number;

  if (model === 'cubic') {
    fg =
      1.0 -
      0.0044993 * obCorr +
      0.011774 * fbCorr +
      0.00027581 * Math.pow(obCorr, 2) -
      0.0012717 * Math.pow(fbCorr, 2) -
      0.00000728 * Math.pow(obCorr, 3) +
      0.000063293 * Math.pow(fbCorr, 3);
  } else {
    // Sean Terrill 2011 linear regression fit
    fg = 1.0 - 0.00085683 * obCorr + 0.0034941 * fbCorr;
  }

  const roundedSg = Number(fg.toFixed(4));
  const plato = sgToPlato(roundedSg);

  return {
    fgSg: roundedSg,
    fgPlato: plato
  };
}
