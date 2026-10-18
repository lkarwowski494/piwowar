/**
 * Piwowar (Brewcraft) — Node.js SQLite Adapter
 * For running repository and integration tests under Node 24 (node:sqlite)
 */

import { DatabaseSync } from 'node:sqlite';
import { DatabaseClient, SQLiteRunResult } from '../database';

function sanitizeParams(params: unknown[]): unknown[] {
  const flattened = params.length === 1 && Array.isArray(params[0]) ? (params[0] as unknown[]) : params;
  return flattened.map((p) => (p === undefined ? null : p));
}

export function createNodeSqliteDatabase(path: string = ':memory:'): DatabaseClient {
  const db = new DatabaseSync(path);
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA busy_timeout = 5000;');

  return {
    async execAsync(sql: string): Promise<void> {
      db.exec(sql);
    },
    async runAsync(sql: string, ...params: unknown[]): Promise<SQLiteRunResult> {
      const stmt = db.prepare(sql);
      const res = (stmt.run as (...args: unknown[]) => { lastInsertRowid: number | bigint; changes: number | bigint })(...sanitizeParams(params));
      return {
        lastInsertRowId: Number(res.lastInsertRowid),
        changes: Number(res.changes)
      };
    },
    async getAllAsync<T = unknown>(sql: string, ...params: unknown[]): Promise<T[]> {
      const stmt = db.prepare(sql);
      return (stmt.all as (...args: unknown[]) => unknown[])(...sanitizeParams(params)) as T[];
    },
    async getFirstAsync<T = unknown>(sql: string, ...params: unknown[]): Promise<T | null> {
      const stmt = db.prepare(sql);
      const res = (stmt.get as (...args: unknown[]) => unknown)(...sanitizeParams(params));
      return (res ?? null) as T | null;
    },
    async withTransactionAsync<T>(task: () => Promise<T>): Promise<T> {
      db.exec('BEGIN TRANSACTION;');
      try {
        const result = await task();
        db.exec('COMMIT;');
        return result;
      } catch (err) {
        db.exec('ROLLBACK;');
        throw err;
      }
    }
  };
}
