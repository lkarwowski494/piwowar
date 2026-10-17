/**
 * Piwowar (Brewcraft) — Water Chemistry & Mineral Profile Engine
 * DEC-14: 6-ion modeling (Ca, Mg, Na, SO4, Cl, HCO3), SO4/Cl ratio, and 80% Lactic Acid pH calculator
 */

import { WaterProfile } from '../types/domain';

export interface WaterSaltsInput {
  gypsumGrams?: number; // CaSO4
  calciumChlorideGrams?: number; // CaCl2
  epsomSaltGrams?: number; // MgSO4
  saltGrams?: number; // NaCl
  bakingSodaGrams?: number; // NaHCO3
}

export interface WaterRatioResult {
  ratio: number;
  profileCategory: 'very_bitter' | 'bitter' | 'balanced' | 'malty' | 'very_malty';
  description: string;
}

/**
 * Calculates mineral ion concentrations in ppm (mg/L) resulting from brewing salt additions.
 * Baseline ion profile can be provided (default: 0 ppm for pure RO water).
 */
export function calculateWaterAdditions(
  waterVolumeL: number,
  salts: WaterSaltsInput,
  baseWater: WaterProfile = { ca: 0, mg: 0, na: 0, so4: 0, cl: 0, hco3: 0 }
): WaterProfile {
  if (waterVolumeL <= 0) return { ...baseWater };

  const gypsum = salts.gypsumGrams ?? 0;
  const cacl2 = salts.calciumChlorideGrams ?? 0;
  const epsom = salts.epsomSaltGrams ?? 0;
  const nacl = salts.saltGrams ?? 0;
  const nahco3 = salts.bakingSodaGrams ?? 0;

  // PPM contributions per gram per Liter:
  // Gypsum (CaSO4*2H2O): Ca 232.6 mg/g, SO4 557.9 mg/g
  // CaCl2 (CaCl2*2H2O): Ca 272.4 mg/g, Cl 482.3 mg/g
  // Epsom (MgSO4*7H2O): Mg 98.6 mg/g, SO4 389.6 mg/g
  // Table salt (NaCl): Na 393.4 mg/g, Cl 606.6 mg/g
  // Baking soda (NaHCO3): Na 273.7 mg/g, HCO3 726.3 mg/g

  const addedCa = (gypsum * 232.6 + cacl2 * 272.4) / waterVolumeL;
  const addedMg = (epsom * 98.6) / waterVolumeL;
  const addedNa = (nacl * 393.4 + nahco3 * 273.7) / waterVolumeL;
  const addedSo4 = (gypsum * 557.9 + epsom * 389.6) / waterVolumeL;
  const addedCl = (cacl2 * 482.3 + nacl * 606.6) / waterVolumeL;
  const addedHco3 = (nahco3 * 726.3) / waterVolumeL;

  return {
    ca: Number((baseWater.ca + addedCa).toFixed(1)),
    mg: Number((baseWater.mg + addedMg).toFixed(1)),
    na: Number((baseWater.na + addedNa).toFixed(1)),
    so4: Number((baseWater.so4 + addedSo4).toFixed(1)),
    cl: Number((baseWater.cl + addedCl).toFixed(1)),
    hco3: Number((baseWater.hco3 + addedHco3).toFixed(1))
  };
}

/**
 * Calculates the Sulfate to Chloride (SO4 / Cl) ratio and qualitative beer profile.
 */
export function calculateSulfateToChlorideRatio(so4: number, cl: number): WaterRatioResult {
  if (cl <= 0) {
    return {
      ratio: Number(so4.toFixed(2)),
      profileCategory: 'very_bitter',
      description: 'Bardzo wytrawny, silny akcent chmielowy i goryczkowy'
    };
  }

  const ratio = Number((so4 / cl).toFixed(2));

  if (ratio >= 2.0) {
    return {
      ratio,
      profileCategory: 'bitter',
      description: 'Profil chmielowy / wytrawny — akcentuje czystą, rześką goryczkę (IPA, APA)'
    };
  }
  if (ratio >= 0.8) {
    return {
      ratio,
      profileCategory: 'balanced',
      description: 'Profil zbalansowany — harmonijna równowaga słodu i chmielu (Pilsner, Koelsch)'
    };
  }
  return {
    ratio,
    profileCategory: 'malty',
    description: 'Profil pełny / słodowy — aksamitne ciało, gładkość (Hazy IPA, Stout, Porter)'
  };
}

/**
 * Calculates 80% Lactic Acid addition (ml) required to adjust mash pH from current to target.
 * Standard brewing baseline: ~0.88 ml per 10 L per 0.1 pH reduction.
 */
export function calculateLacticAcidAddition(
  mashWaterVolumeL: number,
  currentPh: number,
  targetPh: number = 5.3,
  concentrationPct: number = 80.0
): number {
  if (currentPh <= targetPh || mashWaterVolumeL <= 0) return 0.0;

  const deltaPh = currentPh - targetPh;
  // Baseline ml of 80% lactic acid per Liter of mash water per 0.1 delta pH: ~0.044 ml (BR-WODA-002)
  const acidMl = (mashWaterVolumeL / 10.0) * (deltaPh / 0.1) * 0.44 * (80.0 / concentrationPct);
  return Number(acidMl.toFixed(1));
}
