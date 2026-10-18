/**
 * Piwowar (Brewcraft) — Kegging & Force Carbonation Calculator
 * Models CO2 equilibrium head pressure in kegs via Henry's law and temperature curves (Z-051).
 */

export interface KeggingParams {
  targetVco2: number; // e.g. 2.4 volumes of CO2
  kegTempC: number;   // e.g. 4°C inside kegerator
}

export interface KeggingResult {
  equilibriumPsi: number;
  equilibriumBar: number;
  targetVco2: number;
  tempC: number;
  burstSchedule: {
    fast24hPsi: number;
    fast24hBar: number;
    gentle48hPsi: number;
    gentle48hBar: number;
    servingPsi: number;
    servingBar: number;
  };
  styleRecommendation: string;
}

/**
 * Calculates regulator head pressure in PSI and bar for forced carbonation in a keg.
 */
export function calculateKegPressure(params: KeggingParams): KeggingResult {
  const vco2 = Math.max(1.0, Math.min(4.5, params.targetVco2 || 2.4));
  const tempC = Math.max(-2, Math.min(25, params.kegTempC ?? 4));
  const tempF = tempC * 1.8 + 32.0;

  // Henry's Law / de Clerck equation for CO2 solubility in beer
  const pPsi =
    -16.6999 -
    0.0101059 * tempF +
    0.00116512 * Math.pow(tempF, 2) +
    0.173354 * tempF * vco2 +
    4.24267 * vco2 -
    0.0684226 * Math.pow(vco2, 2);

  const equilibriumPsi = Number(Math.max(1.0, pPsi).toFixed(1));
  const equilibriumBar = Number((equilibriumPsi * 0.0689476).toFixed(2));

  // Burst carbonation profiles
  const fast24hPsi = Number((equilibriumPsi + 18.0).toFixed(1));
  const fast24hBar = Number((fast24hPsi * 0.0689476).toFixed(2));

  const gentle48hPsi = Number((equilibriumPsi + 8.0).toFixed(1));
  const gentle48hBar = Number((gentle48hPsi * 0.0689476).toFixed(2));

  let styleRecommendation = '';
  if (vco2 <= 1.9) {
    styleRecommendation = 'Niskie nagazowanie: Cask Ale, English Bitter, Mild, Stout';
  } else if (vco2 <= 2.5) {
    styleRecommendation = 'Standardowe nagazowanie: American IPA, APA, Porter, Lager';
  } else if (vco2 <= 3.0) {
    styleRecommendation = 'Wysokie nagazowanie: Pilsner, Hefeweizen, Saison';
  } else {
    styleRecommendation = 'Bardzo wysokie nagazowanie: Weizenbock, Belgian Strong Ale, Lambic';
  }

  return {
    equilibriumPsi,
    equilibriumBar,
    targetVco2: vco2,
    tempC,
    burstSchedule: {
      fast24hPsi,
      fast24hBar,
      gentle48hPsi,
      gentle48hBar,
      servingPsi: equilibriumPsi,
      servingBar: equilibriumBar
    },
    styleRecommendation
  };
}
