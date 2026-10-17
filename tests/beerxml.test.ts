/**
 * Piwowar (Brewcraft) — BeerXML 1.0 Parser & Exporter Test Suite
 * Validates lossless import and export of recipes (DEC-02, DEC-10)
 */

import { parseBeerXml, exportRecipeToBeerXml } from '../lib/beerxml';
import { FullRecipe } from '../lib/types/domain';

const SAMPLE_BEERXML = `<?xml version="1.0" encoding="UTF-8"?>
<RECIPES>
  <RECIPE>
    <NAME>Grodziskie Legend</NAME>
    <VERSION>1</VERSION>
    <TYPE>All Grain</TYPE>
    <BREWER>Mistrz Grodziski</BREWER>
    <BATCH_SIZE>20.0</BATCH_SIZE>
    <BOIL_SIZE>24.0</BOIL_SIZE>
    <BOIL_TIME>60.0</BOIL_TIME>
    <EFFICIENCY>78.0</EFFICIENCY>
    <EST_OG>1.031</EST_OG>
    <EST_FG>1.008</EST_FG>
    <EST_COLOR>2.5</EST_COLOR>
    <IBU>25.0</IBU>
    <EST_ABV>3.0</EST_ABV>
    <NOTES>Tradycyjne polskie piwo wędzone dębem w 100% z pszenicy.</NOTES>
    <FERMENTABLES>
      <FERMENTABLE>
        <NAME>Słód Pszeniczny Wędzony Dębem</NAME>
        <VERSION>1</VERSION>
        <TYPE>Grain</TYPE>
        <AMOUNT>2.600</AMOUNT>
        <COLOR>2.0</COLOR>
        <POTENTIAL>1.036</POTENTIAL>
      </FERMENTABLE>
    </FERMENTABLES>
    <HOPS>
      <HOP>
        <NAME>Tomyski</NAME>
        <VERSION>1</VERSION>
        <ALPHA>4.0</ALPHA>
        <AMOUNT>0.0300</AMOUNT>
        <USE>Boil</USE>
        <TIME>60.0</TIME>
        <FORM>Pellet</FORM>
      </HOP>
      <HOP>
        <NAME>Lubelski</NAME>
        <VERSION>1</VERSION>
        <ALPHA>3.5</ALPHA>
        <AMOUNT>0.0200</AMOUNT>
        <USE>Aroma</USE>
        <TIME>10.0</TIME>
        <FORM>Pellet</FORM>
      </HOP>
    </HOPS>
    <YEASTS>
      <YEAST>
        <NAME>Grodziskie Yeast WLP036</NAME>
        <VERSION>1</VERSION>
        <TYPE>Ale</TYPE>
        <FORM>Liquid</FORM>
        <ATTENUATION>76.0</ATTENUATION>
        <MIN_TEMPERATURE>18.0</MIN_TEMPERATURE>
        <MAX_TEMPERATURE>22.0</MAX_TEMPERATURE>
      </YEAST>
    </YEASTS>
    <MASH>
      <NAME>Tradycyjne Grodziskie</NAME>
      <VERSION>1</VERSION>
      <GRAIN_TEMP>20.0</GRAIN_TEMP>
      <MASH_STEPS>
        <MASH_STEP>
          <NAME>Przerwa białkowa</NAME>
          <VERSION>1</VERSION>
          <TYPE>Infusion</TYPE>
          <STEP_TEMP>52.0</STEP_TEMP>
          <STEP_TIME>20.0</STEP_TIME>
        </MASH_STEP>
        <MASH_STEP>
          <NAME>Zacieranie maltozowe</NAME>
          <VERSION>1</VERSION>
          <TYPE>Infusion</TYPE>
          <STEP_TEMP>65.0</STEP_TEMP>
          <STEP_TIME>45.0</STEP_TIME>
        </MASH_STEP>
      </MASH_STEPS>
    </MASH>
  </RECIPE>
</RECIPES>`;

