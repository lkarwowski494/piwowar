/**
 * Piwowar (Brewcraft) — Database Core & Lifecycle
 * Unified DatabaseClient interface for Expo SQLite & Node / Testing
 */

import { SCHEMA_SQL } from './schema';
import {
  SEED_EQUIPMENT_PROFILES,
  SEED_BJCP_STYLES,
  SEED_SAMPLE_RECIPE
} from './seeds';

export interface SQLiteRunResult {
  lastInsertRowId: number;
  changes: number;
}

export interface DatabaseClient {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, ...params: (string | number | boolean | null | undefined | unknown)[]): Promise<SQLiteRunResult>;
  getAllAsync<T = unknown>(sql: string, ...params: (string | number | boolean | null | undefined | unknown)[]): Promise<T[]>;
  getFirstAsync<T = unknown>(sql: string, ...params: (string | number | boolean | null | undefined | unknown)[]): Promise<T | null>;
  withTransactionAsync<T>(task: () => Promise<T>): Promise<T>;
}

let activeDb: DatabaseClient | null = null;

export function setAppDatabaseInstance(db: DatabaseClient | null): void {
  activeDb = db;
}

export async function openAppDatabase(): Promise<DatabaseClient> {
  if (activeDb) {
    return activeDb;
  }
  const SQLite = await import('expo-sqlite');
  const expoDb = await SQLite.openDatabaseAsync('piwowar.db');
  const client: DatabaseClient = expoDb as unknown as DatabaseClient;
  await client.execAsync('PRAGMA busy_timeout = 5000;');
  await initDatabase(client);
  activeDb = client;
  return activeDb;
}

/**
 * Initializes schema and runs seeds if database is newly created.
 */
export async function initDatabase(db: DatabaseClient): Promise<void> {
  await db.execAsync('PRAGMA busy_timeout = 5000;');
  await db.execAsync(SCHEMA_SQL);

  // 1. Seed equipment profiles if empty
  const eqCountRow = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM equipment_profiles;'
  );
  if (!eqCountRow || eqCountRow.count === 0) {
    await db.withTransactionAsync(async () => {
      for (const eq of SEED_EQUIPMENT_PROFILES) {
        await db.runAsync(
          `INSERT INTO equipment_profiles (
            id, name, is_default, batch_volume_l, boil_time_mins,
            boil_off_l_per_hr, mash_dead_space_l, kettle_loss_l,
            cooling_shrinkage_pct, grain_absorption_l_per_kg,
            brewhouse_efficiency_pct, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          eq.id,
          eq.name,
          eq.is_default,
          eq.batch_volume_l,
          eq.boil_time_mins,
          eq.boil_off_l_per_hr,
          eq.mash_dead_space_l,
          eq.kettle_loss_l,
          eq.cooling_shrinkage_pct,
          eq.grain_absorption_l_per_kg,
          eq.brewhouse_efficiency_pct,
          eq.created_at,
          eq.updated_at
        );
      }
    });
  }

  // 2. Seed BJCP styles if empty
  const bjcpCountRow = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM bjcp_styles;'
  );
  if (!bjcpCountRow || bjcpCountRow.count === 0) {
    await db.withTransactionAsync(async () => {
      for (const style of SEED_BJCP_STYLES) {
        await db.runAsync(
          `INSERT INTO bjcp_styles (
            id, category, style_code, name, og_min, og_max, fg_min, fg_max,
            ibu_min, ibu_max, srm_min, srm_max, abv_min, abv_max,
            description, aroma, appearance, flavor, mouthfeel, comments, commercial_examples
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          style.id,
          style.category,
          style.style_code,
          style.name,
          style.og_min,
          style.og_max,
          style.fg_min,
          style.fg_max,
          style.ibu_min,
          style.ibu_max,
          style.srm_min,
          style.srm_max,
          style.abv_min,
          style.abv_max,
          style.description ?? null,
          style.aroma ?? null,
          style.appearance ?? null,
          style.flavor ?? null,
          style.mouthfeel ?? null,
          style.comments ?? null,
          style.commercial_examples ?? null
        );
      }
    });
  }

  // 3. Seed starter recipe if empty
  const recipeCountRow = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM recipes;'
  );
  if (!recipeCountRow || recipeCountRow.count === 0) {
    await db.withTransactionAsync(async () => {
      const r = SEED_SAMPLE_RECIPE;
      await db.runAsync(
        `INSERT INTO recipes (
          id, name, bjcp_style_id, equipment_profile_id, target_volume_l,
          target_og_sg, target_fg_sg, target_ibu, target_srm, target_abv,
          mash_profile_json, notes, source, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        r.id,
        r.name,
        r.bjcp_style_id ?? null,
        r.equipment_profile_id ?? null,
        r.target_volume_l,
        r.target_og_sg,
        r.target_fg_sg,
        r.target_ibu,
        r.target_srm,
        r.target_abv,
        r.mash_profile_json,
        r.notes ?? null,
        r.source,
        r.created_at,
        r.updated_at
      );

      for (const f of r.fermentables) {
        await db.runAsync(
          `INSERT INTO recipe_fermentables (
            id, recipe_id, name, weight_kg, color_lovibond, potential_sg, is_mash, sort_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
          f.id,
          f.recipe_id,
          f.name,
          f.weight_kg,
          f.color_lovibond,
          f.potential_sg,
          f.is_mash,
          f.sort_order
        );
      }

      for (const h of r.hops) {
        await db.runAsync(
          `INSERT INTO recipe_hops (
            id, recipe_id, name, weight_g, alpha_acids_pct, boil_time_mins, use_stage, form, sort_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          h.id,
          h.recipe_id,
          h.name,
          h.weight_g,
          h.alpha_acids_pct,
          h.boil_time_mins,
          h.use_stage,
          h.form,
          h.sort_order
        );
      }

      for (const y of r.yeasts) {
        await db.runAsync(
          `INSERT INTO recipe_yeasts (
            id, recipe_id, name, laboratory, product_id, form, attenuation_pct, min_temp_c, max_temp_c
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          y.id,
          y.recipe_id,
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
  }
}
