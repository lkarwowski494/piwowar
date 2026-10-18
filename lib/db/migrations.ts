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
  },
  {
    version: 3,
    name: 'add_inventory_and_split_batch',
    up: async (db: DatabaseClient) => {
      try {
        await db.execAsync('ALTER TABLE batches ADD COLUMN parent_batch_id TEXT REFERENCES batches(id) ON DELETE SET NULL;');
      } catch {
        // Column might already exist in fresh schema
      }

      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS inventory_hops (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          crop_year INTEGER,
          alpha_acids_pct REAL NOT NULL,
          weight_g REAL NOT NULL,
          form TEXT DEFAULT 'pellet',
          storage_temp TEXT DEFAULT 'freezer',
          notes TEXT,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS inventory_fermentables (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          weight_kg REAL NOT NULL,
          color_lovibond REAL NOT NULL,
          potential_sg REAL NOT NULL DEFAULT 1.036,
          notes TEXT,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS inventory_yeasts (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          form TEXT DEFAULT 'dry',
          pack_count INTEGER NOT NULL DEFAULT 1,
          best_before_date TEXT,
          notes TEXT,
          updated_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_inventory_hops_name ON inventory_hops(name);
        CREATE INDEX IF NOT EXISTS idx_inventory_fermentables_name ON inventory_fermentables(name);
      `);
    }
  }
];

export interface MigrationOptions {
  backupPath?: string;
  enableBackup?: boolean;
}

export async function createMigrationBackup(
  db: DatabaseClient,
  backupPath: string = 'backup_pre_migration.db'
): Promise<string> {
  try {
    const normalizedPath = backupPath.replace(/\\/g, '/');
    const fs = typeof require !== 'undefined' ? require('node:fs') : null;
    if (fs && typeof fs.existsSync === 'function' && fs.existsSync(backupPath)) {
      try {
        fs.unlinkSync(backupPath);
      } catch {}
    }
    await db.execAsync(`VACUUM INTO '${normalizedPath.replace(/'/g, "''")}';`);
    return backupPath;
  } catch {
    return '';
  }
}

export async function runMigrations(
  db: DatabaseClient,
  options?: MigrationOptions
): Promise<number> {
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

  const pending = MIGRATIONS.filter((mig) => !appliedVersions.has(mig.version));
  if (pending.length === 0) {
    return 0;
  }

  // Pre-migration backup snapshot (Zero Data Loss Axiom)
  let backupFile = '';
  if (options?.enableBackup !== false) {
    backupFile = await createMigrationBackup(db, options?.backupPath);
  }

  let count = 0;
  for (const mig of pending) {
    try {
      await db.withTransactionAsync(async () => {
        await mig.up(db);
        await db.runAsync(
          'INSERT INTO schema_migrations (version, name) VALUES (?, ?);',
          mig.version,
          mig.name
        );
      });
      count++;
    } catch (migError) {
      throw new Error(
        `[ZeroDataLoss] Migration ${mig.version} (${mig.name}) failed: ${
          migError instanceof Error ? migError.message : String(migError)
        }. Backup retained at: ${backupFile || 'in-memory transaction rollback'}`
      );
    }
  }
  return count;
}
