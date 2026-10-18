/**
 * Piwowar (Brewcraft) — Inventory Store (Zustand)
 * Manages reactive pantry inventory state (Z-045).
 */

import { create } from 'zustand';
import { InventoryHop, InventoryFermentable, InventoryYeast, FullRecipe } from '../types/domain';
import { DatabaseClient } from '../db/database';
import {
  getAllInventoryHops,
  saveInventoryHop,
  deleteInventoryHop,
  getAllInventoryFermentables,
  saveInventoryFermentable,
  deleteInventoryFermentable,
  getAllInventoryYeasts,
  saveInventoryYeast,
  deleteInventoryYeast,
  deductRecipeFromInventory
} from '../db/repositories/inventoryRepository';

export interface InventoryState {
  hops: InventoryHop[];
  fermentables: InventoryFermentable[];
  yeasts: InventoryYeast[];
  isLoading: boolean;

  loadInventory: (db: DatabaseClient) => Promise<void>;
  addOrUpdateHop: (db: DatabaseClient, hop: InventoryHop) => Promise<void>;
  removeHop: (db: DatabaseClient, id: string) => Promise<void>;
  addOrUpdateFermentable: (db: DatabaseClient, item: InventoryFermentable) => Promise<void>;
  removeFermentable: (db: DatabaseClient, id: string) => Promise<void>;
  addOrUpdateYeast: (db: DatabaseClient, item: InventoryYeast) => Promise<void>;
  removeYeast: (db: DatabaseClient, id: string) => Promise<void>;
  deductBatch: (db: DatabaseClient, recipe: FullRecipe) => Promise<{ deductedHops: number; deductedFermentables: number }>;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  hops: [],
  fermentables: [],
  yeasts: [],
  isLoading: false,

  loadInventory: async (db: DatabaseClient) => {
    set({ isLoading: true });
    try {
      const [h, f, y] = await Promise.all([
        getAllInventoryHops(db),
        getAllInventoryFermentables(db),
        getAllInventoryYeasts(db)
      ]);
      set({ hops: h, fermentables: f, yeasts: y, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addOrUpdateHop: async (db: DatabaseClient, hop: InventoryHop) => {
    await saveInventoryHop(db, hop);
    await get().loadInventory(db);
  },

  removeHop: async (db: DatabaseClient, id: string) => {
    await deleteInventoryHop(db, id);
    await get().loadInventory(db);
  },

  addOrUpdateFermentable: async (db: DatabaseClient, item: InventoryFermentable) => {
    await saveInventoryFermentable(db, item);
    await get().loadInventory(db);
  },

  removeFermentable: async (db: DatabaseClient, id: string) => {
    await deleteInventoryFermentable(db, id);
    await get().loadInventory(db);
  },

  addOrUpdateYeast: async (db: DatabaseClient, item: InventoryYeast) => {
    await saveInventoryYeast(db, item);
    await get().loadInventory(db);
  },

  removeYeast: async (db: DatabaseClient, id: string) => {
    await deleteInventoryYeast(db, id);
    await get().loadInventory(db);
  },

  deductBatch: async (db: DatabaseClient, recipe: FullRecipe) => {
    const result = await deductRecipeFromInventory(db, recipe);
    await get().loadInventory(db);
    return result;
  }
}));
