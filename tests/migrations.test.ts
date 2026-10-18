import { copyFileSync, existsSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { createNodeSqliteDatabase } from '../lib/db/adapters/nodeSqliteAdapter';
import { initDatabase } from '../lib/db/database';
import { runMigrations, createMigrationBackup } from '../lib/db/migrations';
import { Batch } from '../lib/types/domain';

describe('Database Migration Engine', () => {
  it('applies all pending migrations idempotently', async () => {
    const db = await createNodeSqliteDatabase();
    await initDatabase(db);

    const appliedFirst = await runMigrations(db, { enableBackup: false });
    expect(appliedFirst).toBeGreaterThanOrEqual(1);

    // Second run should apply 0
    const appliedSecond = await runMigrations(db, { enableBackup: false });
    expect(appliedSecond).toBe(0);

    // Verify user_activity_days table exists from migration 2
    const testInsert = await db.runAsync(
      "INSERT INTO user_activity_days (activity_date, actions_count, last_action_type) VALUES ('2026-10-18', 1, 'mash_step');"
    );
    expect(testInsert.changes).toBe(1);

    const row = await db.getFirstAsync<{ activity_date: string; actions_count: number }>(
      "SELECT * FROM user_activity_days WHERE activity_date = '2026-10-18';"
    );
    expect(row).toBeDefined();
    expect(row?.activity_date).toBe('2026-10-18');
  });

  it('migrates a real physical v1.0 legacy database preserving 100% of user data (TASK-R10-01)', async () => {
    const fixturePath = resolve(__dirname, 'fixtures/v1.0-legacy.db');
    const testDbPath = resolve(__dirname, 'fixtures/v1.0-test-run.db');
    const backupDbPath = resolve(__dirname, 'fixtures/backup_pre_migration.db');
    if (!existsSync(fixturePath)) {
      require('../scripts/generate-legacy-fixture.cjs');
    }
    expect(existsSync(fixturePath)).toBe(true);

    // Clean up any stale test runs
    if (existsSync(testDbPath)) unlinkSync(testDbPath);
    if (existsSync(backupDbPath)) unlinkSync(backupDbPath);

    // Copy legacy database to test run path
    copyFileSync(fixturePath, testDbPath);

    const db = createNodeSqliteDatabase(testDbPath);

    // 1. Verify legacy state before migration: 2 batches, version 1
    const initialBatches = await db.getAllAsync<Batch>('SELECT * FROM batches ORDER BY batch_number ASC;');
    expect(initialBatches).toHaveLength(2);
    expect(initialBatches[0].name).toBe('Warka #1 — Premierowe Jasne');
    expect(initialBatches[0].measured_og_sg).toBe(1.049);
    expect(initialBatches[1].name).toBe('Warka #2 — Zimowy Koźlak');

    const initialMigrations = await db.getAllAsync<{ version: number }>('SELECT * FROM schema_migrations;');
    expect(initialMigrations).toHaveLength(1);
    expect(initialMigrations[0].version).toBe(1);

    // 2. Run migrations with backup creation
    const applied = await runMigrations(db, { backupPath: backupDbPath });
    expect(applied).toBe(2); // Migrations 2 and 3 applied

    // 3. Verify backup snapshot was created before migrations were run
    expect(existsSync(backupDbPath)).toBe(true);

    // 4. Verify 100% data preservation of batches after migration
    const postBatches = await db.getAllAsync<Batch>('SELECT * FROM batches ORDER BY batch_number ASC;');
    expect(postBatches).toHaveLength(2);
    expect(postBatches[0].id).toBe('batch-legacy-01');
    expect(postBatches[0].name).toBe('Warka #1 — Premierowe Jasne');
    expect(postBatches[0].status).toBe('bottled');
    expect(postBatches[0].measured_og_sg).toBe(1.049);
    expect(postBatches[0].measured_fg_sg).toBe(1.011);
    expect(postBatches[0].tasting_notes).toBe('Znakomita piana, zbalansowana goryczka');

    expect(postBatches[1].id).toBe('batch-legacy-02');
    expect(postBatches[1].name).toBe('Warka #2 — Zimowy Koźlak');
    expect(postBatches[1].status).toBe('fermenting_primary');

    // 5. Verify new v2 columns (parent_batch_id) work properly
    await db.runAsync(
      "UPDATE batches SET parent_batch_id = 'batch-legacy-01' WHERE id = 'batch-legacy-02';"
    );
    const updatedBatch = await db.getFirstAsync<Batch>("SELECT * FROM batches WHERE id = 'batch-legacy-02';");
    expect(updatedBatch?.parent_batch_id).toBe('batch-legacy-01');

    // 6. Verify new v2 tables exist and accept inserts
    await db.runAsync(
      "INSERT INTO user_activity_days (activity_date, actions_count, last_action_type) VALUES ('2026-10-18', 3, 'brew_day');"
    );
    const activity = await db.getFirstAsync<{ actions_count: number }>(
      "SELECT actions_count FROM user_activity_days WHERE activity_date = '2026-10-18';"
    );
    expect(activity?.actions_count).toBe(3);

    await db.runAsync(
      "INSERT INTO inventory_hops (id, name, alpha_acids_pct, weight_g, updated_at) VALUES ('hop-1', 'Lubelski', 4.2, 100.0, '2026-10-18T10:00:00Z');"
    );
    const hop = await db.getFirstAsync<{ name: string; weight_g: number }>(
      "SELECT name, weight_g FROM inventory_hops WHERE id = 'hop-1';"
    );
    expect(hop?.name).toBe('Lubelski');
    expect(hop?.weight_g).toBe(100.0);

    // Clean up test files
    try {
      if (existsSync(testDbPath)) unlinkSync(testDbPath);
      if (existsSync(backupDbPath)) unlinkSync(backupDbPath);
    } catch {
      // Ignore cleanup locks on Windows test run
    }
  });
});
