/**
 * Piwowar (Brewcraft) — Inventory Repository & Deduction Test Suite (Z-045)
 */

import { createNodeSqliteDatabase } from '../lib/db/adapters/nodeSqliteAdapter';
import { initDatabase } from '../lib/db/database';
import { runMigrations } from '../lib/db/migrations';
import {
  saveInventoryHop,
  getAllInventoryHops,
  deleteInventoryHop,
  saveInventoryFermentable,
  getAllInventoryFermentables,
  deleteInventoryFermentable,
  saveInventoryYeast,
  getAllInventoryYeasts,
  deleteInventoryYeast,
  deductRecipeFromInventory
} from '../lib/db/repositories/inventoryRepository';
import { FullRecipe } from '../lib/types/domain';

describe('Inventory Repository & Pantry Deduction', () => {
  it('manages hops, fermentables, and yeasts CRUD and recipe deduction', async () => {
    const db = await createNodeSqliteDatabase();
    await initDatabase(db);
    await runMigrations(db);

    // 1. Hop CRUD
    await saveInventoryHop(db, {
      id: 'hop-1',
      name: 'Mosaic',
      crop_year: 2025,
      alpha_acids_pct: 12.0,
      weight_g: 250,
      form: 'pellet',
      storage_temp: 'freezer',
      updated_at: new Date().toISOString()
    });

    let hops = await getAllInventoryHops(db);
    expect(hops.length).toBe(1);
    expect(hops[0].name).toBe('Mosaic');
    expect(hops[0].weight_g).toBe(250);

    // 2. Fermentable CRUD
    await saveInventoryFermentable(db, {
      id: 'ferm-1',
      name: 'Pilzneński Viking Malt',
      weight_kg: 25.0,
      color_lovibond: 1.8,
      potential_sg: 1.037,
      updated_at: new Date().toISOString()
    });

    let ferms = await getAllInventoryFermentables(db);
    expect(ferms.length).toBe(1);
    expect(ferms[0].weight_kg).toBe(25.0);

    // 3. Yeast CRUD
    await saveInventoryYeast(db, {
      id: 'yeast-1',
      name: 'Fermentis US-05',
      form: 'dry',
      pack_count: 5,
      updated_at: new Date().toISOString()
    });

    let yeasts = await getAllInventoryYeasts(db);
    expect(yeasts.length).toBe(1);
    expect(yeasts[0].pack_count).toBe(5);

    // 4. Test Deduct from Recipe
    const recipe: FullRecipe = {
      id: 'rec-test',
      name: 'Test Deduct IPA',
      target_volume_l: 20,
      target_og_sg: 1.050,
      target_fg_sg: 1.010,
      target_ibu: 30,
      target_srm: 4,
      target_abv: 5.0,
      mash_profile_json: '[]',
      source: 'manual',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      fermentables: [
        {
          id: 'rf1',
          recipe_id: 'rec-test',
          name: 'Pilzneński Viking Malt',
          weight_kg: 5.0,
          color_lovibond: 1.8,
          potential_sg: 1.037,
          is_mash: 1,
          sort_order: 1
        }
      ],
      hops: [
        {
          id: 'rh1',
          recipe_id: 'rec-test',
          name: 'Mosaic',
          weight_g: 50,
          alpha_acids_pct: 12.0,
          boil_time_mins: 60,
          use_stage: 'boil',
          form: 'pellet',
          sort_order: 1
        }
      ],
      yeasts: []
    };

    const deduction = await deductRecipeFromInventory(db, recipe);
    expect(deduction.deductedFermentables).toBe(1);
    expect(deduction.deductedHops).toBe(1);

    // Verify stock was reduced
    hops = await getAllInventoryHops(db);
    expect(hops[0].weight_g).toBe(200); // 250 - 50 = 200

    ferms = await getAllInventoryFermentables(db);
    expect(ferms[0].weight_kg).toBe(20.0); // 25.0 - 5.0 = 20.0

    // 5. Deletions
    await deleteInventoryHop(db, 'hop-1');
    await deleteInventoryFermentable(db, 'ferm-1');
    await deleteInventoryYeast(db, 'yeast-1');

    expect((await getAllInventoryHops(db)).length).toBe(0);
    expect((await getAllInventoryFermentables(db)).length).toBe(0);
    expect((await getAllInventoryYeasts(db)).length).toBe(0);
  });
});
