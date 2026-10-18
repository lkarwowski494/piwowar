/**
 * Piwowar (Brewcraft) — Inventory Repository
 * SQLite persistence for homebrew pantry: hops, malts, yeasts (Z-045).
 */

import { DatabaseClient } from '../database';
import { InventoryHop, InventoryFermentable, InventoryYeast, FullRecipe } from '../../types/domain';

// --- Hops ---
export async function getAllInventoryHops(db: DatabaseClient): Promise<InventoryHop[]> {
  return db.getAllAsync<InventoryHop>(
    'SELECT * FROM inventory_hops ORDER BY name ASC;'
  );
}

export async function saveInventoryHop(db: DatabaseClient, hop: InventoryHop): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO inventory_hops 
     (id, name, crop_year, alpha_acids_pct, weight_g, form, storage_temp, notes, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      hop.id,
      hop.name,
      hop.crop_year ?? null,
      hop.alpha_acids_pct,
      hop.weight_g,
      hop.form || 'pellet',
      hop.storage_temp || 'freezer',
      hop.notes ?? null,
      hop.updated_at || new Date().toISOString()
    ]
  );
}

export async function deleteInventoryHop(db: DatabaseClient, id: string): Promise<boolean> {
  const res = await db.runAsync('DELETE FROM inventory_hops WHERE id = ?;', [id]);
  return res.changes > 0;
}

// --- Fermentables ---
export async function getAllInventoryFermentables(db: DatabaseClient): Promise<InventoryFermentable[]> {
  return db.getAllAsync<InventoryFermentable>(
    'SELECT * FROM inventory_fermentables ORDER BY name ASC;'
  );
}

export async function saveInventoryFermentable(
  db: DatabaseClient,
  item: InventoryFermentable
): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO inventory_fermentables 
     (id, name, weight_kg, color_lovibond, potential_sg, notes, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      item.id,
      item.name,
      item.weight_kg,
      item.color_lovibond,
      item.potential_sg || 1.036,
      item.notes ?? null,
      item.updated_at || new Date().toISOString()
    ]
  );
}

export async function deleteInventoryFermentable(db: DatabaseClient, id: string): Promise<boolean> {
  const res = await db.runAsync('DELETE FROM inventory_fermentables WHERE id = ?;', [id]);
  return res.changes > 0;
}

// --- Yeasts ---
export async function getAllInventoryYeasts(db: DatabaseClient): Promise<InventoryYeast[]> {
  return db.getAllAsync<InventoryYeast>(
    'SELECT * FROM inventory_yeasts ORDER BY name ASC;'
  );
}

export async function saveInventoryYeast(db: DatabaseClient, item: InventoryYeast): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO inventory_yeasts 
     (id, name, form, pack_count, best_before_date, notes, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      item.id,
      item.name,
      item.form || 'dry',
      item.pack_count || 1,
      item.best_before_date ?? null,
      item.notes ?? null,
      item.updated_at || new Date().toISOString()
    ]
  );
}

export async function deleteInventoryYeast(db: DatabaseClient, id: string): Promise<boolean> {
  const res = await db.runAsync('DELETE FROM inventory_yeasts WHERE id = ?;', [id]);
  return res.changes > 0;
}

/**
 * Deducts recipe ingredients from pantry stock.
 */
export async function deductRecipeFromInventory(
  db: DatabaseClient,
  recipe: FullRecipe
): Promise<{ deductedHops: number; deductedFermentables: number }> {
  let deductedHops = 0;
  let deductedFermentables = 0;

  // Deduct fermentables
  if (recipe.fermentables) {
    for (const f of recipe.fermentables) {
      const existing = await db.getFirstAsync<InventoryFermentable>(
        'SELECT * FROM inventory_fermentables WHERE LOWER(name) = LOWER(?) LIMIT 1;',
        [f.name.trim()]
      );
      if (existing) {
        const newWeight = Math.max(0, existing.weight_kg - f.weight_kg);
        await db.runAsync(
          'UPDATE inventory_fermentables SET weight_kg = ?, updated_at = ? WHERE id = ?;',
          [Number(newWeight.toFixed(2)), new Date().toISOString(), existing.id]
        );
        deductedFermentables++;
      }
    }
  }

  // Deduct hops
  if (recipe.hops) {
    for (const h of recipe.hops) {
      const existing = await db.getFirstAsync<InventoryHop>(
        'SELECT * FROM inventory_hops WHERE LOWER(name) = LOWER(?) LIMIT 1;',
        [h.name.trim()]
      );
      if (existing) {
        const newWeight = Math.max(0, existing.weight_g - h.weight_g);
        await db.runAsync(
          'UPDATE inventory_hops SET weight_g = ?, updated_at = ? WHERE id = ?;',
          [Number(newWeight.toFixed(1)), new Date().toISOString(), existing.id]
        );
        deductedHops++;
      }
    }
  }

  return { deductedHops, deductedFermentables };
}
