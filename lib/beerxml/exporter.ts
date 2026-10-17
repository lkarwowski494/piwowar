/**
 * Piwowar (Brewcraft) — BeerXML 1.0 Exporter (BR-XML-002, DEC-02, DEC-10)
 * Generates standards-compliant BeerXML 1.0 files for sharing and platform interoperability.
 */

import { XMLBuilder } from 'fast-xml-parser';
import { FullRecipe, EquipmentProfile } from '../types/domain';

export function exportRecipeToBeerXml(
  recipe: FullRecipe,
  equipment?: EquipmentProfile
): string {
  const boilTime = equipment?.boil_time_mins ?? 60;
  const boilVolume = equipment
    ? recipe.target_volume_l + (equipment.boil_off_l_per_hr * boilTime) / 60
    : recipe.target_volume_l + 3.0;

  const fermentablesXml = recipe.fermentables.map((f) => ({
    NAME: f.name,
    VERSION: '1',
    TYPE: 'Grain',
    AMOUNT: f.weight_kg.toFixed(3),
    YIELD: '75.0',
    COLOR: f.color_lovibond.toFixed(1),
    POTENTIAL: f.potential_sg.toFixed(3)
  }));

  const hopsXml = recipe.hops.map((h) => {
    let useStr = 'Boil';
    if (h.use_stage === 'dry_hop') useStr = 'Dry Hop';
    else if (h.use_stage === 'whirlpool') useStr = 'Aroma';
    else if (h.use_stage === 'first_wort') useStr = 'First Wort';

    let formStr = 'Pellet';
    if (h.form === 'leaf') formStr = 'Leaf';
    else if (h.form === 'plug') formStr = 'Plug';

    return {
      NAME: h.name,
      VERSION: '1',
      ALPHA: h.alpha_acids_pct.toFixed(1),
      AMOUNT: (h.weight_g / 1000.0).toFixed(4),
      USE: useStr,
      TIME: h.boil_time_mins.toFixed(1),
      FORM: formStr
    };
  });

  const yeastsXml = recipe.yeasts.map((y) => ({
    NAME: y.name,
    VERSION: '1',
    TYPE: 'Ale',
    FORM: y.form === 'liquid' ? 'Liquid' : 'Dry',
    AMOUNT: '0.011',
    LABORATORY: y.laboratory || 'Danstar/Fermentis',
    PRODUCT_ID: y.product_id || '',
    ATTENUATION: y.attenuation_pct.toFixed(1),
    MIN_TEMPERATURE: y.min_temp_c.toFixed(1),
    MAX_TEMPERATURE: y.max_temp_c.toFixed(1)
  }));

  const mashSteps = recipe.mash_profile?.steps || [
    { name: 'Zacieranie infuzyjne', step_temp_c: 67.0, step_time_mins: 60 }
  ];

  const mashStepsXml = mashSteps.map((s) => ({
    NAME: s.name,
    VERSION: '1',
    TYPE: 'Infusion',
    STEP_TEMP: s.step_temp_c.toFixed(1),
    STEP_TIME: s.step_time_mins.toFixed(1)
  }));

  const xmlObject = {
    '?xml': {
      '@_version': '1.0',
      '@_encoding': 'UTF-8'
    },
    RECIPES: {
      RECIPE: {
        NAME: recipe.name,
        VERSION: '1',
        TYPE: 'All Grain',
        BREWER: 'Piwowar (Brewcraft) Studio',
        BATCH_SIZE: recipe.target_volume_l.toFixed(1),
        BOIL_SIZE: boilVolume.toFixed(1),
        BOIL_TIME: boilTime.toFixed(1),
        EFFICIENCY: equipment ? equipment.brewhouse_efficiency_pct.toFixed(1) : '75.0',
        EST_OG: recipe.target_og_sg.toFixed(3),
        EST_FG: recipe.target_fg_sg.toFixed(3),
        EST_COLOR: recipe.target_srm.toFixed(1),
        IBU: recipe.target_ibu.toFixed(1),
        EST_ABV: recipe.target_abv.toFixed(1),
        NOTES: recipe.notes || '',
        FERMENTABLES: {
          FERMENTABLE: fermentablesXml
        },
        HOPS: {
          HOP: hopsXml
        },
        YEASTS: {
          YEAST: yeastsXml
        },
        MASH: {
          NAME: recipe.mash_profile?.name || 'Profil jednotemperaturowy',
          VERSION: '1',
          GRAIN_TEMP: (recipe.mash_profile?.grain_temp_c || 20.0).toFixed(1),
          MASH_STEPS: {
            MASH_STEP: mashStepsXml
          }
        }
      }
    }
  };

  const builder = new XMLBuilder({
    ignoreAttributes: false,
    format: true,
    suppressEmptyNode: true
  });

  return builder.build(xmlObject);
}
