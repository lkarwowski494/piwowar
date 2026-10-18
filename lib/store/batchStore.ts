/**
 * Piwowar (Brewcraft) — Batch Store (Zustand)
 * Manages batches list, active batches, StoreKit IAP, and monetization quota tracking (DEC-06 / TASK-R03-01 / TASK-R03-02).
 */

import { create } from 'zustand';
import { Batch, FullRecipe, EquipmentProfile } from '../types/domain';
import { DatabaseClient } from '../db/database';
import {
  getAllBatches,
  getBatchCount,
  createBatch,
  deleteBatch,
  updateBatch
} from '../db/repositories/batchRepository';
import { getAccessState } from '../access';
import {
  IapProductId,
  IAP_PRODUCTS,
  loadPersistedLicense,
  executeStoreKitPurchase,
  revokeProLicense,
  persistProLicense
} from '../iap/storeKitService';

export interface BatchState {
  batches: Batch[];
  totalCount: number;
  isPro: boolean;
  selectedBatch: Batch | null;

  loadBatches: (db: DatabaseClient) => Promise<void>;
  addNewBatch: (
    db: DatabaseClient,
    params: { id: string; recipe?: FullRecipe; equipment: EquipmentProfile; name: string; parent_batch_id?: string | null }
  ) => Promise<Batch | null>;
  updateExistingBatch: (
    db: DatabaseClient,
    batch: Partial<Batch> & { id: string }
  ) => Promise<Batch | null>;
  removeBatch: (db: DatabaseClient, id: string) => Promise<boolean>;
  selectBatch: (batch: Batch | null) => void;
  purchaseProPass: (db: DatabaseClient, productId?: IapProductId) => Promise<boolean>;
  restorePurchases: (db: DatabaseClient) => Promise<boolean>;
  toggleProOverride: (db?: DatabaseClient) => Promise<void>;
}

export const useBatchStore = create<BatchState>((set, get) => ({
  batches: [],
  totalCount: 0,
  isPro: false,
  selectedBatch: null,

  loadBatches: async (db: DatabaseClient) => {
    const list = await getAllBatches(db);
    const count = await getBatchCount(db);
    const license = await loadPersistedLicense(db);
    set({ batches: list, totalCount: count, isPro: license.isPro });
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

  updateExistingBatch: async (db: DatabaseClient, batch: Partial<Batch> & { id: string }) => {
    const updated = await updateBatch(db, batch);
    if (updated) {
      set((state) => ({
        batches: state.batches.map((b) => (b.id === batch.id ? updated : b)),
        selectedBatch: state.selectedBatch?.id === batch.id ? updated : state.selectedBatch
      }));
    }
    return updated;
  },

  selectBatch: (batch: Batch | null) => set({ selectedBatch: batch }),

  purchaseProPass: async (db: DatabaseClient, productId: IapProductId = IAP_PRODUCTS.ANNUAL) => {
    const success = await executeStoreKitPurchase(db, productId);
    if (success) {
      set({ isPro: true });
    }
    return success;
  },

  restorePurchases: async (db: DatabaseClient) => {
    const license = await loadPersistedLicense(db);
    set({ isPro: license.isPro });
    return license.isPro;
  },

  toggleProOverride: async (db?: DatabaseClient) => {
    const nextPro = !get().isPro;
    set({ isPro: nextPro });
    if (db) {
      if (nextPro) {
        await persistProLicense(db, IAP_PRODUCTS.LIFETIME);
      } else {
        await revokeProLicense(db);
      }
    }
  }
}));
