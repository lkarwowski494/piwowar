/**
 * Piwowar (Brewcraft) — Equipment Profile Repository
 * DEC-11: Hybryda A+B, zarzadzanie profilami sprzetowymi
 */

import { DatabaseClient } from '../database';
import { EquipmentProfile } from '../../types/domain';

export async function getAllEquipmentProfiles(db: DatabaseClient): Promise<EquipmentProfile[]> {
  return db.getAllAsync<EquipmentProfile>(
    'SELECT * FROM equipment_profiles ORDER BY is_default DESC, name ASC;'
  );
}

export async function getDefaultEquipmentProfile(db: DatabaseClient): Promise<EquipmentProfile | null> {
  return db.getFirstAsync<EquipmentProfile>(
    'SELECT * FROM equipment_profiles WHERE is_default = 1 LIMIT 1;'
  );
}

export async function getEquipmentProfileById(
  db: DatabaseClient,
  id: string
): Promise<EquipmentProfile | null> {
  return db.getFirstAsync<EquipmentProfile>(
    'SELECT * FROM equipment_profiles WHERE id = ?;',
    id
  );
}

export async function createEquipmentProfile(
  db: DatabaseClient,
  profile: Omit<EquipmentProfile, 'created_at' | 'updated_at'>
): Promise<EquipmentProfile> {
  const now = new Date().toISOString();
  const created: EquipmentProfile = {
    ...profile,
    created_at: now,
    updated_at: now
  };

  await db.withTransactionAsync(async () => {
    if (created.is_default === 1) {
      await db.runAsync('UPDATE equipment_profiles SET is_default = 0;');
    }

    await db.runAsync(
      `INSERT INTO equipment_profiles (
        id, name, is_default, batch_volume_l, boil_time_mins,
        boil_off_l_per_hr, mash_dead_space_l, kettle_loss_l,
        cooling_shrinkage_pct, grain_absorption_l_per_kg,
        brewhouse_efficiency_pct, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      created.id,
      created.name,
      created.is_default,
      created.batch_volume_l,
      created.boil_time_mins,
      created.boil_off_l_per_hr,
      created.mash_dead_space_l,
      created.kettle_loss_l,
      created.cooling_shrinkage_pct,
      created.grain_absorption_l_per_kg,
      created.brewhouse_efficiency_pct,
      created.created_at,
      created.updated_at
    );
  });

  return created;
}

export async function updateEquipmentProfile(
  db: DatabaseClient,
  profile: Partial<EquipmentProfile> & { id: string }
): Promise<EquipmentProfile | null> {
  const existing = await getEquipmentProfileById(db, profile.id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated: EquipmentProfile = {
    ...existing,
    ...profile,
    updated_at: now
  };

  await db.withTransactionAsync(async () => {
    if (updated.is_default === 1 && existing.is_default !== 1) {
      await db.runAsync('UPDATE equipment_profiles SET is_default = 0;');
    }

    await db.runAsync(
      `UPDATE equipment_profiles SET
        name = ?,
        is_default = ?,
        batch_volume_l = ?,
        boil_time_mins = ?,
        boil_off_l_per_hr = ?,
        mash_dead_space_l = ?,
        kettle_loss_l = ?,
        cooling_shrinkage_pct = ?,
        grain_absorption_l_per_kg = ?,
        brewhouse_efficiency_pct = ?,
        updated_at = ?
      WHERE id = ?;`,
      updated.name,
      updated.is_default,
      updated.batch_volume_l,
      updated.boil_time_mins,
      updated.boil_off_l_per_hr,
      updated.mash_dead_space_l,
      updated.kettle_loss_l,
      updated.cooling_shrinkage_pct,
      updated.grain_absorption_l_per_kg,
      updated.brewhouse_efficiency_pct,
      updated.updated_at,
      updated.id
    );
  });

  return updated;
}

export async function setDefaultEquipmentProfile(
  db: DatabaseClient,
  id: string
): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('UPDATE equipment_profiles SET is_default = 0;');
    await db.runAsync('UPDATE equipment_profiles SET is_default = 1 WHERE id = ?;', id);
  });
}

export async function deleteEquipmentProfile(
  db: DatabaseClient,
  id: string
): Promise<boolean> {
  const res = await db.runAsync('DELETE FROM equipment_profiles WHERE id = ?;', id);
  return res.changes > 0;
}
