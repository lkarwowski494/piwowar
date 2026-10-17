/**
 * Piwowar (Brewcraft) — Pending Operations & Undo Journal Repository
 * DEC-03: Natychmiastowy WAL commit + dolny snackbar "Cofnij"
 */

import { DatabaseClient } from '../database';
import { PendingOp, OperationType } from '../../types/domain';

export async function recordOp(
  db: DatabaseClient,
  op: {
    entity_table: string;
    entity_id: string;
    operation_type: OperationType;
    payload_before_json?: string | null;
    payload_after_json?: string | null;
  }
): Promise<PendingOp> {
  const id = `op-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const record: PendingOp = {
    id,
    entity_table: op.entity_table,
    entity_id: op.entity_id,
    operation_type: op.operation_type,
    payload_before_json: op.payload_before_json ?? null,
    payload_after_json: op.payload_after_json ?? null,
    created_at: now
  };

  await db.runAsync(
    `INSERT INTO pending_ops (
      id, entity_table, entity_id, operation_type,
      payload_before_json, payload_after_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?);`,
    record.id,
    record.entity_table,
    record.entity_id,
    record.operation_type,
    record.payload_before_json,
    record.payload_after_json,
    record.created_at
  );

  return record;
}

export async function popLatestOp(db: DatabaseClient): Promise<PendingOp | null> {
  const latest = await db.getFirstAsync<PendingOp>(
    'SELECT * FROM pending_ops ORDER BY rowid DESC LIMIT 1;'
  );

  if (latest) {
    await db.runAsync('DELETE FROM pending_ops WHERE id = ?;', latest.id);
  }

  return latest;
}

export async function clearOps(db: DatabaseClient): Promise<void> {
  await db.runAsync('DELETE FROM pending_ops;');
}
