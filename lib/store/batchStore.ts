/**
 * Piwowar (Brewcraft) — Batch Store (Zustand)
 * Manages batches list, active batches, and monetization quota tracking (DEC-06).
 */

import { create } from 'zustand';
import { Batch, FullRecipe, EquipmentProfile } from '../types/domain';
import { DatabaseClient } from '../db/database';
import {
  getAllBatches,
  getBatchCount,
  createBatch,
  deleteBatch
} from '../db/repositories/batchRepository';
import { getAccessState } from '../access';

export interface BatchState {
  batches: Batch[];
  totalCount: number;
  isPro: boolean;
  selectedBatch: Batch | null;

  loadBatches: (db: DatabaseClient) => Promise<void>;
  addNewBatch: (
    db: DatabaseClient,
    params: { id: string; recipe?: FullRecipe; equipment: EquipmentProfile; name: string }
  ) => Promise<Batch | null>;
  removeBatch: (db: DatabaseClient, id: string) => Promise<boolean>;
  selectBatch: (batch: Batch | null) => void;
  toggleProOverride: () => void;
}

export const useBatchStore = create<BatchState>((set, get) => ({
  batches: [],
  totalCount: 0,
  isPro: false,
  selectedBatch: null,

  loadBatches: async (db: DatabaseClient) => {
    const list = await getAllBatches(db);
    const count = await getBatchCount(db);
    set({ batches: list, totalCount: count });
  },

  addNewBatch: async (db: DatabaseClient, params) => {
    const { totalCount, isPro } = get();
    const access = getAccessState(totalCount, isPro);

    if (!access.canCreateBatch) {
      return null;
    }

    const created = await createBatch(db, params);
    await get().loadBatches(db);
    return created;
  },

  removeBatch: async (db: DatabaseClient, id: string) => {
    const success = await deleteBatch(db, id);
    if (success) {
      await get().loadBatches(db);
      if (get().selectedBatch?.id === id) {
        set({ selectedBatch: null });
      }
    }
    return success;
  },

  selectBatch: (batch: Batch | null) => set({ selectedBatch: batch }),

  toggleProOverride: () => set((state) => ({ isPro: !state.isPro }))
}));
