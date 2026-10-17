/**
 * Piwowar (Brewcraft) — GAP-DAT-01 Fault Injection & Transactional Rollback Test
 * Verifies that a failure during a multi-table write rolls back 100% of partial data (Zero Partial Writes).
 */

import { createNodeSqliteDatabase } from '../lib/db/adapters/nodeSqliteAdapter';
import { initDatabase, DatabaseClient } from '../lib/db/database';
import { getAllRecipes } from '../lib/db/repositories/recipeRepository';

describe('GAP-DAT-01: Transactional Rollback & Fault Injection', () => {
  let db: DatabaseClient;

  beforeEach(async () => {
    db = await createNodeSqliteDatabase();
    await initDatabase(db);
  });

  it('rolls back completely when a multi-table insert fails midway (Zero Partial Writes)', async () => {
    const initialRecipes = await getAllRecipes(db);
    const initialCount = initialRecipes.length;

    const failedInsert = async () => {
      await db.withTransactionAsync(async () => {
        // Step 1: Insert recipe header
        await db.runAsync(
          `INSERT INTO recipes (
            id, name, target_volume_l, target_og_sg, target_fg_sg, target_ibu, target_srm, target_abv, mash_profile_json, source, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          'fault-test-recipe',
          'Fault Injection Test Recipe',
          20,
          1.050,
          1.010,
          35,
          10,
          5.2,
          '[]',
          'user',
          new Date().toISOString(),
          new Date().toISOString()
        );

        // Step 2: Insert first ingredient
        await db.runAsync(
          `INSERT INTO recipe_fermentables (
            id, recipe_id, name, weight_kg, color_lovibond, potential_sg, is_mash, sort_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
          'fault-ferm-1',
          'fault-test-recipe',
          'Pilzneński',
          4.5,
          2.0,
          1.037,
          1,
          0
        );

        // Step 3: SIMULATE CRASH / POWER FAILURE / FAULT INJECTION
        throw new Error('SIMULATED_DATABASE_IO_FAILURE_ON_STEP_3');
      });
    };

    // Expect the transaction to throw
    await expect(failedInsert()).rejects.toThrow('SIMULATED_DATABASE_IO_FAILURE_ON_STEP_3');

    // Verification 1: Recipes table must have the exact same count as before
    const afterRecipes = await getAllRecipes(db);
    expect(afterRecipes.length).toBe(initialCount);
    expect(afterRecipes.find(r => r.id === 'fault-test-recipe')).toBeUndefined();

    // Verification 2: Fermentables table must NOT contain the orphaned ingredient
    const orphanRow = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM recipe_fermentables WHERE recipe_id = 'fault-test-recipe';"
    );
    expect(orphanRow?.count).toBe(0);

    // Verification 3: SQLite integrity check must return "ok"
    const integrityRow = await db.getFirstAsync<{ integrity_check: string }>(
      'PRAGMA integrity_check;'
    );
    expect(integrityRow?.integrity_check).toBe('ok');
  });
});
