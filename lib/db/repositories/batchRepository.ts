/**
 * Piwowar (Brewcraft) — Batch Repository
 * DEC-06: Limit darmowych warek (Quota = 3)
 * DEC-15: Immutable Snapshoty receptury i sprzetu w JSON
 */

import { DatabaseClient } from '../database';
import {
  Batch,
  BatchStatus,
  FullRecipe,
  EquipmentProfile
} from '../../types/domain';

export interface CreateBatchParams {
  id: string;
  recipe?: FullRecipe;
  equipment: EquipmentProfile;
  name: string;
  brew_date?: string;
  parent_batch_id?: string | null;
}

export async function getBatchCount(db: DatabaseClient): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM batches;'
  );
  return row?.count ?? 0;
}

export async function getNextBatchNumber(db: DatabaseClient): Promise<number> {
  const row = await db.getFirstAsync<{ max_num: number | null }>(
    'SELECT MAX(batch_number) as max_num FROM batches;'
  );
  return (row?.max_num ?? 0) + 1;
}

export async function getAllBatches(db: DatabaseClient): Promise<Batch[]> {
  return db.getAllAsync<Batch>(
    'SELECT * FROM batches ORDER BY batch_number DESC;'
  );
}

export async function getActiveBatches(db: DatabaseClient): Promise<Batch[]> {
  return db.getAllAsync<Batch>(
    `SELECT * FROM batches 
     WHERE status NOT IN ('bottled', 'archived') 
     ORDER BY batch_number DESC;`
  );
}

export async function getBatchById(
  db: DatabaseClient,
  id: string
): Promise<Batch | null> {
  return db.getFirstAsync<Batch>('SELECT * FROM batches WHERE id = ?;', id);
}

export async function createBatch(
  db: DatabaseClient,
  params: CreateBatchParams
): Promise<Batch> {
  const now = new Date().toISOString();
  const nextNum = await getNextBatchNumber(db);

  // DEC-15: Zapewnienie trwalego, zamrozonego snapshotu
  const equipmentSnapshotJson = JSON.stringify(params.equipment);
  const recipeSnapshotJson = params.recipe ? JSON.stringify(params.recipe) : '{}';

  const batch: Batch = {
    id: params.id,
    recipe_id: params.recipe?.id ?? null,
    batch_number: nextNum,
    name: params.name,
    brew_date: params.brew_date ?? now.slice(0, 10),
    status: 'planning',
    equipment_snapshot_json: equipmentSnapshotJson,
    recipe_snapshot_json: recipeSnapshotJson,
    measured_pre_boil_sg: null,
    measured_pre_boil_volume_l: null,
    measured_og_sg: null,
    measured_fg_sg: null,
    measured_volume_l: null,
    calculated_abv: null,
    calculated_efficiency_pct: null,
    bottling_date: null,
    priming_sugar_type: null,
    priming_sugar_grams: null,
    target_vco2: null,
    tasting_notes: null,
    bjcp_score: null,
    parent_batch_id: params.parent_batch_id ?? null,
    created_at: now,
    updated_at: now
  };

  await db.runAsync(
    `INSERT INTO batches (
      id, recipe_id, batch_number, name, brew_date, status,
      equipment_snapshot_json, recipe_snapshot_json,
      measured_pre_boil_sg, measured_pre_boil_volume_l,
      measured_og_sg, measured_fg_sg, measured_volume_l,
      calculated_abv, calculated_efficiency_pct,
      bottling_date, priming_sugar_type, priming_sugar_grams,
      target_vco2, tasting_notes, bjcp_score, parent_batch_id,
      created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?,
      ?, ?,
      ?, ?, ?,
      ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?
    );`,
    batch.id,
    batch.recipe_id,
    batch.batch_number,
    batch.name,
    batch.brew_date,
    batch.status,
    batch.equipment_snapshot_json,
    batch.recipe_snapshot_json,
    batch.measured_pre_boil_sg,
    batch.measured_pre_boil_volume_l,
    batch.measured_og_sg,
    batch.measured_fg_sg,
    batch.measured_volume_l,
    batch.calculated_abv,
    batch.calculated_efficiency_pct,
    batch.bottling_date,
    batch.priming_sugar_type,
    batch.priming_sugar_grams,
    batch.target_vco2,
    batch.tasting_notes,
    batch.bjcp_score,
    batch.parent_batch_id,
    batch.created_at,
    batch.updated_at
  );

  return batch;
}

