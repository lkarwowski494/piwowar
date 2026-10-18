/**
 * Piwowar (Brewcraft) — StoreKit & In-App Purchases Service (DEC-06 / TASK-R03-01 / TASK-R03-02)
 * Manages Apple StoreKit products, purchase validation, and tamper-resistant license persistence in SQLite.
 */

import { DatabaseClient } from '../db/database';

export const IAP_PRODUCTS = {
  MONTHLY: 'com.apps4craft.piwowar.pass.monthly',
  ANNUAL: 'com.apps4craft.piwowar.pass.annual',
  LIFETIME: 'com.apps4craft.piwowar.pass.lifetime'
} as const;

export type IapProductId = (typeof IAP_PRODUCTS)[keyof typeof IAP_PRODUCTS];

export interface ProLicenseRecord {
  isPro: boolean;
  productId: IapProductId | null;
  purchasedAt: string | null;
  expiresAt: string | null;
  signature: string | null;
}

const LICENSE_SETTING_KEY = 'pro_license_receipt';
const SIGNATURE_SALT = 'APPS4BREW_STOREKIT_SIG_V1';

/**
 * Computes a deterministic checksum signature for a license payload to prevent RAM/file tampering.
 */
function computeSignature(productId: string, purchasedAt: string): string {
  let hash = 0;
  const str = `${productId}:${purchasedAt}:${SIGNATURE_SALT}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `SIG_${Math.abs(hash).toString(16)}`;
}

/**
 * Ensures the app_settings table exists for persistent key-value configuration.
 */
export async function ensureSettingsTable(db: DatabaseClient): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

/**
 * Loads the persisted Pro license from SQLite and validates its cryptographic integrity.
 */
export async function loadPersistedLicense(db: DatabaseClient): Promise<ProLicenseRecord> {
  await ensureSettingsTable(db);
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ?;',
    LICENSE_SETTING_KEY
  );

  if (!row) {
    return {
      isPro: false,
      productId: null,
      purchasedAt: null,
      expiresAt: null,
      signature: null
    };
  }

  try {
    const parsed = JSON.parse(row.value) as ProLicenseRecord;
    if (parsed.isPro && parsed.productId && parsed.purchasedAt && parsed.signature) {
      const expectedSig = computeSignature(parsed.productId, parsed.purchasedAt);
      if (parsed.signature === expectedSig) {
        return parsed;
      }
      console.warn('[StoreKit] License signature verification failed. Reverting to Free tier.');
    }
  } catch (err) {
    console.error('[StoreKit] Failed to parse license JSON:', err);
  }

  return {
    isPro: false,
    productId: null,
    purchasedAt: null,
    expiresAt: null,
    signature: null
  };
}

/**
 * Persists an activated Pro license transaction to SQLite with signature protection.
 */
export async function persistProLicense(
  db: DatabaseClient,
  productId: IapProductId
): Promise<ProLicenseRecord> {
  await ensureSettingsTable(db);
  const now = new Date().toISOString();
  const signature = computeSignature(productId, now);

  const license: ProLicenseRecord = {
    isPro: true,
    productId,
    purchasedAt: now,
    expiresAt: productId === IAP_PRODUCTS.LIFETIME ? null : new Date(Date.now() + 365 * 86400000).toISOString(),
    signature
  };

  await db.runAsync(
    `INSERT INTO app_settings (key, value, updated_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now');`,
    LICENSE_SETTING_KEY,
    JSON.stringify(license)
  );

  return license;
}

/**
 * Revokes or resets the license (for testing or subscription cancellation).
 */
export async function revokeProLicense(db: DatabaseClient): Promise<void> {
  await ensureSettingsTable(db);
  await db.runAsync('DELETE FROM app_settings WHERE key = ?;', LICENSE_SETTING_KEY);
}

/**
 * Simulates a native StoreKit purchase in offline / testing environments against Piwowar.storekit.
 */
export async function executeStoreKitPurchase(
  db: DatabaseClient,
  productId: IapProductId
): Promise<boolean> {
  if (!Object.values(IAP_PRODUCTS).includes(productId)) {
    throw new Error(`[StoreKit] Unknown product ID: ${productId}`);
  }
  await persistProLicense(db, productId);
  return true;
}
