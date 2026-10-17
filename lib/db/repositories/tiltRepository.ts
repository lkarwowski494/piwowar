/**
 * Piwowar (Brewcraft) — Tilt Hydrometer Telemetry Repository
 * DEC-04: Offline Tilt BLE Telemetry Logging & History
 */

import { DatabaseClient } from '../database';
import { TiltTelemetry } from '../../types/domain';

export async function insertTelemetry(
  db: DatabaseClient,
  telemetry: TiltTelemetry
): Promise<TiltTelemetry> {
  await db.runAsync(
    `INSERT INTO tilt_telemetry (
      id, batch_id, color, raw_temp_f, raw_sg,
      calibrated_temp_c, calibrated_sg, calibrated_plato,
      rssi, recorded_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    telemetry.id,
    telemetry.batch_id,
    telemetry.color,
    telemetry.raw_temp_f,
    telemetry.raw_sg,
    telemetry.calibrated_temp_c,
    telemetry.calibrated_sg,
    telemetry.calibrated_plato,
    telemetry.rssi ?? null,
    telemetry.recorded_at
  );

  return telemetry;
}

export async function getTelemetryForBatch(
  db: DatabaseClient,
  batchId: string,
  limit: number = 500
): Promise<TiltTelemetry[]> {
  return db.getAllAsync<TiltTelemetry>(
    `SELECT * FROM tilt_telemetry 
     WHERE batch_id = ? 
     ORDER BY recorded_at ASC 
     LIMIT ?;`,
    batchId,
    limit
  );
}

export async function getLatestTelemetryForBatch(
  db: DatabaseClient,
  batchId: string
): Promise<TiltTelemetry | null> {
  return db.getFirstAsync<TiltTelemetry>(
    `SELECT * FROM tilt_telemetry 
     WHERE batch_id = ? 
     ORDER BY recorded_at DESC 
     LIMIT 1;`,
    batchId
  );
}

export async function deleteTelemetryForBatch(
  db: DatabaseClient,
  batchId: string
): Promise<boolean> {
  const res = await db.runAsync('DELETE FROM tilt_telemetry WHERE batch_id = ?;', batchId);
  return res.changes > 0;
}