export async function updateBatchStatus(
  db: DatabaseClient,
  id: string,
  status: BatchStatus
): Promise<void> {
  const now = new Date().toISOString();
  await db.runAsync(
    'UPDATE batches SET status = ?, updated_at = ? WHERE id = ?;',
    status,
    now,
    id
  );
}

export async function updateBatchMeasurements(
  db: DatabaseClient,
  id: string,
  measurements: {
    measured_pre_boil_sg?: number | null;
    measured_pre_boil_volume_l?: number | null;
    measured_og_sg?: number | null;
    measured_fg_sg?: number | null;
    measured_volume_l?: number | null;
    calculated_abv?: number | null;
    calculated_efficiency_pct?: number | null;
  }
): Promise<void> {
  const now = new Date().toISOString();
  const existing = await getBatchById(db, id);
  if (!existing) return;

  await db.runAsync(
    `UPDATE batches SET
      measured_pre_boil_sg = COALESCE(?, measured_pre_boil_sg),
      measured_pre_boil_volume_l = COALESCE(?, measured_pre_boil_volume_l),
      measured_og_sg = COALESCE(?, measured_og_sg),
      measured_fg_sg = COALESCE(?, measured_fg_sg),
      measured_volume_l = COALESCE(?, measured_volume_l),
      calculated_abv = COALESCE(?, calculated_abv),
      calculated_efficiency_pct = COALESCE(?, calculated_efficiency_pct),
      updated_at = ?
    WHERE id = ?;`,
    measurements.measured_pre_boil_sg ?? null,
    measurements.measured_pre_boil_volume_l ?? null,
    measurements.measured_og_sg ?? null,
    measurements.measured_fg_sg ?? null,
    measurements.measured_volume_l ?? null,
    measurements.calculated_abv ?? null,
    measurements.calculated_efficiency_pct ?? null,
    now,
    id
  );
}

export async function updateBatchBottling(
  db: DatabaseClient,
  id: string,
  bottling: {
    bottling_date: string;
    priming_sugar_type: 'sucrose' | 'dextrose' | 'dme';
    priming_sugar_grams: number;
    target_vco2: number;
  }
): Promise<void> {
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE batches SET
      bottling_date = ?,
      priming_sugar_type = ?,
      priming_sugar_grams = ?,
      target_vco2 = ?,
      status = 'bottled',
      updated_at = ?
    WHERE id = ?;`,
    bottling.bottling_date,
    bottling.priming_sugar_type,
    bottling.priming_sugar_grams,
    bottling.target_vco2,
    now,
    id
  );
}

export async function updateBatch(
  db: DatabaseClient,
  batch: Partial<Batch> & { id: string }
): Promise<Batch | null> {
  const existing = await getBatchById(db, batch.id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const merged: Batch = {
    ...existing,
    ...batch,
    updated_at: now
  };

  await db.runAsync(
    `UPDATE batches SET
      name = ?,
      brew_date = ?,
      status = ?,
      measured_pre_boil_sg = ?,
      measured_pre_boil_volume_l = ?,
      measured_og_sg = ?,
      measured_fg_sg = ?,
      measured_volume_l = ?,
      calculated_abv = ?,
      calculated_efficiency_pct = ?,
      bottling_date = ?,
      priming_sugar_type = ?,
      priming_sugar_grams = ?,
      target_vco2 = ?,
      tasting_notes = ?,
      bjcp_score = ?,
      updated_at = ?
    WHERE id = ?;`,
    merged.name,
    merged.brew_date,
    merged.status,
    merged.measured_pre_boil_sg,
    merged.measured_pre_boil_volume_l,
    merged.measured_og_sg,
    merged.measured_fg_sg,
    merged.measured_volume_l,
    merged.calculated_abv,
    merged.calculated_efficiency_pct,
    merged.bottling_date,
    merged.priming_sugar_type,
    merged.priming_sugar_grams,
    merged.target_vco2,
    merged.tasting_notes,
    merged.bjcp_score,
    merged.updated_at,
    merged.id
  );

  return merged;
}

export async function deleteBatch(
  db: DatabaseClient,
  id: string
): Promise<boolean> {
  const res = await db.runAsync('DELETE FROM batches WHERE id = ?;', id);
  return res.changes > 0;
}
