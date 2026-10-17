/**
 * Piwowar (Brewcraft) — Equipment Profile Store (Zustand)
 * DEC-11: Equipment profiles hybrid manager (defaults + custom sets)
 */

import { create } from 'zustand';
import { EquipmentProfile } from '../types/domain';
import { DatabaseClient } from '../db/database';
import {
  getAllEquipmentProfiles,
  getDefaultEquipmentProfile,
  setDefaultEquipmentProfile,
  createEquipmentProfile
} from '../db/repositories/equipmentRepository';

export interface EquipmentState {
  profiles: EquipmentProfile[];
  defaultProfile: EquipmentProfile | null;

  loadEquipment: (db: DatabaseClient) => Promise<void>;
  setDefault: (db: DatabaseClient, id: string) => Promise<void>;
  addProfile: (
    db: DatabaseClient,
    profile: Omit<EquipmentProfile, 'created_at' | 'updated_at'>
  ) => Promise<EquipmentProfile>;
}

export const useEquipmentStore = create<EquipmentState>((set, get) => ({
  profiles: [],
  defaultProfile: null,

  loadEquipment: async (db: DatabaseClient) => {
    const list = await getAllEquipmentProfiles(db);
    const def = await getDefaultEquipmentProfile(db);
    set({ profiles: list, defaultProfile: def });
  },

  setDefault: async (db: DatabaseClient, id: string) => {
    await setDefaultEquipmentProfile(db, id);
    await get().loadEquipment(db);
  },

  addProfile: async (db: DatabaseClient, profile) => {
    const created = await createEquipmentProfile(db, profile);
    await get().loadEquipment(db);
    return created;
  }
}));
