/**
 * Piwowar (Brewcraft) — Brewing Calculation Engine Test Suite
 * Validates 32 deterministic test vectors from docs/brd/fixtures/test-vectors.json + property tests
 */

import * as fc from 'fast-check';
import {
  platoToSg,
  sgToPlato,
  correctHydrometerTemp,
  correctRefractometerFinalGravity,
  calculateAbv,
  calculateApparentAttenuation,
  calculateRealExtract,
  calculateHopIbuTinseth,
  calculateRecipeIbu,
  calculateMcu,
  calculateSrmFromMcu,
  calculateEbcFromSrm,
  calculateRecipeColor,
  calculateStrikeWaterTemp,
  calculateMashWaterVolume,
  calculateResidualCO2,
  calculatePrimingSugar,
  checkBottleBombRisk,
  calculateWaterAdditions,
  calculateSulfateToChlorideRatio,
  calculateLacticAcidAddition,
  scaleRecipe
} from '../lib/brewing';
import testVectorsRaw from '../docs/brd/fixtures/test-vectors.json';
import { FullRecipe } from '../lib/types/domain';

const vectors = testVectorsRaw.vectors;

describe('Brewing Engine — Deterministic Test Vectors (Tom B1..B6 & C2..C3)', () => {
  describe('1. Plato to SG Conversion (VEC-PLATO-01..05)', () => {
    vectors.plato_to_sg.forEach((v) => {
      it(`passes vector ${v.id}: ${v.plato}°P -> ${v.expected_sg} SG`, () => {
        const calculated = platoToSg(v.plato);
        expect(Math.abs(calculated - v.expected_sg)).toBeLessThanOrEqual(v.tolerance);
      });
    });
  });

  describe('2. SG to Plato Conversion (VEC-SG-01..05)', () => {
    vectors.sg_to_plato.forEach((v) => {
      it(`passes vector ${v.id}: ${v.sg} SG -> ${v.expected_plato}°P`, () => {
        const calculated = sgToPlato(v.sg);
        expect(Math.abs(calculated - v.expected_plato)).toBeLessThanOrEqual(v.tolerance);
      });
    });
  });

  describe('3. Hydrometer Temperature Correction (VEC-HYD-01..04)', () => {
    vectors.hydrometer_temp_correction.forEach((v) => {
      it(`passes vector ${v.id}: ${v.measured_sg} at ${v.temp_c}°C -> ${v.corrected_sg} SG`, () => {
        const corrected = correctHydrometerTemp(v.measured_sg, v.temp_c, v.calib_c);
        expect(Math.abs(corrected - v.corrected_sg)).toBeLessThanOrEqual(v.tolerance + 1e-6);
      });
    });
  });

  describe('4. Sean Terrill Refractometer Correction (VEC-REF-01..03)', () => {
    vectors.refractometer_terrill.forEach((v) => {
      it(`passes vector ${v.id}: OB ${v.orig_brix} / FB ${v.final_brix} -> FG ${v.expected_fg_sg}`, () => {
        const res = correctRefractometerFinalGravity(v.orig_brix, v.final_brix, v.wcf, 'linear');
        expect(Math.abs(res.fgSg - v.expected_fg_sg)).toBeLessThanOrEqual(v.tolerance);
      });
    });
  });

  describe('5. ABV Calculation Standard & Hall (VEC-ABV-01..03)', () => {
    vectors.abv_calculation.forEach((v) => {
      it(`passes vector ${v.id}: OG ${v.og} / FG ${v.fg} -> std ${v.expected_abv_standard}% / hall ${v.expected_abv_hall}%`, () => {
        const abvStd = calculateAbv(v.og, v.fg, 'standard');
        const abvHall = calculateAbv(v.og, v.fg, 'hall');

        expect(Math.abs(abvStd - v.expected_abv_standard)).toBeLessThanOrEqual(v.tolerance);
        expect(Math.abs(abvHall - v.expected_abv_hall)).toBeLessThanOrEqual(v.tolerance);
      });
    });
  });

  describe('6. Glenn Tinseth IBU Engine (VEC-IBU-01..03)', () => {
    vectors.ibu_tinseth.forEach((v) => {
      it(`passes vector ${v.id}: ${v.hops_weight_g}g ${v.alpha_pct}% for ${v.boil_mins}m -> ${v.expected_ibu} IBU`, () => {
        const ibu = calculateHopIbuTinseth(
          v.batch_vol_l,
          v.boil_gravity,
          v.hops_weight_g,
          v.alpha_pct,
          v.boil_mins,
          v.form as 'pellet' | 'plug' | 'leaf'
        );
        expect(Math.abs(ibu - v.expected_ibu)).toBeLessThanOrEqual(v.tolerance);
      });
    });
  });

  describe('7. Dan Morey SRM & EBC Color (VEC-SRM-01..04)', () => {
    vectors.srm_ebc_morey.forEach((v) => {
      it(`passes vector ${v.id}: MCU ${v.mcu} -> ${v.expected_srm} SRM / ${v.expected_ebc} EBC`, () => {
        const srm = calculateSrmFromMcu(v.mcu);
        const ebc = calculateEbcFromSrm(srm);

        expect(Math.abs(srm - v.expected_srm)).toBeLessThanOrEqual(v.tolerance);
        expect(Math.abs(ebc - v.expected_ebc)).toBeLessThanOrEqual(v.tolerance);
      });
    });
  });

  describe('8. Strike Water Temperature (VEC-STR-01..03)', () => {
    vectors.strike_water_temp.forEach((v) => {
      it(`passes vector ${v.id}: target ${v.target_mash_c}°C, grain ${v.grain_temp_c}°C, ratio ${v.ratio_l_per_kg} -> ${v.expected_strike_c}°C`, () => {
        const tStrike = calculateStrikeWaterTemp(v.target_mash_c, v.grain_temp_c, v.ratio_l_per_kg);
        expect(Math.abs(tStrike - v.expected_strike_c)).toBeLessThanOrEqual(v.tolerance);
      });
    });
  });

  describe('9. Priming Sugar & Bottling (VEC-PRIME-01..03)', () => {
    vectors.priming_sugar_bottling.forEach((v) => {
      it(`passes vector ${v.id}: ${v.beer_vol_l}L at ${v.temp_c}°C with ${v.sugar_type} -> ${v.expected_grams}g`, () => {
        const res = calculatePrimingSugar(
          v.beer_vol_l,
          v.temp_c,
          v.target_vco2,
          v.sugar_type as 'sucrose' | 'dextrose' | 'dme'
        );
        expect(Math.abs(res.grams - v.expected_grams)).toBeLessThanOrEqual(v.tolerance);
      });
    });
  });
});

