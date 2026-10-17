/**
 * Piwowar (Brewcraft) — Product-Led Growth & Offline Retention
 * 100% Private, Zero Tracking SDK, Local SQLite Activity Ledger
 */

import { DatabaseClient } from '../db/database';

export interface ActivityDay {
  activityDate: string;
  actionsCount: number;
  lastActionType: string | null;
}

export async function recordUserActivity(
  db: DatabaseClient,
  actionType: string
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  await db.runAsync(
    `INSERT INTO user_activity_days (activity_date, actions_count, last_action_type)
     VALUES (?, 1, ?)
     ON CONFLICT(activity_date) DO UPDATE SET
       actions_count = actions_count + 1,
       last_action_type = excluded.last_action_type;`,
    today,
    actionType
  );
}

export async function getActiveDaysCount(db: DatabaseClient): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM user_activity_days;'
  );
  return row?.count ?? 0;
}

export function isWithinQuietHours(date: Date = new Date()): boolean {
  const hours = date.getHours();
  // Quiet hours: 22:00 to 08:00
  return hours >= 22 || hours < 8;
}