describe('BeerXML 1.0 Import & Export Suite (DEC-02, DEC-10)', () => {
  it('parses BeerXML 1.0 into strongly-typed FullRecipe entity', () => {
    const recipes = parseBeerXml(SAMPLE_BEERXML);
    expect(recipes.length).toBe(1);

    const recipe = recipes[0];
    expect(recipe.name).toBe('Grodziskie Legend');
    expect(recipe.target_volume_l).toBe(20.0);
    expect(recipe.target_og_sg).toBe(1.031);
    expect(recipe.target_fg_sg).toBe(1.008);
    expect(recipe.target_ibu).toBe(25.0);
    expect(recipe.source).toBe('beerxml');

    // Ingredients check
    expect(recipe.fermentables.length).toBe(1);
    expect(recipe.fermentables[0].name).toContain('Pszeniczny');
    expect(recipe.fermentables[0].weight_kg).toBe(2.6);

    expect(recipe.hops.length).toBe(2);
    expect(recipe.hops[0].name).toBe('Tomyski');
    expect(recipe.hops[0].weight_g).toBe(30.0);
    expect(recipe.hops[1].use_stage).toBe('whirlpool'); // Mapped from 'Aroma'

    expect(recipe.yeasts.length).toBe(1);
    expect(recipe.yeasts[0].form).toBe('liquid');

    // Mash profile check
    expect(recipe.mash_profile).toBeDefined();
    expect(recipe.mash_profile?.steps.length).toBe(2);
    expect(recipe.mash_profile?.steps[0].step_temp_c).toBe(52.0);
  });

  it('exports a FullRecipe to valid BeerXML 1.0 and roundtrips without data loss', () => {
    const originalRecipe: FullRecipe = {
      id: 'rec-roundtrip',
      name: 'Baltic Porter Imperialny',
      target_volume_l: 20.0,
      target_og_sg: 1.09,
      target_fg_sg: 1.022,
      target_ibu: 45.0,
      target_srm: 35.0,
      target_abv: 9.1,
      mash_profile_json: JSON.stringify({
        name: 'Trójstopniowe',
        grain_temp_c: 20,
        ratio_l_per_kg: 2.8,
        steps: [{ name: 'Maltozowa', step_temp_c: 64, step_time_mins: 60 }]
      }),
      notes: 'Długie leżakowanie w 10°C.',
      source: 'manual',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      fermentables: [
        {
          id: 'f1',
          recipe_id: 'rec-roundtrip',
          name: 'Słód Monachijski II',
          weight_kg: 6.5,
          color_lovibond: 8.5,
          potential_sg: 1.036,
          is_mash: 1,
          sort_order: 1
        }
      ],
      hops: [
        {
          id: 'h1',
          recipe_id: 'rec-roundtrip',
          name: 'Marynka',
          weight_g: 45.0,
          alpha_acids_pct: 9.0,
          boil_time_mins: 60,
          use_stage: 'boil',
          form: 'pellet',
          sort_order: 1
        }
      ],
      yeasts: [
        {
          id: 'y1',
          recipe_id: 'rec-roundtrip',
          name: 'W-34/70 Saflager',
          form: 'dry',
          attenuation_pct: 78.0,
          min_temp_c: 10.0,
          max_temp_c: 14.0
        }
      ]
    };

    const xml = exportRecipeToBeerXml(originalRecipe);
    expect(xml).toContain('<NAME>Baltic Porter Imperialny</NAME>');
    expect(xml).toContain('<EST_OG>1.090</EST_OG>');
    expect(xml).toContain('<AMOUNT>0.0450</AMOUNT>'); // 45g formatted as 0.0450 kg

    // Roundtrip test: parse exported xml back
    const roundtripped = parseBeerXml(xml);
    expect(roundtripped.length).toBe(1);
    expect(roundtripped[0].name).toBe('Baltic Porter Imperialny');
    expect(roundtripped[0].target_og_sg).toBe(1.09);
    expect(roundtripped[0].fermentables[0].weight_kg).toBe(6.5);
    expect(roundtripped[0].hops[0].weight_g).toBe(45.0);
  });
});
