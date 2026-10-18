/**
 * Piwowar (Brewcraft) — Advanced Brewing Engines & Features Test Suite
 * Covers all features across v1.1, v1.2, and v2.0 (Z-009, Z-019, Z-024, Z-025, Z-029, Z-033, Z-046, Z-048, Z-049, Z-050, Z-051, Z-052, Z-053).
 */

import {
  calculateHopIbuTinseth,
  calculateHopIbuRager,
  calculateHopIbuGaretz,
  calculateRecipeIbu,
  calculateYeastStarter,
  detectFermentationEnd,
  calculateIspindelSg,
  solveIspindelPolynomial,
  convertIspindelToTelemetry,
  createSplitBatchRecipes,
  generateBatchLabelSvg,
  calculateHopAging,
  generateBrewCalendarIcs,
  encodeRecipeToQrPayload,
  decodeRecipeFromQrPayload,
  calculateHopStandDipHopping,
  calculateKegPressure,
  calculateSpundingPressure,
  calculateChillerPerformance
} from '../lib/brewing';
import { FullRecipe, Batch } from '../lib/types/domain';

describe('Advanced Brewing Calculations & Utilities', () => {
  // Mock sample recipe
  const sampleRecipe: FullRecipe = {
    id: 'test-recipe-1',
    name: 'Citra Single Hop IPA',
    target_volume_l: 20.0,
    target_og_sg: 1.055,
    target_fg_sg: 1.012,
    target_ibu: 45.0,
    target_srm: 6.0,
    target_abv: 5.6,
    mash_profile_json: '[]',
    source: 'manual',
    created_at: '2026-10-18T00:00:00Z',
    updated_at: '2026-10-18T00:00:00Z',
    fermentables: [
      {
        id: 'f1',
        recipe_id: 'test-recipe-1',
        name: 'Słód pilzneński',
        weight_kg: 4.5,
        color_lovibond: 2.0,
        potential_sg: 1.037,
        is_mash: 1,
        sort_order: 1
      },
      {
        id: 'f2',
        recipe_id: 'test-recipe-1',
        name: 'Słód karmelowy jasny',
        weight_kg: 0.5,
        color_lovibond: 15.0,
        potential_sg: 1.034,
        is_mash: 1,
        sort_order: 2
      }
    ],
    hops: [
      {
        id: 'h1',
        recipe_id: 'test-recipe-1',
        name: 'Citra',
        weight_g: 25,
        alpha_acids_pct: 12.5,
        boil_time_mins: 60,
        use_stage: 'boil',
        form: 'pellet',
        sort_order: 1
      },
      {
        id: 'h2',
        recipe_id: 'test-recipe-1',
        name: 'Citra',
        weight_g: 50,
        alpha_acids_pct: 12.5,
        boil_time_mins: 10,
        use_stage: 'boil',
        form: 'pellet',
        sort_order: 2
      }
    ],
    yeasts: [
      {
        id: 'y1',
        recipe_id: 'test-recipe-1',
        name: 'SafAle US-05',
        form: 'dry',
        attenuation_pct: 78.0,
        min_temp_c: 18.0,
        max_temp_c: 22.0
      }
    ]
  };

  // Mock sample batch
  const sampleBatch: Batch = {
    id: 'test-batch-1',
    recipe_id: 'test-recipe-1',
    batch_number: 14,
    name: 'Warka Testowa Citra IPA',
    brew_date: '2026-10-18',
    status: 'fermenting_primary',
    equipment_snapshot_json: '{}',
    recipe_snapshot_json: JSON.stringify(sampleRecipe),
    measured_og_sg: 1.056,
    measured_fg_sg: 1.012,
    calculated_abv: 5.77,
    created_at: '2026-10-18T00:00:00Z',
    updated_at: '2026-10-18T00:00:00Z'
  };

  // 1. Z-009: IBU Formulas (Tinseth, Rager, Garetz)
  describe('Z-009: IBU Models (Tinseth vs Rager vs Garetz)', () => {
    it('calculates Tinseth, Rager, and Garetz IBU within sensible physics bounds', () => {
      const tinseth = calculateHopIbuTinseth(20, 1.050, 30, 10.0, 60, 'pellet');
      const rager = calculateHopIbuRager(20, 1.050, 30, 10.0, 60, 'pellet');
      const garetz = calculateHopIbuGaretz(20, 1.050, 30, 10.0, 60, 'pellet');

      expect(tinseth).toBeGreaterThan(25);
      expect(tinseth).toBeLessThan(45);
      expect(rager).toBeGreaterThan(25);
      expect(rager).toBeLessThan(50);
      expect(garetz).toBeGreaterThan(15);
      expect(garetz).toBeLessThan(45);
    });

    it('handles recipe IBU dispatcher with Rager formula', () => {
      const recipeIbu = calculateRecipeIbu(20, 1.055, sampleRecipe.hops, 'rager');
      expect(recipeIbu).toBeGreaterThan(30);
    });
  });

  // 2. Z-019: Yeast Starter Calculator
  describe('Z-019: Yeast Starter Calculator', () => {
    it('calculates proper starter volume and DME weight for stir plate', () => {
      const result = calculateYeastStarter({
        initialCellsBillion: 100,
        targetCellsBillion: 200,
        starterGravitySg: 1.037,
        aerationMethod: 'stir_plate'
      });

      expect(result.starterVolumeL).toBeGreaterThanOrEqual(1.0);
      expect(result.dmeGrams).toBeGreaterThan(90);
      expect(result.resultingCellsBillion).toBeGreaterThan(180);
      expect(result.growthFactor).toBeGreaterThan(1.5);
    });
  });

  // 3. Z-024: Attenuation & Fermentation End Detection
  describe('Z-024: Fermentation End Detection', () => {
    it('detects finished fermentation when SG is stable over 48 hours', () => {
      const readings = [
        { recorded_at: '2026-10-14T10:00:00Z', calibrated_sg: 1.054 },
        { recorded_at: '2026-10-15T10:00:00Z', calibrated_sg: 1.025 },
        { recorded_at: '2026-10-16T10:00:00Z', calibrated_sg: 1.012 },
        { recorded_at: '2026-10-17T10:00:00Z', calibrated_sg: 1.012 },
        { recorded_at: '2026-10-18T10:00:00Z', calibrated_sg: 1.012 }
      ];

      const res = detectFermentationEnd(readings, 48, 0.001);
      expect(res.isCompleted).toBe(true);
      expect(res.phase).toBe('completed');
      expect(res.apparentAttenuationPct).toBeGreaterThan(70);
    });

    it('detects active fermentation when SG is still dropping', () => {
      const readings = [
        { recorded_at: '2026-10-17T10:00:00Z', calibrated_sg: 1.050 },
        { recorded_at: '2026-10-18T10:00:00Z', calibrated_sg: 1.030 }
      ];

      const res = detectFermentationEnd(readings, 48, 0.001);
      expect(res.isCompleted).toBe(false);
      expect(res.phase).toBe('active');
    });
  });

  // 4. Z-025: iSpindel Calibration & Adapter
  describe('Z-025: iSpindel Calibration & Adapter', () => {
    it('calculates SG from tilt angle and solves 3-point polynomial', () => {
      const p1 = { angle: 25.0, sg: 1.000 };
      const p2 = { angle: 45.0, sg: 1.045 };
      const p3 = { angle: 65.0, sg: 1.085 };

      const coeffs = solveIspindelPolynomial(p1, p2, p3);
      const calculatedWater = calculateIspindelSg(25.0, coeffs);
      expect(Math.abs(calculatedWater - 1.000)).toBeLessThan(0.005);

      const calculatedHigh = calculateIspindelSg(65.0, coeffs);
      expect(Math.abs(calculatedHigh - 1.085)).toBeLessThan(0.005);
    });

    it('converts iSpindel payload to TiltTelemetry format', () => {
      const telemetry = convertIspindelToTelemetry(
        {
          name: 'iSpindel01',
          angle: 50.0,
          temperature: 20.0,
          temp_units: 'C',
          battery: 4.15
        },
        'batch-xyz'
      );

      expect(telemetry.batch_id).toBe('batch-xyz');
      expect(telemetry.calibrated_temp_c).toBe(20.0);
      expect(telemetry.calibrated_sg).toBeGreaterThan(1.020);
      expect(telemetry.calibrated_plato).toBeGreaterThan(5);
    });
  });

  // 5. Z-029: Split-Batch Engine
  describe('Z-029: Split-Batch Engine', () => {
    it('splits a 20L recipe into two 10L sub-recipes with custom overrides', () => {
      const splitResult = createSplitBatchRecipes(sampleRecipe, [
        {
          suffix: 'Część A (US-05)',
          volumeRatio: 0.5
        },
        {
          suffix: 'Część B (S-04 + Dry Hop)',
          volumeRatio: 0.5,
          yeast: {
            id: 'y-s04',
            recipe_id: 'sub-2',
            name: 'SafAle S-04',
            form: 'dry',
            attenuation_pct: 75.0,
            min_temp_c: 18.0,
            max_temp_c: 22.0
          },
          additionalDryHops: [
            {
              id: 'dh-1',
              recipe_id: 'sub-2',
              name: 'Mosaic',
              weight_g: 50,
              alpha_acids_pct: 12.0,
              boil_time_mins: 0,
              use_stage: 'dry_hop',
              form: 'pellet',
              sort_order: 3
            }
          ]
        }
      ]);

      expect(splitResult.childBatches.length).toBe(2);
      expect(splitResult.childBatches[0].targetVolumeL).toBe(10.0);
      expect(splitResult.childBatches[1].targetVolumeL).toBe(10.0);
      expect(splitResult.childBatches[1].recipe.yeasts[0].name).toBe('SafAle S-04');
      expect(splitResult.childBatches[1].recipe.hops.length).toBe(3);
    });
  });

  // 6. Z-033: Batch Printable Label
  describe('Z-033: Printable Batch Label Generator', () => {
    it('generates valid vector SVG markup with brewery and batch details', () => {
      const svg = generateBatchLabelSvg(sampleBatch, { breweryName: 'Browar Rzemieślniczy' });
      expect(svg).toContain('<svg');
      expect(svg).toContain('Browar Rzemieślniczy');
      expect(svg).toContain(sampleBatch.name);
      expect(svg).toContain('WARKA #14');
      expect(svg).toContain('5.8% ABV');
      expect(svg).toContain('</svg>');
    });
  });

  // 7. Z-046: Hop Aging & Degradation Calculator
  describe('Z-046: Hop Aging Calculator', () => {
    it('calculates alpha degradation over time based on temperature and packaging', () => {
      const fresh = calculateHopAging({
        initialAlphaPct: 12.0,
        monthsInStorage: 0
      });
      expect(fresh.remainingAlphaPct).toBe(12.0);
      expect(fresh.compensationMultiplier).toBe(1.0);

      const freezer12m = calculateHopAging({
        initialAlphaPct: 12.0,
        monthsInStorage: 12,
        storageTemp: 'freezer',
        packaging: 'vacuum_foil'
      });
      expect(freezer12m.remainingAlphaPct).toBeGreaterThan(11.0);

      const roomTemp12m = calculateHopAging({
        initialAlphaPct: 12.0,
        monthsInStorage: 12,
        storageTemp: 'room',
        packaging: 'open'
      });
      expect(roomTemp12m.remainingAlphaPct).toBeLessThan(freezer12m.remainingAlphaPct);
      expect(roomTemp12m.compensationMultiplier).toBeGreaterThan(1.2);
    });
  });

  // 8. Z-048: Brew Calendar .ics
  describe('Z-048: Brew Calendar ICS Generator', () => {
    it('generates RFC 5545 compliant iCalendar string with key milestones', () => {
      const ics = generateBrewCalendarIcs(sampleBatch);
      expect(ics).toContain('BEGIN:VCALENDAR');
      expect(ics).toContain('BEGIN:VEVENT');
      expect(ics).toContain('Dzień Warzenia');
      expect(ics).toContain('Chmielenie na zimno');
      expect(ics).toContain('Butelkowanie');
      expect(ics).toContain('END:VCALENDAR');
    });
  });

  // 9. Z-049: P2P Recipe QR Exchange
  describe('Z-049: Peer-to-Peer Recipe QR Exchange', () => {
    it('encodes and decodes full recipe losslessly round-trip', () => {
      const qrPayload = encodeRecipeToQrPayload(sampleRecipe);
      expect(qrPayload).toContain('piwowar://recipe?d=');

      const decoded = decodeRecipeFromQrPayload(qrPayload);
      expect(decoded).not.toBeNull();
      expect(decoded?.name).toBe(sampleRecipe.name);
      expect(decoded?.target_volume_l).toBe(sampleRecipe.target_volume_l);
      expect(decoded?.fermentables.length).toBe(sampleRecipe.fermentables.length);
      expect(decoded?.hops.length).toBe(sampleRecipe.hops.length);
      expect(decoded?.yeasts.length).toBe(sampleRecipe.yeasts.length);
    });
  });

  // 10. Z-050: Hop Stand & Dip Hopping
  describe('Z-050: Hop Stand & Dip Hopping', () => {
    it('models reduced bitterness and high aroma retention at lower temperatures', () => {
      const boilHop = calculateHopStandDipHopping({
        technique: 'whirlpool',
        tempC: 100,
        durationMins: 20,
        hopWeightG: 50,
        alphaPct: 12.0,
        batchVolL: 20
      });

      const hopStand80 = calculateHopStandDipHopping({
        technique: 'hop_stand',
        tempC: 80,
        durationMins: 20,
        hopWeightG: 50,
        alphaPct: 12.0,
        batchVolL: 20
      });

      const dipHop65 = calculateHopStandDipHopping({
        technique: 'dip_hopping',
        tempC: 65,
        durationMins: 20,
        hopWeightG: 50,
        alphaPct: 12.0,
        batchVolL: 20
      });

      // Bitterness decreases as temperature drops
      expect(boilHop.addedIbu).toBeGreaterThan(hopStand80.addedIbu);
      expect(hopStand80.addedIbu).toBeGreaterThan(dipHop65.addedIbu);

      // Oil retention increases as temperature drops
      expect(dipHop65.oilRetentionPct).toBeGreaterThan(hopStand80.oilRetentionPct);
      expect(hopStand80.oilRetentionPct).toBeGreaterThan(boilHop.oilRetentionPct);
    });
  });

  // 11. Z-051: Kegging & Force Carbonation
  describe('Z-051: Kegging & Force Carbonation', () => {
    it('calculates proper head pressure in PSI and bar for standard serving temperature', () => {
      const keg = calculateKegPressure({
        targetVco2: 2.4,
        kegTempC: 4.0
      });

      expect(keg.equilibriumPsi).toBeGreaterThan(9.0);
      expect(keg.equilibriumPsi).toBeLessThan(14.0);
      expect(keg.equilibriumBar).toBeGreaterThan(0.6);
      expect(keg.equilibriumBar).toBeLessThan(1.0);
      expect(keg.burstSchedule.fast24hPsi).toBeGreaterThan(keg.equilibriumPsi);
    });
  });

  // 12. Z-052: Spunding & Pressure Fermentation
  describe('Z-052: Spunding Valve Calculator', () => {
    it('determines spunding setpoint and optimal gravity to seal the fermenter', () => {
      const spunding = calculateSpundingPressure({
        targetVco2: 2.5,
        fermentationTempC: 12.0, // Lager fermentation
        expectedFgSg: 1.010
      });

      expect(spunding.spundingPressureBar).toBeGreaterThan(0.8);
      expect(spunding.spundingPressureBar).toBeLessThan(1.6);
      expect(spunding.sealAtSg).toBeGreaterThan(1.012);
      expect(spunding.sealAtPlatoAboveFg).toBeGreaterThan(0.5);
    });
  });

  // 13. Z-053: Wort Chiller Performance & Water Efficiency
  describe('Z-053: Wort Chiller Performance', () => {
    it('calculates chilling time, water usage, and flags warm tap water', () => {
      const coldTap = calculateChillerPerformance({
        wortVolumeL: 20,
        tapWaterTempC: 12,
        targetPitchTempC: 18,
        chillerType: 'immersion',
        stirringWhirlpool: true
      });

      expect(coldTap.isTapWaterTooWarm).toBe(false);
      expect(coldTap.coolingTimeMinutes).toBeGreaterThan(5);
      expect(coldTap.coolingTimeMinutes).toBeLessThan(35);
      expect(coldTap.totalWaterUsedL).toBeGreaterThan(30);

      const warmTap = calculateChillerPerformance({
        wortVolumeL: 20,
        tapWaterTempC: 22,
        targetPitchTempC: 18
      });
      expect(warmTap.isTapWaterTooWarm).toBe(true);
    });
  });
});
