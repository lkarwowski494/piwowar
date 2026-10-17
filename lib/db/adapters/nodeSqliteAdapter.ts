/**
 * Piwowar (Brewcraft) — Node.js SQLite Adapter
 * For running repository and integration tests under Node 24 (node:sqlite)
 */

import { DatabaseSync } from 'node:sqlite';
import { DatabaseClient, SQLiteRunResult } from '../database';

function sanitizeParams(params: any[]): any[] {
  return params.map((p) => (p === undefined ? null : p));
}

export function createNodeSqliteDatabase(path: string = ':memory:'): DatabaseClient {
  const db = new DatabaseSync(path);
  db.exec('PRAGMA foreign_keys = ON;');

  return {
    async execAsync(sql: string): Promise<void> {
      db.exec(sql);
    },
    async runAsync(sql: string, ...params: any[]): Promise<SQLiteRunResult> {
      const stmt = db.prepare(sql);
      const res = stmt.run(...sanitizeParams(params));
      return {
        lastInsertRowId: Number(res.lastInsertRowid),
        changes: Number(res.changes)
      };
    },
    async getAllAsync<T = any>(sql: string, ...params: any[]): Promise<T[]> {
      const stmt = db.prepare(sql);
      return stmt.all(...sanitizeParams(params)) as T[];
    },
    async getFirstAsync<T = any>(sql: string, ...params: any[]): Promise<T | null> {
      const stmt = db.prepare(sql);
      const res = stmt.get(...sanitizeParams(params));
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
