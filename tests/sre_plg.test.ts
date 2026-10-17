import { createNodeSqliteDatabase } from '../lib/db/adapters/nodeSqliteAdapter';
import { initDatabase } from '../lib/db/database';
import { runMigrations } from '../lib/db/migrations';
import { recordUserActivity, getActiveDaysCount, isWithinQuietHours } from '../lib/growth/retention';
import { SafeModeCircuitBreaker } from '../lib/sre/safeMode';

describe('PLG & SRE Reliability Layer', () => {
  it('records user activity in SQLite ledger correctly', async () => {
    const db = await createNodeSqliteDatabase();
    await initDatabase(db);
    await runMigrations(db);

    expect(await getActiveDaysCount(db)).toBe(0);

    await recordUserActivity(db, 'start_brew_day');
    expect(await getActiveDaysCount(db)).toBe(1);

    // Recording another activity on the same day should update count, not duplicate rows
    await recordUserActivity(db, 'record_sg');
    expect(await getActiveDaysCount(db)).toBe(1);

    const row = await db.getFirstAsync<{ actions_count: number; last_action_type: string }>(
      'SELECT actions_count, last_action_type FROM user_activity_days LIMIT 1;'
    );
    expect(row?.actions_count).toBe(2);
    expect(row?.last_action_type).toBe('record_sg');
  });

  it('correctly evaluates quiet hours', () => {
    const nightTime = new Date('2026-10-18T23:30:00');
    expect(isWithinQuietHours(nightTime)).toBe(true);

    const earlyMorning = new Date('2026-10-18T05:00:00');
    expect(isWithinQuietHours(earlyMorning)).toBe(true);

    const afternoon = new Date('2026-10-18T14:30:00');
    expect(isWithinQuietHours(afternoon)).toBe(false);
  });

  it('triggers safe mode when consecutive rapid crashes exceed threshold', () => {
    const breaker = new SafeModeCircuitBreaker();
    expect(breaker.isInSafeMode()).toBe(false);

    breaker.recordStartup();
    expect(breaker.isInSafeMode()).toBe(false);

    breaker.recordStartup();
    expect(breaker.isInSafeMode()).toBe(false);

    breaker.recordStartup();
    expect(breaker.isInSafeMode()).toBe(true);

    const tombstone = breaker.getTombstone(new Error('Fatal SQLite corruption'));
    expect(tombstone.safeModeTriggered).toBe(true);
    expect(tombstone.consecutiveCrashes).toBe(3);
    expect(tombstone.lastErrorMessage).toBe('Fatal SQLite corruption');

    breaker.markStartupSuccessful();
    expect(breaker.isInSafeMode()).toBe(false);
  });
});
