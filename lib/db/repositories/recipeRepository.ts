/**
 * Piwowar (Brewcraft) — Recipe Repository
 * Zarzadzanie recepturami, slodami, chmielami i drozdzami (kaskadowosc relacji)
 */

import { DatabaseClient } from '../database';
import {
  Recipe,
  RecipeFermentable,
  RecipeHop,
  RecipeYeast,
  FullRecipe,
  MashProfile
} from '../../types/domain';

export async function getAllRecipes(db: DatabaseClient): Promise<Recipe[]> {
  return db.getAllAsync<Recipe>('SELECT * FROM recipes ORDER BY updated_at DESC;');
}

export async function getRecipeById(
  db: DatabaseClient,
  id: string
): Promise<FullRecipe | null> {
  const recipe = await db.getFirstAsync<Recipe>('SELECT * FROM recipes WHERE id = ?;', id);
  if (!recipe) return null;

  const fermentables = await db.getAllAsync<RecipeFermentable>(
    'SELECT * FROM recipe_fermentables WHERE recipe_id = ? ORDER BY sort_order ASC;',
    id
  );

  const hops = await db.getAllAsync<RecipeHop>(
    'SELECT * FROM recipe_hops WHERE recipe_id = ? ORDER BY sort_order ASC, boil_time_mins DESC;',
    id
  );

  const yeasts = await db.getAllAsync<RecipeYeast>(
    'SELECT * FROM recipe_yeasts WHERE recipe_id = ?;',
    id
  );

  let mash_profile: MashProfile | undefined;
  try {
    if (recipe.mash_profile_json) {
      mash_profile = JSON.parse(recipe.mash_profile_json);
    }
  } catch {
    mash_profile = undefined;
  }

  return {
    ...recipe,
    fermentables,
    hops,
    yeasts,
    mash_profile
  };
}

export async function createRecipe(
  db: DatabaseClient,
  fullRecipe: FullRecipe
): Promise<FullRecipe> {
  const now = new Date().toISOString();
  const created: FullRecipe = {
    ...fullRecipe,
    created_at: fullRecipe.created_at || now,
    updated_at: now
  };

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO recipes (
        id, name, bjcp_style_id, equipment_profile_id, target_volume_l,
        target_og_sg, target_fg_sg, target_ibu, target_srm, target_abv,
        mash_profile_json, notes, source, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      created.id,
      created.name,
      created.bjcp_style_id ?? null,
      created.equipment_profile_id ?? null,
      created.target_volume_l,
      created.target_og_sg,
      created.target_fg_sg,
      created.target_ibu,
      created.target_srm,
      created.target_abv,
      created.mash_profile_json,
      created.notes ?? null,
      created.source,
      created.created_at,
      created.updated_at
    );

    for (const f of created.fermentables) {
      await db.runAsync(
        `INSERT INTO recipe_fermentables (
          id, recipe_id, name, weight_kg, color_lovibond, potential_sg, is_mash, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        f.id,
        created.id,
        f.name,
        f.weight_kg,
        f.color_lovibond,
        f.potential_sg,
        f.is_mash,
        f.sort_order
      );
    }

    for (const h of created.hops) {
      await db.runAsync(
        `INSERT INTO recipe_hops (
          id, recipe_id, name, weight_g, alpha_acids_pct, boil_time_mins, use_stage, form, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        h.id,
        created.id,
        h.name,
        h.weight_g,
        h.alpha_acids_pct,
        h.boil_time_mins,
        h.use_stage,
        h.form,
        h.sort_order
      );
    }

    for (const y of created.yeasts) {
      await db.runAsync(
        `INSERT INTO recipe_yeasts (
          id, recipe_id, name, laboratory, product_id, form, attenuation_pct, min_temp_c, max_temp_c
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        y.id,
        created.id,
        y.name,
        y.laboratory ?? null,
        y.product_id ?? null,
        y.form,
        y.attenuation_pct,
        y.min_temp_c,
        y.max_temp_c
      );
    }
  });

  return created;
}

export async function updateRecipe(
  db: DatabaseClient,
  fullRecipe: FullRecipe
): Promise<FullRecipe> {
  const now = new Date().toISOString();
  const updated: FullRecipe = {
    ...fullRecipe,
    updated_at: now
  };

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `UPDATE recipes SET
        name = ?,
        bjcp_style_id = ?,
        equipment_profile_id = ?,
        target_volume_l = ?,
        target_og_sg = ?,
        target_fg_sg = ?,
        target_ibu = ?,
        target_srm = ?,
        target_abv = ?,
        mash_profile_json = ?,
        notes = ?,
        updated_at = ?
      WHERE id = ?;`,
      updated.name,
      updated.bjcp_style_id ?? null,
      updated.equipment_profile_id ?? null,
      updated.target_volume_l,
      updated.target_og_sg,
      updated.target_fg_sg,
      updated.target_ibu,
      updated.target_srm,
      updated.target_abv,
      updated.mash_profile_json,
      updated.notes ?? null,
      updated.updated_at,
      updated.id
    );

    // Replace ingredients
    await db.runAsync('DELETE FROM recipe_fermentables WHERE recipe_id = ?;', updated.id);
    await db.runAsync('DELETE FROM recipe_hops WHERE recipe_id = ?;', updated.id);
    await db.runAsync('DELETE FROM recipe_yeasts WHERE recipe_id = ?;', updated.id);

    for (const f of updated.fermentables) {
      await db.runAsync(
        `INSERT INTO recipe_fermentables (
          id, recipe_id, name, weight_kg, color_lovibond, potential_sg, is_mash, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        f.id,
        updated.id,
        f.name,
        f.weight_kg,
        f.color_lovibond,
        f.potential_sg,
        f.is_mash,
        f.sort_order
      );
    }

    for (const h of updated.hops) {
      await db.runAsync(
        `INSERT INTO recipe_hops (
          id, recipe_id, name, weight_g, alpha_acids_pct, boil_time_mins, use_stage, form, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        h.id,
        updated.id,
        h.name,
        h.weight_g,
        h.alpha_acids_pct,
        h.boil_time_mins,
        h.use_stage,
        h.form,
        h.sort_order
      );
    }

    for (const y of updated.yeasts) {
      await db.runAsync(
        `INSERT INTO recipe_yeasts (
          id, recipe_id, name, laboratory, product_id, form, attenuation_pct, min_temp_c, max_temp_c
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        y.id,
        updated.id,
        y.name,
        y.laboratory ?? null,
        y.product_id ?? null,
        y.form,
        y.attenuation_pct,
        y.min_temp_c,
        y.max_temp_c
      );
    }
  });

  return updated;
}

export async function deleteRecipe(
  db: DatabaseClient,
  id: string
): Promise<boolean> {
  const res = await db.runAsync('DELETE FROM recipes WHERE id = ?;', id);
  return res.changes > 0;
}