describe('Bottle Bomb Blocker & Safety Checks (BR-BOT-002)', () => {
  it('blocks bottling when unfermented extract difference is dangerously high', () => {
    const risk = checkBottleBombRisk(5.0, 2.2, 2.4);
    expect(risk.isBlocked).toBe(true);
    expect(risk.severity).toBe('danger');
    expect(risk.message).toContain('STOP! NIE ROZLEWAJ!');
  });

  it('warns about champagne bottles when target carbonation exceeds 3.2 volumes', () => {
    const risk = checkBottleBombRisk(2.4, 2.4, 3.5);
    expect(risk.isBlocked).toBe(false);
    expect(risk.severity).toBe('warning');
    expect(risk.message).toContain('butelek szampańskich');
  });

  it('allows bottling with safe parameters', () => {
    const risk = checkBottleBombRisk(2.5, 2.4, 2.4);
    expect(risk.isBlocked).toBe(false);
    expect(risk.severity).toBe('safe');
  });
});

describe('Water Chemistry & Lactic Acid Acidification (DEC-14, BR-WODA-001..002)', () => {
  it('calculates mineral profile from gypsum and calcium chloride additions', () => {
    const salts = { gypsumGrams: 4.0, calciumChlorideGrams: 2.0 };
    const water = calculateWaterAdditions(20.0, salts);

    expect(water.ca).toBeGreaterThan(65);
    expect(water.so4).toBeCloseTo(111.6, 1);
    expect(water.cl).toBeCloseTo(48.2, 1);

    const ratio = calculateSulfateToChlorideRatio(water.so4, water.cl);
    expect(ratio.ratio).toBeCloseTo(2.31, 1);
    expect(ratio.profileCategory).toBe('bitter');
    expect(ratio.description).toContain('chmielowy');
  });

  it('calculates 80% lactic acid addition for mash pH drop', () => {
    const acidMl = calculateLacticAcidAddition(15.0, 5.8, 5.3);
    expect(acidMl).toBeGreaterThanOrEqual(3.0);
    expect(acidMl).toBeLessThanOrEqual(4.0);
  });
});

describe('Recipe Scaling Engine (BR-REC-001)', () => {
  it('scales grain and hop quantities proportionally when batch volume is halved', () => {
    const baseRecipe: FullRecipe = {
      id: 'rec-scale-test',
      name: 'Test Scaling',
      target_volume_l: 20.0,
      target_og_sg: 1.05,
      target_fg_sg: 1.01,
      target_ibu: 40.0,
      target_srm: 10.0,
      target_abv: 5.2,
      mash_profile_json: '{}',
      source: 'manual',
      created_at: '',
      updated_at: '',
      fermentables: [
        {
          id: 'f1',
          recipe_id: 'rec-scale-test',
          name: 'Pilzneński',
          weight_kg: 5.0,
          color_lovibond: 2.0,
          potential_sg: 1.036,
          is_mash: 1,
          sort_order: 1
        }
      ],
      hops: [
        {
          id: 'h1',
          recipe_id: 'rec-scale-test',
          name: 'Cascade',
          weight_g: 50.0,
          alpha_acids_pct: 7.0,
          boil_time_mins: 60,
          use_stage: 'boil',
          form: 'pellet',
          sort_order: 1
        }
      ],
      yeasts: []
    };

    const scaled = scaleRecipe(baseRecipe, 10.0);
    expect(scaled.target_volume_l).toBe(10.0);
    expect(scaled.fermentables[0].weight_kg).toBe(2.5);
    expect(scaled.hops[0].weight_g).toBe(25.0);
  });
});

describe('Property-Based Invariants (fast-check)', () => {
  it('Plato to SG conversion is strictly monotonic for valid beer gravities', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 35, noNaN: true }),
        fc.double({ min: 0, max: 35, noNaN: true }),
        (p1, p2) => {
          if (p1 < p2) {
            expect(platoToSg(p1)).toBeLessThanOrEqual(platoToSg(p2));
          }
        }
      )
    );
  });

  it('Tinseth IBU is non-negative and non-decreasing with hop weight', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 100, noNaN: true }),
        fc.double({ min: 1, max: 100, noNaN: true }),
        (w1, w2) => {
          const ibu1 = calculateHopIbuTinseth(20, 1.05, Math.min(w1, w2), 10, 60);
          const ibu2 = calculateHopIbuTinseth(20, 1.05, Math.max(w1, w2), 10, 60);
          expect(ibu1).toBeGreaterThanOrEqual(0);
          expect(ibu2).toBeGreaterThanOrEqual(ibu1);
        }
      )
    );
  });
});
