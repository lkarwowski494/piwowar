/**
 * Piwowar (Brewcraft) — BJCP 2021 Reference Repository
 * DEC-05: Pelna baza referencyjna offline
 */

import { DatabaseClient } from '../database';
import { BjcpStyle } from '../../types/domain';

export async function getAllBjcpStyles(db: DatabaseClient): Promise<BjcpStyle[]> {
  return db.getAllAsync<BjcpStyle>('SELECT * FROM bjcp_styles ORDER BY style_code ASC;');
}

export async function getBjcpStyleById(
  db: DatabaseClient,
  id: string
): Promise<BjcpStyle | null> {
  return db.getFirstAsync<BjcpStyle>('SELECT * FROM bjcp_styles WHERE id = ?;', id);
}

export async function searchBjcpStyles(
  db: DatabaseClient,
  query: string
): Promise<BjcpStyle[]> {
  const term = `%${query.trim()}%`;
  return db.getAllAsync<BjcpStyle>(
    `SELECT * FROM bjcp_styles 
     WHERE name LIKE ? OR style_code LIKE ? OR category LIKE ? 
     ORDER BY style_code ASC;`,
    term,
    term,
    term
  );
}
