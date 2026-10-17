/**
2:  * Piwowar (Brewcraft) — Database Migration Engine
3:  * Implements zero-downtime, transactional migrations with version history.
4:  */

import { DatabaseClient } from './database';

export interface Migration {
  version: number;
  name: string;
  up: (db: DatabaseClient) => Promise<void>;
  down?: (db: DatabaseClient) => Promise<void>;
}

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    up: async (db: DatabaseClient) => {
      // Version 1 is applied by SCHEMA_SQL
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          applied_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);
    }
  },
  {
    version: 2,
    name: 'add_user_activity_days_ledger',
    up: async (db: DatabaseClient) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS user_activity_days (
          activity_date TEXT PRIMARY KEY,
          actions_count INTEGER NOT NULL DEFAULT 1,
          last_action_type TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);
    }
  }
];

export async function runMigrations(db: DatabaseClient): Promise<number> {
  // Ensure schema_migrations table exists
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const appliedRows = await db.getAllAsync<{ version: number }>(
    'SELECT version FROM schema_migrations ORDER BY version ASC;'
  );
  const appliedVersions = new Set(appliedRows.map((r) => r.version));

  let count = 0;
  for (const mig of MIGRATIONS) {
    if (!appliedVersions.has(mig.version)) {
      await db.withTransactionAsync(async () => {
        await mig.up(db);
        await db.runAsync(
          'INSERT INTO schema_migrations (version, name) VALUES (?, ?);',
          mig.version,
          mig.name
        );
      });
      count++;
    }
  }
  return count;
}
