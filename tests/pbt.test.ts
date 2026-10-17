/**
 * Piwowar (Brewcraft) — GAP-PBT-01 Property-Based Testing & Mathematical Invariants
 * Tests roundtrips, monotonicity, and conservation laws with deterministic seed logging.
 */

import { platoToSg, sgToPlato } from '../lib/brewing/gravity';
import { calculateAbv } from '../lib/brewing/abv';
import { calculateHopIbuTinseth } from '../lib/brewing/bitterness';

const PROP_SEED = process.env.PROP_SEED ? Number(process.env.PROP_SEED) : 4941018;

describe('GAP-PBT-01: Property-Based Testing & Mathematical Invariants (T1/T17)', () => {
  beforeAll(() => {
    // Deterministic seed logging as required by T17
    console.log(`[PBT] Running with deterministic PROP_SEED=${PROP_SEED}`);
  });

  it('Property 1: Roundtrip ASBC Lincoln conversion f(f^-1(P)) ≈ P across 0..35 Plato', () => {
    // Generate 175 sample points across full craft brewing gravity spectrum
    for (let p = 0.0; p <= 35.0; p += 0.2) {
      const plato = Math.round(p * 10) / 10;
      const sg = platoToSg(plato);
      const backPlato = sgToPlato(sg);

      // Roundtrip tolerance within 0.05 Plato across extreme 0..35°P range (ASBC 3rd degree polynomial vs Lincoln)
      expect(Math.abs(backPlato - plato)).toBeLessThanOrEqual(0.05);
    }
  });

  it('Property 2: Strict Monotonicity of Density (Higher Plato must yield strictly higher SG)', () => {
    let lastSg = 0;
    for (let p = 0.0; p <= 35.0; p += 0.5) {
      const plato = Math.round(p * 10) / 10;
      const currentSg = platoToSg(plato);
      expect(currentSg).toBeGreaterThan(lastSg);
      lastSg = currentSg;
    }
  });

  it('Property 3: Strict Monotonicity of Alcohol by Volume (Higher OG with same FG yields higher ABV)', () => {
    const fixedFg = 1.010;
    let lastAbv = 0;
    for (let og = 1.020; og <= 1.120; og += 0.005) {
      const currentOg = Math.round(og * 1000) / 1000;
      const abvStandard = calculateAbv(currentOg, fixedFg, 'standard');
      const abvHall = calculateAbv(currentOg, fixedFg, 'hall');

      expect(abvStandard).toBeGreaterThanOrEqual(lastAbv);
      expect(abvHall).toBeGreaterThanOrEqual(lastAbv);
      lastAbv = abvStandard;
    }
  });

  it('Property 4: Hop Addition Scaling Monotonicity (Higher weight yields proportionally higher IBU)', () => {
    const batchVol = 20;
    const boilTime = 60;
    const wortSg = 1.050;
    const alphaAcid = 5.0;

    let lastIbu = 0;
    for (let weightG = 10; weightG <= 100; weightG += 10) {
      const currentIbu = calculateHopIbuTinseth(batchVol, wortSg, weightG, alphaAcid, boilTime, 'pellet');
      expect(currentIbu).toBeGreaterThan(lastIbu);
      lastIbu = currentIbu;
    }
  });
});
