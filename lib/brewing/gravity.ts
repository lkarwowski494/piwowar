/**
 * Piwowar (Brewcraft) — Gravity Conversions
 * ASBC Lincoln equation and ASBC polynomial conversions between Plato and Specific Gravity
 */

/**
 * Converts degrees Plato (°P / °Blg) to Specific Gravity (SG)
 * Uses Lincoln / ASBC equation: SG = 1 + (P / (258.6 - (P / 258.2) * 227.1))
 */
export function platoToSg(plato: number): number {
  if (plato <= 0) return 1.0;
  const sg = 1 + plato / (258.6 - (plato / 258.2) * 227.1);
  return Number(sg.toFixed(4));
}

/**
 * Converts Specific Gravity (SG) to degrees Plato (°P / °Blg)
 * Uses ASBC polynomial: P = -616.868 + 1111.14*SG - 630.272*SG^2 + 135.997*SG^3
 */
export function sgToPlato(sg: number): number {
  if (sg <= 1.0) return 0.0;
  const p =
    -616.868 +
    1111.14 * sg -
    630.272 * Math.pow(sg, 2) +
    135.997 * Math.pow(sg, 3);
  return Number(Math.max(0, p).toFixed(2));
}

/**
 * Converts Brix to Plato (nearly 1:1 in unfermented wort, standard ratio ~1.000 to 1.04)
 */
export function brixToPlato(brix: number, wcf: number = 1.04): number {
  return Number((brix / wcf).toFixed(2));
}

/**
 * Converts Plato to Brix
 */
export function platoToBrix(plato: number, wcf: number = 1.04): number {
  return Number((plato * wcf).toFixed(2));
}
