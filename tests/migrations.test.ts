import { createNodeSqliteDatabase } from '../lib/db/adapters/nodeSqliteAdapter';
import { initDatabase } from '../lib/db/database';
import { runMigrations } from '../lib/db/migrations';

describe('Database Migration Engine', () => {
  it('applies all pending migrations idempotently', async () => {
    const db = await createNodeSqliteDatabase();
    await initDatabase(db);

    const appliedFirst = await runMigrations(db);
    expect(appliedFirst).toBeGreaterThanOrEqual(1);

    // Second run should apply 0
    const appliedSecond = await runMigrations(db);
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
});
